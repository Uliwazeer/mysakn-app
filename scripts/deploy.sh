#!/bin/bash

# ==============================================================================
# 🚀 MySakn Deployment Script - Created by Ali Wazeer
# Smart Housing Platform & Community Hub
# DevSecOps Engineering Standards
# ==============================================================================

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Helper for structured output
print_step_header() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${MAGENTA}                $1 ${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    sleep 2
}

# Fix Minikube PATH issue
export PATH=$PATH:/usr/local/bin

# Ensure we are in the project root
cd "$(dirname "$0")/.."

# Clear screen for clean output
clear

# Enhanced Welcome Banner
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                                          ║${NC}"
echo -e "${CYAN}║${BOLD}                        🏠 Welcome to MySakn! 🏠                         ${NC}${CYAN}║${NC}"
echo -e "${CYAN}║                                                                          ║${NC}"
echo -e "${CYAN}║${YELLOW}              Your Smart Housing Platform & Community Hub                 ${NC}${CYAN}║${NC}"
echo -e "${CYAN}║                                                                          ║${NC}"
echo -e "${CYAN}║${MAGENTA}      Connecting Students • Medical Workers • Job Seekers • Professionals ${NC}${CYAN}║${NC}"
echo -e "${CYAN}║                                                                          ║${NC}"
echo -e "${CYAN}║   ${GREEN}✓${NC} Find Your Perfect Home        ${GREEN}✓${NC} Connect with Roommates           ${CYAN}║${NC}"
echo -e "${CYAN}║   ${GREEN}✓${NC} Verified Listings             ${GREEN}✓${NC} Secure Booking System            ${CYAN}║${NC}"
echo -e "${CYAN}║   ${GREEN}✓${NC} Near Universities/Hospitals   ${GREEN}✓${NC} 24/7 Support & Community         ${CYAN}║${NC}"
echo -e "${CYAN}║                                                                          ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║                                                                          ║${NC}"
echo -e "${CYAN}║${BOLD}           Developed by: ${YELLOW}Ali Wazeer${NC}${BOLD} | DevSecOps Engineer                   ${NC}${CYAN}║${NC}"
echo -e "${CYAN}║${BOLD}           Owner of the MySakn Platform                                   ${NC}${CYAN}║${NC}"
echo -e "${CYAN}║                                                                          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}${GREEN}🚀 Initializing MySakn Deployment Sequence...${NC}"
echo -e "${YELLOW}   Platform Version: 1.0.0 | Architecture: 5-Tier Microservices${NC}"
echo ""
sleep 1

# ==============================================================================
# Step 1: Deployment Options
# ==============================================================================
print_step_header "Step 1: Deployment Options & Environment Setup"

# Environment Selection
echo "Select Deployment Environment:"
echo "1) Local (Minikube)"
echo "2) Cloud (AWS EKS)"

while true; do
    read -p "Enter choice [1 or 2]: " env_choice
    if [ "$env_choice" == "1" ] || [ "$env_choice" == "2" ]; then break; else echo -e "${RED}❌ Invalid choice!${NC}"; fi
done

echo ""

# First Time Deployment Selection
echo "Is this your first time deploying MySakn?"
echo "y) Yes (Fresh install - Skip cleanup)"
echo "n) No  (Re-deploy - Perform full cleanup/reset)"

while true; do
    read -p "Enter choice [y/n]: " first_deploy
    if [ "$first_deploy" == "y" ] || [ "$first_deploy" == "n" ]; then break; else echo -e "${RED}❌ Invalid choice!${NC}"; fi
done

# ==============================================================================
# Step 2: Cleanup (Conditional)
# ==============================================================================
if [ "$first_deploy" == "n" ]; then
    print_step_header "Step 2: Cleaning up previous deployments"
    
    # 1. Clean up K8s Namespace
    echo "   - Deleting Kubernetes Namespace (mysakn-app)..."
    kubectl delete namespace mysakn-app --ignore-not-found=true 2>/dev/null &

    # 2. Clean up Docker Compose (if used)
    if [ -f "docker-compose.yml" ]; then
        echo "   - Stopping active Docker Compose containers..."
        docker-compose down --remove-orphans 2>/dev/null || true
    fi

    # 3. Wait for namespace termination
    echo "   Waiting for namespace termination..."
    while kubectl get namespace mysakn-app &> /dev/null 2>&1; do
        sleep 2
        echo -n "."
    done
    echo ""
    echo -e "${GREEN}✅ Cleanup complete.${NC}"
else
    echo -e "${GREEN}\n✨ Skipping cleanup for fresh deployment.${NC}"
fi

# ==============================================================================
# Step 3: Environment Configuration
# ==============================================================================
print_step_header "Step 3: Environment Authentication & Connection"

if [ "$env_choice" == "2" ]; then
    echo -e "${YELLOW}☁️  Configuring for AWS EKS...${NC}"
    read -sp "Enter AWS Access Key ID: " AWS_ACCESS_KEY_ID; echo
    read -sp "Enter AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY; echo
    read -p "Enter AWS Region (default: us-east-1): " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-east-1}

    export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
    export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
    export AWS_DEFAULT_REGION=$AWS_REGION

    echo "   Verifying AWS identity..."
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ Invalid AWS Credentials.${NC}"
        exit 1
    fi
    
    echo "   Updating kubeconfig for EKS..."
    aws eks update-kubeconfig --name mysakn-cluster --region $AWS_REGION
    echo -e "${GREEN}✅ Connected to EKS Cluster.${NC}"
else
    echo -e "${YELLOW}🏠 Configuring for Local Minikube...${NC}"

    # Check if Minikube is running
    if ! minikube status | grep -q "Running"; then
        echo -e "${RED}❌ Minikube is not running!${NC}"
        echo "Please start it with: minikube start"
        exit 1
    fi
    echo "✅ Minikube is running."
    
    # Configure Docker to use Minikube's daemon
    echo "   Configuring shell to use Minikube's Docker daemon..."
    eval $(minikube docker-env)
fi

# ==============================================================================
# ==============================================================================
# Step 4: Build System Initialization
# ==============================================================================
print_step_header "Step 4: Preparing Build Environment"

# Clean old images to force fresh builds
echo "🧹 Cleaning old images and resetting build cache..."
docker rmi -f mysakn-frontend:latest 2>/dev/null || true
docker rmi -f auth-service:latest 2>/dev/null || true
docker rmi -f housing-service:latest 2>/dev/null || true
docker rmi -f booking-service:latest 2>/dev/null || true
docker rmi -f notification-service:latest 2>/dev/null || true

# Function to build image logs success/fail
build_image() {
    SERVICE_NAME=$1
    SERVICE_PATH=$2
    echo -e "🔨 Building ${SERVICE_NAME}..."

    if ! command -v minikube &> /dev/null; then
        MINIKUBE_BIN="/usr/local/bin/minikube"
    else
        MINIKUBE_BIN="minikube"
    fi

    $MINIKUBE_BIN image build -t ${SERVICE_NAME}:latest ${SERVICE_PATH}
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✅ ${SERVICE_NAME} built successfully.${NC}"
    else
        echo -e "${RED}   ❌ Failed to build ${SERVICE_NAME}.${NC}"
        exit 1
    fi
}

# Build sequence (only for Local deployment)
if [ "$env_choice" == "1" ]; then
    print_step_header "Step 5: Building auth-service (Backend Core)"
    build_image "auth-service" "apps/backend/auth-service"

    print_step_header "Step 6: Building housing-service (Listings Management)"
    build_image "housing-service" "apps/backend/housing-service"

    print_step_header "Step 7: Building booking-service (Transaction Engine)"
    build_image "booking-service" "apps/backend/booking-service"

    print_step_header "Step 8: Building notification-service (Comm Service)"
    build_image "notification-service" "apps/backend/notification-service"

    print_step_header "Step 9: Building mysakn-frontend (Gateway/UI)"
    build_image "mysakn-frontend" "apps/frontend"
    
    echo -e "${GREEN}✅ All microservices built and synchronized.${NC}"
fi

# ==============================================================================
# Step 10: Kubernetes Orchestration
# ==============================================================================
print_step_header "Step 10: Deploying 5-Tier Architecture to K8s"

# Apply Namespace
echo "   Creating Namespace..."
kubectl apply -f infra/k8s/namespace.yaml

# Apply Kafka (Infrastructure)
echo -e "   Deploying ${GREEN}Kafka Cluster (Kraft)${NC} & ${GREEN}Kafka UI${NC}..."
kubectl apply -f infra/k8s/kafka/

# Apply Core Services & Databases
echo -e "   Deploying ${GREEN}Microservices${NC} & ${GREEN}MongoDB${NC}..."
kubectl apply -f infra/k8s/

# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

# ==============================================================================
# 🎉 Deployment Complete
# ==============================================================================
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                          ║${NC}"
echo -e "${GREEN}║${BOLD}                   🎉 Deployment Completed Successfully! 🎉                ${NC}${GREEN}║${NC}"
echo -e "${GREEN}║                                                                          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}${BOLD}📍 Access Your MySakn Platform:${NC}"
echo ""
echo -e "   ${YELLOW}🌐 Frontend Application:${NC}"
echo -e "      http://${MINIKUBE_IP}:30080"
echo ""
echo -e "   ${YELLOW}🔧 Backend Services:${NC}"
echo -e "      • Auth Service:    http://${MINIKUBE_IP}:30001"
echo -e "      • Housing Service: http://${MINIKUBE_IP}:30002"
echo -e "      • Booking Service: http://${MINIKUBE_IP}:30003"
echo ""
echo -e "   ${YELLOW}📊 Monitoring & Tools:${NC}"
echo -e "      • Kafka UI:        http://${MINIKUBE_IP}:30090"
echo ""
echo -e "${CYAN}${BOLD}📋 Quick Commands:${NC}"
echo ""
echo -e "   ${GREEN}•${NC} Check pods:     ${YELLOW}kubectl get pods -n mysakn-app${NC}"
echo -e "   ${GREEN}•${NC} View logs:      ${YELLOW}kubectl logs -f <pod-name> -n mysakn-app${NC}"
echo -e "   ${GREEN}•${NC} Install tools:  ${YELLOW}./scripts/tools.sh${NC}"
echo ""
echo -e "${MAGENTA}${BOLD}💡 Platform Features & DevSecOps Standards:${NC}"
echo -e "   ✓ High-Availability Microservices Architecture"
echo -e "   ✓ CI/CD Ready Infrastructure with K8s"
echo -e "   ✓ Real-time Event Streaming via Kafka"
echo -e "   ✓ Persistent MongoDB Data Layer"
echo -e "   ✓ Automated Security Checks & Health Monitoring"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}Platform Created by: ${YELLOW}Ali Wazeer${NC}${BOLD} | DevSecOps Engineer${NC}"
echo -e "${BOLD}Thank you for using MySakn! Happy Housing! 🏡${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

