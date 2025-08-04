#!/bin/bash

echo "🚀 Starting Railway build process..."

# Install all dependencies (including dev dependencies)
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!" 