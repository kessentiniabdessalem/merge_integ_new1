#!/usr/bin/env bash
# ─── Script de déploiement Learnify sur Minikube ─────────────────────────────
# Usage : ./devops/deploy.sh [--monitoring] [--reset-db] [--sonarqube]
# À lancer depuis la racine du projet.
#
# Prérequis :
#   - minikube démarré (minikube start)
#   - minikube addons enable ingress
#   - kubectl configuré (minikube kubectl --)
#   - devops/k8s/secrets.yaml rempli (remplacer REPLACE_ME)

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${BLUE}[INFO]${NC} $*"; }
ok()   { echo -e "${GREEN}[OK]${NC}   $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

DEPLOY_MONITORING=false
RESET_DB=false
DEPLOY_SONARQUBE=false

for arg in "$@"; do
  case $arg in
    --monitoring)   DEPLOY_MONITORING=true ;;
    --reset-db)     RESET_DB=true ;;
    --sonarqube)    DEPLOY_SONARQUBE=true ;;
    --help|-h)
      echo "Usage: $0 [--monitoring] [--reset-db] [--sonarqube]"
      exit 0
      ;;
  esac
done

K8S_DIR="devops/k8s"
NS="learnify"

# ─── Vérifications ────────────────────────────────────────────────────────────
log "Vérification de l'environnement..."
command -v kubectl &>/dev/null || err "kubectl non trouvé. Installez kubectl."
command -v minikube &>/dev/null || err "minikube non trouvé."
minikube status &>/dev/null || err "Minikube n'est pas démarré. Lancez : minikube start --cpus=6 --memory=10240"

MINIKUBE_IP=$(minikube ip)
log "Minikube IP : $MINIKUBE_IP"

# ─── Activer Ingress si nécessaire ───────────────────────────────────────────
if ! minikube addons list | grep -q "ingress.*enabled"; then
  log "Activation de l'addon Ingress..."
  minikube addons enable ingress
fi

# ─── /etc/hosts ──────────────────────────────────────────────────────────────
if ! grep -q "learnify.local" /etc/hosts; then
  warn "Ajout de learnify.local dans /etc/hosts (sudo requis)"
  echo "$MINIKUBE_IP learnify.local" | sudo tee -a /etc/hosts
fi

# ─── 1. Namespace ────────────────────────────────────────────────────────────
log "1/8 — Namespace..."
kubectl apply -f "$K8S_DIR/namespace.yaml"
ok "Namespace $NS prêt."

# ─── 2. Secrets & ConfigMap ──────────────────────────────────────────────────
log "2/8 — Secrets et ConfigMap..."

# Vérifier que les REPLACE_ME ont été substitués
if grep -q "REPLACE_ME" "$K8S_DIR/secrets.yaml"; then
  err "Le fichier devops/k8s/secrets.yaml contient encore des valeurs REPLACE_ME.\nÉditez-le avant de continuer."
fi

kubectl apply -f "$K8S_DIR/secrets.yaml"   -n $NS
kubectl apply -f "$K8S_DIR/configmap.yaml" -n $NS
ok "Secrets et ConfigMap appliqués."

# ─── 3. MySQL ────────────────────────────────────────────────────────────────
log "3/8 — Déploiement MySQL..."

if $RESET_DB; then
  warn "RESET_DB activé : suppression des PVC MySQL existants..."
  kubectl delete pvc -l app=mysql-user-db        -n $NS --ignore-not-found
  kubectl delete pvc -l app=mysql-ai-db          -n $NS --ignore-not-found
  kubectl delete pvc -l app=mysql-event-db       -n $NS --ignore-not-found
  kubectl delete pvc -l app=mysql-payment-db     -n $NS --ignore-not-found
  kubectl delete pvc -l app=mysql-certificate-db -n $NS --ignore-not-found
  kubectl delete pvc -l app=mysql-quiz-db        -n $NS --ignore-not-found
  kubectl delete pvc -l app=mysql-course-db      -n $NS --ignore-not-found
  kubectl delete pvc -l app=mysql-job-db         -n $NS --ignore-not-found
  kubectl delete pvc -l app=mysql-preevaluation-db -n $NS --ignore-not-found
  sleep 5
fi

kubectl apply -f "$K8S_DIR/mysql/" -n $NS

log "Attente du démarrage de MySQL (60s)..."
sleep 60

MYSQL_DEPLOYMENTS=(
  mysql-user-db mysql-ai-db mysql-event-db mysql-payment-db
  mysql-certificate-db mysql-quiz-db mysql-course-db mysql-job-db
  mysql-preevaluation-db
)
for db in "${MYSQL_DEPLOYMENTS[@]}"; do
  log "Rollout: $db"
  kubectl rollout status deployment/$db -n $NS --timeout=120s && ok "$db prêt."
done

# ─── 4. Eureka ───────────────────────────────────────────────────────────────
log "4/8 — Eureka Server..."
kubectl apply -f "$K8S_DIR/eureka/eureka.yaml" -n $NS
kubectl rollout status deployment/eureka-server -n $NS --timeout=120s
ok "Eureka prêt — http://$MINIKUBE_IP:30761"

# ─── 5. API Gateway ──────────────────────────────────────────────────────────
log "5/8 — API Gateway..."
kubectl apply -f "$K8S_DIR/api-gateway/api-gateway.yaml" -n $NS
kubectl rollout status deployment/api-gateway -n $NS --timeout=120s
ok "API Gateway prêt — http://$MINIKUBE_IP:30080"

# ─── 6. Microservices backend ─────────────────────────────────────────────────
log "6/8 — Microservices backend..."
kubectl apply -f "$K8S_DIR/services/" -n $NS

SERVICES=(
  user-service ai-service preevaluation-service event-service
  payment-service certificate-service quiz-feedback-service
  course-service job-service
)
for svc in "${SERVICES[@]}"; do
  log "Rollout: $svc"
  kubectl rollout status deployment/$svc -n $NS --timeout=180s && ok "$svc prêt."
done

# ─── 7. Frontend ─────────────────────────────────────────────────────────────
log "7/8 — Frontend..."
kubectl apply -f "$K8S_DIR/frontend/frontend.yaml" -n $NS
kubectl rollout status deployment/frontend -n $NS --timeout=90s
ok "Frontend prêt — http://$MINIKUBE_IP:30000"

# ─── Ingress ─────────────────────────────────────────────────────────────────
kubectl apply -f "$K8S_DIR/ingress/ingress.yaml" -n $NS

# ─── 8. Monitoring (optionnel) ───────────────────────────────────────────────
if $DEPLOY_MONITORING; then
  log "8/8 — Monitoring (Prometheus + Grafana)..."
  kubectl apply -f "$K8S_DIR/monitoring/" -n $NS
  kubectl rollout status deployment/prometheus -n $NS --timeout=90s
  kubectl rollout status deployment/grafana    -n $NS --timeout=90s
  ok "Prometheus — http://$MINIKUBE_IP:30090"
  ok "Grafana    — http://$MINIKUBE_IP:32000  (admin / admin123)"
else
  log "8/8 — Monitoring ignoré (ajoutez --monitoring pour l'activer)."
fi

# ─── SonarQube (optionnel) ───────────────────────────────────────────────────
if $DEPLOY_SONARQUBE; then
  log "Déploiement SonarQube sur Kubernetes..."
  kubectl apply -f "devops/sonarqube/sonar-k8s.yaml" -n $NS
  ok "SonarQube — http://$MINIKUBE_IP:30900  (admin / admin)"
fi

# ─── État final ──────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Déploiement Learnify terminé avec succès  ${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo "  Frontend    : http://$MINIKUBE_IP:30000"
echo "  API Gateway : http://$MINIKUBE_IP:30080"
echo "  Eureka      : http://$MINIKUBE_IP:30761"
if $DEPLOY_MONITORING; then
  echo "  Prometheus  : http://$MINIKUBE_IP:30090"
  echo "  Grafana     : http://$MINIKUBE_IP:32000  (admin/admin123)"
fi
if $DEPLOY_SONARQUBE; then
  echo "  SonarQube   : http://$MINIKUBE_IP:30900  (admin/admin)"
fi
echo ""
echo "  Pods status :"
kubectl get pods -n $NS -o wide
echo ""
