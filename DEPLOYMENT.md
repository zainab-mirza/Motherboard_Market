# 🚀 Vercel Deployment Guide

## Quick Deploy to Vercel

### Method 1: One-Click Deploy (Recommended)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

2. **Deploy via Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration
   - Click "Deploy"

### Method 2: Vercel CLI

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
# Development deployment
vercel

# Production deployment
vercel --prod
```

## 📁 Project Structure for Vercel

```
├── api/                    # Vercel serverless functions
│   └── index.ts           # Main API entry point
├── public/                # Static files (auto-served)
│   ├── index.html         # Frontend
│   ├── script.js          # JavaScript
│   └── styles.css         # Styles
├── src/                   # Source code
│   ├── engines/           # Core engines
│   ├── models/            # Data models
│   └── server.ts          # Express server
├── vercel.json            # Vercel configuration
├── .vercelignore          # Files to ignore
└── package.json           # Dependencies
```

## ⚙️ Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "public/$1"
    }
  ],
  "functions": {
    "api/index.ts": {
      "maxDuration": 30
    }
  }
}
```

### api/index.ts
```typescript
// Vercel serverless function entry point
import app from '../src/server';

export default app;
```

## 🔧 Environment Variables

No environment variables are required for basic deployment. The application works out of the box.

## 🌐 Domain Configuration

After deployment:

1. **Custom Domain (Optional):**
   - Go to your project dashboard on Vercel
   - Click "Settings" → "Domains"
   - Add your custom domain
   - Configure DNS records as instructed

2. **HTTPS:**
   - Automatically enabled by Vercel
   - SSL certificates are auto-generated

## 📊 Monitoring & Analytics

1. **Function Logs:**
   - Available in Vercel dashboard
   - Real-time function execution logs

2. **Performance:**
   - Built-in analytics in Vercel dashboard
   - Response times and error rates

## 🚨 Troubleshooting

### Common Issues:

1. **Build Errors:**
   - Check TypeScript compilation: `npx tsc --noEmit`
   - Verify all dependencies are in package.json

2. **API Routes Not Working:**
   - Ensure api/index.ts exports the Express app
   - Check vercel.json routing configuration

3. **Static Files Not Loading:**
   - Verify files are in public/ directory
   - Check file paths in HTML/CSS

### Debug Commands:
```bash
# Test locally
npm run serve

# Check TypeScript
npx tsc --noEmit

# Test API endpoints
node test-api.js
node test-server.js
```

## 🎯 Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] API endpoints respond (test /api/health)
- [ ] Component search works
- [ ] All 7 engines are functional
- [ ] BIOS interface displays properly
- [ ] Mobile responsiveness works

## 📈 Performance Optimization

1. **Cold Start Optimization:**
   - Functions warm up automatically
   - Consider upgrading to Pro for better performance

2. **Caching:**
   - Static files cached automatically
   - API responses can be cached with headers

3. **Bundle Size:**
   - Already optimized for serverless deployment
   - No additional bundling required

## 🔄 Continuous Deployment

Set up automatic deployments:

1. **GitHub Integration:**
   - Connect repository to Vercel
   - Auto-deploy on push to main branch

2. **Branch Previews:**
   - Automatic preview deployments for PRs
   - Test changes before merging

## 📞 Support

If you encounter issues:

1. Check Vercel documentation
2. Review function logs in dashboard
3. Test locally first with `npm run serve`
4. Verify all files are committed to git

---

**🎉 Your Lamington Road Market is now live on Vercel!**