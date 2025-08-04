@echo off
echo 🚀 CulosAI Deployment Script
echo ==============================

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Check if we're in a git repository
if not exist ".git" (
    echo ❌ Not in a git repository. Please initialize git first:
    echo    git init
    echo    git add .
    echo    git commit -m "Initial commit"
    pause
    exit /b 1
)

echo ✅ Git repository found

REM Check if we have a remote origin
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ❌ No remote origin found. Please add your GitHub repository:
    echo    git remote add origin https://github.com/yourusername/culosai.git
    pause
    exit /b 1
)

echo ✅ Remote origin found

REM Build the project
echo 🔨 Building the project...

REM Build backend
echo Building backend...
cd server
call npm install
call npm run build
cd ..

REM Build frontend
echo Building frontend...
cd client
call npm install
call npm run build
cd ..

echo ✅ Build completed successfully

REM Push to GitHub
echo 📤 Pushing to GitHub...
git add .
git commit -m "Deploy: %date% %time%"
git push origin main

echo ✅ Code pushed to GitHub

echo.
echo 🎉 Deployment preparation completed!
echo.
echo Next steps:
echo 1. Go to https://railway.app and sign up
echo 2. Connect your GitHub repository
echo 3. Create a new project and select your repository
echo 4. Set up environment variables (see DEPLOYMENT.md)
echo 5. Deploy your backend
echo 6. Go to https://vercel.com and deploy your frontend
echo.
echo For detailed instructions, see DEPLOYMENT.md
pause 