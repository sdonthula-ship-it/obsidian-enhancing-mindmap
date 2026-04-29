#!/bin/bash

# Build and Deploy script for Obsidian Enhancing Mindmap Plugin

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Plugin installation directory
PLUGIN_DIR="/Users/sdonthula/Library/CloudStorage/GoogleDrive-sumanth.d07@gmail.com/My Drive/Work/Work/.obsidian/plugins/obsidian-enhancing-mindmap"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

echo -e "${BLUE}🔨 Building plugin...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"

    echo -e "${BLUE}📦 Deploying to Obsidian...${NC}"

    # Create plugin directory if it doesn't exist
    mkdir -p "$PLUGIN_DIR"

    # Copy built files
    cp main.js "$PLUGIN_DIR/"
    cp manifest.json "$PLUGIN_DIR/"
    cp styles.css "$PLUGIN_DIR/"

    echo -e "${GREEN}✅ Deployed successfully to:${NC}"
    echo -e "${GREEN}   $PLUGIN_DIR${NC}"
    echo -e "${BLUE}💡 Reload Obsidian (Cmd+R) to see changes${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
