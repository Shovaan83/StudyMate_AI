const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const yauzl = require('yauzl');

class FileParserService {
  constructor() {
    this.supportedFormats = ['.txt', '.md', '.pdf', '.doc', '.docx', '.ppt', '.pptx'];
  }

  /**
   * Parse file content based on file extension
   * @param {Buffer} buffer - File buffer
   * @param {string} filename - Original filename
   * @returns {Promise<string>} - Extracted text content
   */
  async parseFile(buffer, filename) {
    const ext = path.extname(filename).toLowerCase();
    
    try {
      switch (ext) {
        case '.txt':
        case '.md':
          return this.parseTextFile(buffer);
        
        case '.pdf':
          return await this.parsePDF(buffer);
        
        case '.doc':
        case '.docx':
          return await this.parseDocx(buffer);
        
        case '.ppt':
        case '.pptx':
          return await this.parsePPTX(buffer);
        
        default:
          throw new Error(`Unsupported file format: ${ext}`);
      }
    } catch (error) {
      console.error(`Error parsing ${ext} file:`, error.message);
      throw new Error(`Failed to parse ${ext} file: ${error.message}`);
    }
  }

  /**
   * Parse plain text files
   * @param {Buffer} buffer - File buffer
   * @returns {string} - Text content
   */
  parseTextFile(buffer) {
    return buffer.toString('utf8');
  }

  /**
   * Parse PDF files
   * @param {Buffer} buffer - PDF file buffer
   * @returns {Promise<string>} - Extracted text
   */
  async parsePDF(buffer) {
    try {
      const data = await pdfParse(buffer);
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }
      return data.text;
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  /**
   * Parse DOCX files
   * @param {Buffer} buffer - DOCX file buffer
   * @returns {Promise<string>} - Extracted text
   */
  async parseDocx(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('No text content found in document');
      }
      return result.value;
    } catch (error) {
      throw new Error(`DOCX parsing failed: ${error.message}`);
    }
  }

  /**
   * Parse PPTX files
   * @param {Buffer} buffer - PPTX file buffer  
   * @returns {Promise<string>} - Extracted text from slides
   */
  async parsePPTX(buffer) {
    return new Promise((resolve, reject) => {
      let extractedText = '';
      
      yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(new Error(`Failed to open PPTX file: ${err.message}`));
          return;
        }

        const slideTexts = [];
        let pendingEntries = 0;

        zipfile.readEntry();

        zipfile.on('entry', (entry) => {
          // Looks for slide XML files
          if (entry.fileName.startsWith('ppt/slides/slide') && entry.fileName.endsWith('.xml')) {
            pendingEntries++;
            
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                pendingEntries--;
                if (pendingEntries === 0) {
                  this.finalizePPTXParsing(slideTexts, resolve, reject);
                }
                return;
              }

              let slideXml = '';
              readStream.on('data', (chunk) => {
                slideXml += chunk;
              });

              readStream.on('end', () => {
                const slideText = this.extractTextFromSlideXML(slideXml);
                if (slideText) {
                  slideTexts.push(slideText);
                }
                
                pendingEntries--;
                if (pendingEntries === 0) {
                  this.finalizePPTXParsing(slideTexts, resolve, reject);
                } else {
                  zipfile.readEntry();
                }
              });

              readStream.on('error', (err) => {
                pendingEntries--;
                if (pendingEntries === 0) {
                  this.finalizePPTXParsing(slideTexts, resolve, reject);
                } else {
                  zipfile.readEntry();
                }
              });
            });
          } else {
            zipfile.readEntry();
          }
        });

        zipfile.on('end', () => {
          if (pendingEntries === 0) {
            this.finalizePPTXParsing(slideTexts, resolve, reject);
          }
        });

        zipfile.on('error', (err) => {
          reject(new Error(`PPTX parsing error: ${err.message}`));
        });
      });
    });
  }

  /**
   * Finalize PPTX parsing and resolve with combined text
   * @param {string[]} slideTexts - Array of slide texts
   * @param {Function} resolve - Promise resolve function
   * @param {Function} reject - Promise reject function
   */
  finalizePPTXParsing(slideTexts, resolve, reject) {
    if (slideTexts.length === 0) {
      reject(new Error('No text content found in PPTX slides'));
      return;
    }
    
    const combinedText = slideTexts
      .map((text, index) => `--- Slide ${index + 1} ---\n${text}`)
      .join('\n\n');
    
    resolve(combinedText);
  }

  /**
   * Extract text content from slide XML
   * @param {string} xml - Slide XML content
   * @returns {string} - Extracted text
   */
  extractTextFromSlideXML(xml) {
    // Simple XML text extraction - gets content between <a:t> tags
    const textRegex = /<a:t[^>]*>(.*?)<\/a:t>/gs;
    const matches = xml.match(textRegex);
    
    if (!matches) return '';
    
    return matches
      .map(match => {
        // Extract text content and decode HTML entities
        const text = match.replace(/<a:t[^>]*>(.*?)<\/a:t>/s, '$1');
        return this.decodeHTMLEntities(text);
      })
      .filter(text => text.trim().length > 0)
      .join(' ');
  }

  /**
   * Decode common HTML entities
   * @param {string} text - Text with HTML entities
   * @returns {string} - Decoded text
   */
  decodeHTMLEntities(text) {
    const entities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    };
    
    return text.replace(/&[#\w]+;/g, (entity) => {
      return entities[entity] || entity;
    });
  }

  /**
   * Validate file format
   * @param {string} filename - Original filename
   * @returns {boolean} - Whether format is supported
   */
  isSupported(filename) {
    const ext = path.extname(filename).toLowerCase();
    return this.supportedFormats.includes(ext);
  }

  /**
   * Get supported file formats for display
   * @returns {string[]} - Array of supported extensions
   */
  getSupportedFormats() {
    return [...this.supportedFormats];
  }
}

module.exports = new FileParserService();