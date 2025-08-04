#!/bin/bash

echo "🚀 CulosAI Deployment Script"
echo "=============================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

echo "✅ Git repository found"

# Check if we have a remote origin
if ! git remote get-url origin &> /dev/null; then
    echo "❌ No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/culosai.git"
    exit 1
fi

echo "✅ Remote origin found"

# Build the project
echo "🔨 Building the project..."

# Build backend
echo "Building backend..."
cd server
npm install
npm run build
cd ..

# Build frontend
echo "Building frontend..."
cd client
npm install
npm run build
cd ..

echo "✅ Build completed successfully"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy: $(date)"
git push origin main

echo "✅ Code pushed to GitHub"

echo ""
echo "🎉 Deployment preparation completed!"
echo ""
echo "Next steps:"
echo "1. Go to https://railway.app and sign up"
echo "2. Connect your GitHub repository"
echo "3. Create a new project and select your repository"
echo "4. Set up environment variables (see DEPLOYMENT.md)"
echo "5. Deploy your backend"
echo "6. Go to https://vercel.com and deploy your frontend"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md" 