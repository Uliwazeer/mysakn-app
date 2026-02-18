#!/bin/bash

# Quick Frontend Rebuild Script
# Use this when you edit nginx.conf or any frontend files

echo "🔄 Rebuilding Frontend with latest changes..."

# Step 1: Configure Docker to use Minikube
eval $(minikube docker-env)

# Step 2: Delete old image
echo "1️⃣ Deleting old image..."
docker rmi -f mysakn-frontend:latest 2>/dev/null || true

# Step 3: Build new image
echo "2️⃣ Building new image..."
cd ../apps/frontend
minikube image build -t mysakn-frontend:latest .

# Step 4: Delete frontend pods to force recreation
echo "3️⃣ Restarting frontend pods..."
kubectl delete pods -n mysakn-app -l app=frontend

echo ""
echo "✅ Done! Wait 20 seconds then open:"
echo "   http://192.168.49.2:30080"
