#!/bin/bash

# Fix permissions for .env.local file
cd "$(dirname "$0")"

echo "🔧 Fixing permissions for .env.local..."

# Remove extended attributes
if [ -f .env.local ]; then
    xattr -rc .env.local 2>/dev/null || echo "⚠️  Could not remove extended attributes (may need sudo)"
    
    # Fix file permissions
    chmod 644 .env.local 2>/dev/null || echo "⚠️  Could not change permissions (may need sudo)"
    
    echo "✅ Permissions fixed!"
    echo ""
    echo "Now try running: npm run dev"
else
    echo "ℹ️  .env.local file not found, creating it..."
    echo "VITE_API_URL=http://localhost:3000" > .env.local
    chmod 644 .env.local
    echo "✅ Created .env.local file"
fi
