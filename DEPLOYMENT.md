# Vercel Deployment Guide for StudyMate AI

## � IMPORTANT: Fixing Environment Variable Error

If you get the error:
```
Environment Variable "DEEPSEEK_API_KEY" references Secret "deepseek_api_key", which does not exist.
```

**Solution Steps:**
1. **Clear Vercel Cache**: Delete the project from Vercel and re-import
2. **OR** Go to Project Settings → General → Reset to clear cache
3. **Make sure NO secrets are configured** - we use regular environment variables

## �📋 Step-by-Step Deployment Instructions

### 1. Prepare for Deployment
Your code is already pushed to GitHub. ✅

### 2. Import to Vercel (Fresh Import Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Sign in with your GitHub account
3. Click "Add New..." → "Project"
4. Import your `StudyMate` repository
5. **Important**: If project exists, delete it first and re-import

### 3. Configure Build & Output Settings

#### Framework Preset: 
- **Framework Preset**: `Other` (do not select React)
- **Root Directory**: `./` (leave empty - use root)

#### Build Settings:
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `frontend/build`
- **Install Command**: `npm install`

#### Advanced Settings:
- **Node.js Version**: `18.x` (recommended)
- **Function Region**: `Washington, D.C. (iad1)`

### 4. Environment Variables (Critical - Use Regular Variables, NOT Secrets!)

**VERY IMPORTANT**: Add these as **Environment Variables**, NOT as Secrets!

In Vercel Dashboard → Project → Settings → Environment Variables:

**Click "Add New" for each:**

```
Name: DEEPSEEK_API_KEY
Value: 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
Environments: ✅ Production ✅ Preview ✅ Development

Name: OPENROUTER_API_URL  
Value: https://openrouter.ai/api/v1
Environments: ✅ Production ✅ Preview ✅ Development

Name: REQUESTS_PER_MINUTE
Value: 20
Environments: ✅ Production ✅ Preview ✅ Development

Name: REQUESTS_PER_DAY
Value: 1000
Environments: ✅ Production ✅ Preview ✅ Development

Name: NODE_ENV
Value: production
Environments: ✅ Production

Name: MAX_TOKENS_PER_REQUEST
Value: 32000
Environments: ✅ Production ✅ Preview ✅ Development
```

**⚠️ DO NOT:**
- Use the "Secrets" section
- Reference any @secret_name variables
- Use the old vercel secrets CLI commands

### 5. Deploy!
- Click "Deploy" 
- Wait for build to complete (~2-3 minutes)
- Your app will be available at `https://your-app-name.vercel.app`

## 🔍 Verification Checklist

After deployment, test these features:
- [ ] Homepage loads correctly
- [ ] Text summarization works
- [ ] File upload (PDF/DOCX/PPTX) works  
- [ ] Quiz generation functions
- [ ] Motivational messages appear
- [ ] API health check: `https://your-app.vercel.app/api/health`

## 🚨 Common Issues & Solutions

### Build Fails:
- Check environment variables are set correctly
- Ensure all dependencies are in package.json
- Check build logs in Vercel dashboard

### API Not Working:
- Verify DEEPSEEK_API_KEY is set correctly
- Check function logs in Vercel dashboard
- Test API endpoint: `/api/ai/health`

### File Upload Issues:
- Remember: 5MB limit on Vercel free tier
- Files are processed in memory (temporary storage)
- Large files may cause timeout (30s function limit)

## 📊 Performance Notes

- Static files served via Vercel CDN
- API functions run on-demand (cold starts possible)
- File processing happens in serverless functions
- Rate limiting: 20 req/min, 1000 req/day

Your StudyMate AI is now production-ready! 🚀