#!/bin/bash

# ==============================================================================
# 🛠️ MySakn Tools Installer
# ==============================================================================
# Automates installation of:
# 1. Prometheus & Grafana (kube-prometheus-stack)
# 2. ArgoCD
# 3. ELK Stack (Elasticsearch, Logstash, Kibana)
# ==============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🛠️  Initializing MySakn Tools Installer...${NC}"

# Check for Helm
if ! command -v helm &> /dev/null; then
    echo -e "${RED}❌ Helm is not installed. Please install Helm first.${NC}"
    exit 1
fi

# Add Helm Repositories
echo -e "${YELLOW}Updates Helm Repositories...${NC}"
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add argo https://argoproj.github.io/argo-helm
helm repo add elastic https://helm.elastic.co
helm repo update
echo -e "${GREEN}✅ Repositories Updated.${NC}"

# Function to install Prometheus/Grafana
install_monitoring() {
    echo -e "${YELLOW}Installing Prometheus & Grafana...${NC}"
    kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
    helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
        --namespace monitoring \
        --set grafana.service.type=NodePort \
        --set prometheus.service.type=NodePort
    echo -e "${GREEN}✅ Monitoring Stack Installed.${NC}"
}

# Function to install ArgoCD
install_argocd() {
    echo -e "${YELLOW}Installing ArgoCD...${NC}"
    kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
    helm upgrade --install argo-cd argo/argo-cd \
        --namespace argocd \
        --set server.service.type=NodePort
    echo -e "${GREEN}✅ ArgoCD Installed.${NC}"
    
    # Wait for password
    echo "   To get ArgoCD admin password, run:"
    echo "   kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath=\"{.data.password}\" | base64 -d"
}

# Function to install ELK Stack
install_elk() {
    echo -e "${YELLOW}Installing ELK Stack (Elasticsearch, Logstash, Kibana)...${NC}"
    kubectl create namespace logging --dry-run=client -o yaml | kubectl apply -f -
    
    # Elasticsearch
    echo "   - Installing Elasticsearch (this may take a while)..."
    helm upgrade --install elasticsearch elastic/elasticsearch \
        --namespace logging \
        -f infra/k8s/elk/values.yaml --create-namespace
 
        
    # Kibana
    echo "   - Installing Kibana..."
    helm upgrade --install kibana elastic/kibana \
        --namespace logging \
        --set service.type=NodePort

    echo -e "${GREEN}✅ ELK Stack Installed.${NC}"
}

# ==============================================================================
# Interactive Installation with Yes/No Prompts
# ==============================================================================
echo ""
echo -e "${YELLOW}Select tools to install (answer yes/no for each):${NC}"
echo ""

# Prometheus & Grafana
read -p "📊 Install Prometheus & Grafana? (yes/no): " install_prom
if [[ "$install_prom" =~ ^[Yy](es)?$ ]]; then
    install_monitoring
fi

# ArgoCD
read -p "🚀 Install ArgoCD? (yes/no): " install_argo
if [[ "$install_argo" =~ ^[Yy](es)?$ ]]; then
    install_argocd
fi

# ELK Stack
read -p "📝 Install ELK Stack (Elasticsearch + Kibana)? (yes/no): " install_elk_choice
if [[ "$install_elk_choice" =~ ^[Yy](es)?$ ]]; then
    install_elk
fi

echo ""
echo -e "${GREEN}🚀 Tools installation process completed.${NC}"
echo ""
echo "Access your tools:"
if [[ "$install_prom" =~ ^[Yy](es)?$ ]]; then
    echo "  📊 Grafana: minikube service kube-prometheus-stack-grafana -n monitoring"
    echo "  📊 Prometheus: minikube service kube-prometheus-stack-prometheus -n monitoring"
fi
if [[ "$install_argo" =~ ^[Yy](es)?$ ]]; then
    echo "  🚀 ArgoCD: kubectl port-forward svc/argocd-server -n argocd 8080:443"
    echo "     Password: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
fi
if [[ "$install_elk_choice" =~ ^[Yy](es)?$ ]]; then
    echo "  � Kibana: kubectl port-forward svc/kibana-kibana -n logging 5601:5601"
fi
echo ""
