#!/bin/bash
# MySakn Signup Diagnostic Script
# Created by Ali Wazeer | DevSecOps Engineer

NAMESPACE="mysakn-app"

echo "----------------------------------------------------------------"
echo "🔍 MySakn Signup Diagnostics"
echo "----------------------------------------------------------------"

echo "[1/4] Checking Pod Status..."
kubectl get pods -n $NAMESPACE

echo -e "\n[2/4] Checking Frontend Logs (Nginx)..."
kubectl logs -n $NAMESPACE -l app=frontend --tail=20

echo -e "\n[3/4] Checking Auth Service Logs (The most important part)..."
kubectl logs -n $NAMESPACE -l app=auth-service --tail=20

echo -e "\n[4/4] Checking MongoDB Collections..."
MONGO_POD=$(kubectl get pods -n $NAMESPACE -l app=mongodb -o jsonpath='{.items[0].metadata.name}')
echo "Databases found:"
kubectl exec -it $MONGO_POD -n $NAMESPACE -- mongo --eval "db.getMongo().getDBNames();"
echo -e "\nChecking collections in auth-db:"
kubectl exec -it $MONGO_POD -n $NAMESPACE -- mongo auth-db --eval "db.getCollectionNames();"
echo -e "\nCounting users in auth-db (users collection):"
kubectl exec -it $MONGO_POD -n $NAMESPACE -- mongo auth-db --eval "db.users.count();"
echo -e "\nFinding first user in auth-db:"
kubectl exec -it $MONGO_POD -n $NAMESPACE -- mongo auth-db --eval "db.users.findOne();"

echo -e "\n----------------------------------------------------------------"
echo "✅ Diagnostics Complete. Please share the output."
