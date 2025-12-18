#!/bin/bash

# 🚀 Ironclad Fitness GMS Deployment Script
# This script handles the complete deployment process

echo "🏋️‍♂️ Ironclad Fitness GMS - Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    if ! command -v firebase &> /dev/null; then
        print_warning "Firebase CLI is not installed. Installing..."
        npm install -g firebase-tools
    fi
    
    print_success "All dependencies are available"
}

# Install project dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Check environment configuration
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "Please update .env file with your Firebase and Gemini API keys"
            print_warning "Deployment will continue, but the app may not work without proper configuration"
        else
            print_error ".env.example file not found. Please create .env file manually"
            exit 1
        fi
    else
        print_success "Environment configuration found"
    fi
}

# Build the project
build_project() {
    print_status "Building the project..."
    
    if npm run build; then
        print_success "Project built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Deploy Firestore rules
deploy_firestore_rules() {
    print_status "Deploying Firestore security rules..."
    
    if firebase deploy --only firestore:rules; then
        print_success "Firestore rules deployed successfully"
    else
        print_warning "Failed to deploy Firestore rules. Please check your Firebase configuration"
    fi
}

# Deploy to Firebase Hosting
deploy_hosting() {
    print_status "Deploying to Firebase Hosting..."
    
    if firebase deploy --only hosting; then
        print_success "Application deployed to Firebase Hosting successfully"
    else
        print_error "Failed to deploy to Firebase Hosting"
        exit 1
    fi
}

# Deploy everything
deploy_all() {
    print_status "Deploying everything (Firestore rules + Hosting)..."
    
    if firebase deploy; then
        print_success "Complete deployment successful"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Main deployment function
main() {
    echo ""
    print_status "Starting deployment process..."
    echo ""
    
    # Check dependencies
    check_dependencies
    echo ""
    
    # Install project dependencies
    install_dependencies
    echo ""
    
    # Check environment
    check_environment
    echo ""
    
    # Build project
    build_project
    echo ""
    
    # Ask user what to deploy
    echo "What would you like to deploy?"
    echo "1) Firestore rules only"
    echo "2) Hosting only"
    echo "3) Everything (Firestore rules + Hosting)"
    echo ""
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            deploy_firestore_rules
            ;;
        2)
            deploy_hosting
            ;;
        3)
            deploy_all
            ;;
        *)
            print_error "Invalid choice. Please run the script again and select 1, 2, or 3."
            exit 1
            ;;
    esac
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    print_status "Your Ironclad Fitness GMS is now live!"
    print_status "You can access it at your Firebase Hosting URL"
    echo ""
    print_status "Next steps:"
    echo "  1. Test all functionality in production"
    echo "  2. Configure custom domain (if needed)"
    echo "  3. Set up monitoring and analytics"
    echo "  4. Train your staff on the new system"
    echo ""
    print_success "Happy gym managing! 💪"
}

# Run main function
main