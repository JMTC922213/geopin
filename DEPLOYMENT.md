# Google Cloud Platform Deployment Guide

## Prerequisites
1. Google Cloud account with billing enabled
2. gcloud CLI installed: https://cloud.google.com/sdk/docs/install
3. Git repository set up

## Backend Deployment to Google App Engine

### Step 1: Install and Initialize gcloud CLI
```bash
# Install gcloud CLI (if not already installed)
# Visit: https://cloud.google.com/sdk/docs/install

# Login to your Google account
gcloud auth login

# Set your project ID (replace with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Or create a new project
gcloud projects create ierg3840-final-project
gcloud config set project ierg3840-final-project
```

### Step 2: Enable Required APIs
```bash
# Enable App Engine API
gcloud services enable appengine.googleapis.com

# Initialize App Engine
gcloud app create --region=asia-east2
```

### Step 3: Configure Environment Variables
1. Edit `backend/app.yaml`
2. Add your MongoDB connection string:
```yaml
env_variables:
  MONGODB_URI: 'your-mongodb-atlas-connection-string'
```

### Step 4: Deploy Backend
```bash
# Navigate to backend directory
cd backend

# Deploy to App Engine
gcloud app deploy app.yaml

# View deployment
gcloud app browse
```

Your backend will be available at:
`https://YOUR_PROJECT_ID.appspot.com`

### Step 5: Update Frontend API URL
After deployment, update your frontend to use the deployed backend URL:

In `frontend/src/components/Auth/Login.jsx`, `Registration.jsx`, `Profile.jsx`:
```javascript
// Change from:
const response = await fetch('http://localhost:53840/auth', ...)

// To:
const response = await fetch('https://YOUR_PROJECT_ID.appspot.com/auth', ...)
```

## Deployment Verification

### Check if backend is running:
```bash
# View logs
gcloud app logs tail

# Check service status
gcloud app describe

# Test the API
curl https://YOUR_PROJECT_ID.appspot.com/
```

### Expected Response:
```
Final Project API Server
Available endpoints:
- POST /auth
- POST /register
- GET /locations
- POST /locations
- GET /profile/:email
- PUT /profile/:email
```

## Common Issues

### Issue 1: Port Configuration
App Engine requires port 8080. Make sure `backend/app.mjs` reads from environment:
```javascript
const PORT = process.env.PORT || 53840;
```

### Issue 2: MongoDB Connection
- Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Or whitelist Google Cloud IP ranges

### Issue 3: Build Errors
If deployment fails, check:
```bash
# Validate app.yaml
gcloud app deploy --validate-only

# Check build logs
gcloud app logs read
```

## Cost Management
- F1 instance is within free tier (28 hours/day)
- Stop instances when not in use:
```bash
gcloud app services delete default
```

## Points Achievement
✓ Successfully deploying to GCP with public URL = **5 points**

Remember to include the public URL in your project report!
