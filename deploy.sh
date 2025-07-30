#!/bin/bash
SERVER_IP="172.235.26.49"
SERVER_USER="chiru"
APP_NAME="splitbuddy"
DEPLOY_PATH="/home/$SERVER_USER/apps/$APP_NAME"
# Increment package version
echo "bump patch version"
# Using jq to bump patch version without git
CURRENT_VERSION=$(jq -r '.version' package.json)
NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{$NF = $NF + 1;} 1' | sed 's/ /./g')
jq --arg version "$NEW_VERSION" '.version = $version' package.json > tmp.json && mv tmp.json package.json
echo "Version bumped from $CURRENT_VERSION to $NEW_VERSION"

# Ensure file system is synced and version is updated
sync
sleep 1
echo "Current package.json version: $(jq -r '.version' package.json)"

echo "🚀 Building application..."
npm run build

echo "📦 Creating deployment package..."
tar -czf deploy.tar.gz dist/ package*.json ecosystem.config.cjs .env tsconfig.json


echo "📤 Uploading to server..."
scp deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

echo "🔧 Deploying on server..."

ssh $SERVER_USER@$SERVER_IP "DEPLOY_PATH='$DEPLOY_PATH' NEW_VERSION='$NEW_VERSION' bash -s" << 'EOF'
echo "Running uploaded script..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # Optional

nvm use node
# Create directory if not exists
mkdir -p "$DEPLOY_PATH"
cd "$DEPLOY_PATH"

echo "Current directory on server: $(pwd)"

# Extract new files
tar -xzf /tmp/deploy.tar.gz --overwrite --recursive-unlink 

# Install production dependencies
npm install --force

# Create logs directory
mkdir -p logs

# Start/Restart with PM2
pm2 reload splitbuddy || pm2 start ecosystem.config.cjs --name splitbuddy --env production

# Save PM2 configuration
pm2 save

echo "✅ Deployment complete!"
pm2 status
EOF

# Cleanup
rm deploy.tar.gz

echo "🎉 Application deployed successfully!"