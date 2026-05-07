# Learnify — DevOps Sprint 3 : Guide Complet CI/CD + Kubernetes + Monitoring

## Table des Matières

1. [Architecture DevOps](#1-architecture-devops)
2. [Prérequis](#2-prérequis)
3. [Étape 0 — Remplacer abdessalem1222](#étape-0--remplacer-dockerhub_username)
4. [Jenkins — Installation & Configuration](#4-jenkins--installation--configuration)
5. [SonarQube — Installation](#5-sonarqube--installation)
6. [Docker Hub — Credentials](#6-docker-hub--credentials)
7. [Créer les Jobs Jenkins](#7-créer-les-jobs-jenkins)
8. [Webhooks GitHub → Jenkins](#8-webhooks-github--jenkins)
9. [Lancer la CI](#9-lancer-la-ci)
10. [Déploiement Kubernetes](#10-déploiement-kubernetes)
11. [Lancer la CD](#11-lancer-la-cd)
12. [Monitoring Prometheus + Grafana](#12-monitoring-prometheus--grafana)
13. [Debug Kubernetes](#13-debug-kubernetes)
14. [URLs Finales](#14-urls-finales)
15. [Structure des fichiers DevOps](#15-structure-des-fichiers-devops)

---

## 1. Architecture DevOps

```
GitHub Repository
      │  push
      ▼
GitHub Webhook ──────────► Jenkins (:8080)
                                │
                    ┌───────────┼───────────────┐
                    │           │               │
               CI Backend  CI Frontend    CD Global
                    │           │               │
                 Maven      npm build     kubectl apply
                 Test        ng test      K8s Manifests
                 SonarQube  SonarQube         │
                 Docker      Docker           ▼
                 Build       Build      Minikube (learnify ns)
                 Push        Push            │
                    └───────────┘    ┌──────┴──────┐
                                     │             │
                               Microservices   Monitoring
                               (11 services)  Prometheus
                                              Grafana
```

---

## 2. Prérequis

### Sur la VM Ubuntu (Jenkins + Minikube)

```bash
# Java 17
sudo apt install -y openjdk-17-jdk

# Maven 3.8+
sudo apt install -y maven

# Docker
sudo apt install -y docker.io
sudo usermod -aG docker jenkins
sudo usermod -aG docker $USER

# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Démarrer Minikube (8 CPU, 12 Go RAM recommandés pour 11 services)
minikube start --cpus=6 --memory=10240 --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server

# sonar-scanner CLI (pour l'analyse Angular)
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
unzip sonar-scanner-cli-5.0.1.3006-linux.zip
sudo mv sonar-scanner-5.0.1.3006-linux /opt/sonar-scanner
sudo ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner
```

---

## Étape 0 — Remplacer abdessalem1222

Avant tout, remplacez `abdessalem1222` par votre vrai identifiant Docker Hub dans **tous les fichiers** :

```bash
# Depuis la racine du projet
find devops/ -type f | xargs sed -i 's/abdessalem1222/votre_username_dockerhub/g'
```

Exemple : si votre username est `johndoe`, les images seront :
- `docker.io/johndoe/learnify-user-service:latest`
- `docker.io/johndoe/learnify-frontend:latest`
- etc.

---

## 4. Jenkins — Installation & Configuration

### 4.1 Installation Jenkins (si pas encore fait)

```bash
curl -fsSL https://pkg.jenkins.io/debian/jenkins.io-2023.key | sudo tee \
    /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
    https://pkg.jenkins.io/debian binary/ | sudo tee \
    /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update && sudo apt install -y jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Mot de passe initial
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Accès : `http://IP_VM:8080`

### 4.2 Plugins Jenkins à installer

Aller dans **Manage Jenkins → Plugins → Available** et installer :

| Plugin | Utilité |
|--------|---------|
| **Git** | Checkout depuis GitHub |
| **GitHub Integration** | Webhooks GitHub |
| **Pipeline** | Jenkinsfile support |
| **Pipeline: Stage View** | Visualisation stages |
| **Maven Integration** | Build Maven |
| **NodeJS** | Build Angular |
| **Docker Pipeline** | Commandes Docker dans pipeline |
| **SonarQube Scanner** | Intégration SonarQube |
| **Kubernetes CLI** | kubectl dans pipeline |
| **Credentials Binding** | Injection de secrets |
| **JUnit** | Rapports de tests |
| **HTML Publisher** | Rapport de couverture |

```
Manage Jenkins → Plugins → Available → (chercher et cocher chaque plugin) → Install
```

### 4.3 Configurer les outils Jenkins

**Manage Jenkins → Global Tool Configuration** :

**JDK 17** :
- Name: `JDK17`
- JAVA_HOME: `/usr/lib/jvm/java-17-openjdk-amd64`

**Maven** :
- Name: `Maven3`
- Install automatically: cocher, version `3.9.6`

**NodeJS** :
- Name: `NodeJS18`
- Install automatically: cocher, version `18.20.2`

**SonarQube Scanner** :
- Name: `SonarScanner`
- Install automatically: cocher, version `5.0.1`

### 4.4 Configurer SonarQube dans Jenkins

**Manage Jenkins → System → SonarQube servers** :
- Name: `SonarQube`
- Server URL: `http://localhost:9000` (ou IP de la VM)
- Server authentication token: (credential créé à l'étape suivante)

---

## 5. SonarQube — Installation

### Option A : Docker Compose (recommandé pour la VM Jenkins)

```bash
# Prérequis kernel
sudo sysctl -w vm.max_map_count=524288
echo "vm.max_map_count=524288" | sudo tee -a /etc/sysctl.conf

# Démarrer SonarQube
cd devops/sonarqube
docker compose up -d

# Vérifier
docker compose ps
# Accès : http://IP_VM:9000 (admin / admin)
```

### Option B : Kubernetes

```bash
kubectl apply -f devops/sonarqube/sonar-k8s.yaml -n learnify
# Accès : http://MINIKUBE_IP:30900
```

### Générer un token SonarQube

1. Se connecter à SonarQube : `http://IP_VM:9000`
2. Changer le mot de passe par défaut (admin/admin → nouveau mot de passe)
3. **My Account → Security → Generate Tokens**
4. Name: `jenkins-token` | Type: `Global Analysis Token`
5. Copier le token généré

---

## 6. Docker Hub — Credentials

### Credentials Jenkins à créer

**Manage Jenkins → Credentials → System → Global credentials → Add Credentials**

#### 1. Docker Hub

| Champ | Valeur |
|-------|--------|
| Kind | Username with password |
| Username | votre_username_dockerhub |
| Password | votre_token_dockerhub (Settings → Security → New Access Token) |
| ID | `dockerhub-credentials` |
| Description | Docker Hub credentials |

#### 2. SonarQube Token

| Champ | Valeur |
|-------|--------|
| Kind | Secret text |
| Secret | (token généré dans SonarQube) |
| ID | `sonarqube-token` |
| Description | SonarQube analysis token |

#### 3. GitHub (pour checkout privé)

| Champ | Valeur |
|-------|--------|
| Kind | Username with password |
| Username | votre_github_username |
| Password | votre_github_personal_access_token |
| ID | `github-credentials` |
| Description | GitHub credentials |

#### 4. Kubeconfig

```bash
# Sur la VM, exporter le kubeconfig Minikube
minikube kubectl -- config view --flatten > /tmp/kubeconfig
cat /tmp/kubeconfig
```

| Champ | Valeur |
|-------|--------|
| Kind | Secret file |
| File | (uploader le fichier kubeconfig) |
| ID | `kubeconfig` |
| Description | Minikube kubeconfig |

---

## 7. Créer les Jobs Jenkins

### Méthode : Pipeline depuis SCM (recommandé)

Pour chaque service, créer un job **Pipeline** :

**New Item → Pipeline → OK**

**Configuration** :
- Build Triggers : cocher **GitHub hook trigger for GITScm polling**
- Pipeline : **Pipeline script from SCM**
  - SCM : **Git**
  - Repository URL : `https://github.com/kessentiniabdessalem/merge_integ_new1.git`
  - Credentials : `github-credentials`
  - Branch : `*/main`
  - Script Path : `devops/jenkins/Jenkinsfile-NOM_SERVICE`

### Liste des jobs à créer

| Nom du Job Jenkins | Jenkinsfile |
|-------------------|-------------|
| `learnify-ci-eureka-server` | `devops/jenkins/Jenkinsfile-eureka-server` |
| `learnify-ci-api-gateway` | `devops/jenkins/Jenkinsfile-api-gateway` |
| `learnify-ci-user-service` | `devops/jenkins/Jenkinsfile-user-service` |
| `learnify-ci-ai-service` | `devops/jenkins/Jenkinsfile-ai-service` |
| `learnify-ci-preevaluation-service` | `devops/jenkins/Jenkinsfile-preevaluation-service` |
| `learnify-ci-event-service` | `devops/jenkins/Jenkinsfile-event-service` |
| `learnify-ci-payment-service` | `devops/jenkins/Jenkinsfile-payment-service` |
| `learnify-ci-certificate-service` | `devops/jenkins/Jenkinsfile-certificate-service` |
| `learnify-ci-quiz-feedback-service` | `devops/jenkins/Jenkinsfile-quiz-feedback-service` |
| `learnify-ci-course-service` | `devops/jenkins/Jenkinsfile-course-service` |
| `learnify-ci-job-service` | `devops/jenkins/Jenkinsfile-job-service` |
| `learnify-ci-frontend` | `devops/jenkins/Jenkinsfile-frontend` |
| `learnify-cd` | `devops/jenkins/Jenkinsfile-cd` |

---

## 8. Webhooks GitHub → Jenkins

### 8.1 Rendre Jenkins accessible depuis Internet

Si la VM est locale (VMware), utilisez **ngrok** pour exposer Jenkins :

```bash
# Installer ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Authentifier et lancer
ngrok config add-authtoken VOTRE_TOKEN_NGROK
ngrok http 8080
# Note l'URL https://xxxx.ngrok.io
```

### 8.2 Configurer le Webhook sur GitHub

1. Aller sur le dépôt GitHub → **Settings → Webhooks → Add webhook**
2. Remplir :

| Champ | Valeur |
|-------|--------|
| **Payload URL** | `http://IP_JENKINS:8080/github-webhook/` (ou URL ngrok) |
| **Content type** | `application/json` |
| **Secret** | (laisser vide ou configurer dans Jenkins) |
| **Which events** | `Just the push event` |
| **Active** | Coché |

3. Cliquer **Add webhook**
4. Vérifier : GitHub affiche une coche verte si la connexion est OK

### 8.3 Vérification Jenkins côté plugin

- Manage Jenkins → Configure System → GitHub → Add GitHub Server
- Credentials : `github-credentials`
- Tester la connexion

### 8.4 Déclenchement automatique

À chaque **git push** sur la branche `main` :
- GitHub envoie une requête POST à `http://IP_JENKINS:8080/github-webhook/`
- Jenkins déclenche **tous les pipelines** configurés avec "GitHub hook trigger"
- Chaque pipeline CI build, teste, analyse et pousse son image

---

## 9. Lancer la CI

### Manuellement (premier lancement)

```bash
# Dans Jenkins, cliquer "Build Now" sur chaque job
# Ou via Jenkins CLI :
java -jar jenkins-cli.jar -s http://localhost:8080 build learnify-ci-user-service -f
```

### Automatiquement (via webhook)

```bash
# Depuis votre machine de dev
git add .
git commit -m "feat: mon changement"
git push origin main
# → Jenkins déclenche automatiquement tous les pipelines CI
```

### Ordre recommandé pour le premier build CI

1. `learnify-ci-eureka-server`
2. `learnify-ci-api-gateway`
3. Tous les autres services (parallèle possible)
4. `learnify-ci-frontend`

---

## 10. Déploiement Kubernetes

### 10.1 Préparer les secrets

```bash
# Éditer le fichier secrets.yaml et remplacer toutes les valeurs REPLACE_ME
vim devops/k8s/secrets.yaml
```

### 10.2 Préparer Minikube

```bash
# Vérifier que Minikube tourne
minikube status

# Activer l'addon Ingress si pas encore fait
minikube addons enable ingress

# Configurer /etc/hosts pour learnify.local
MINIKUBE_IP=$(minikube ip)
echo "$MINIKUBE_IP learnify.local" | sudo tee -a /etc/hosts
```

### 10.3 Déploiement manuel (sans Jenkins CD)

```bash
# 1. Namespace + Configs
kubectl apply -f devops/k8s/namespace.yaml
kubectl apply -f devops/k8s/secrets.yaml   -n learnify
kubectl apply -f devops/k8s/configmap.yaml -n learnify

# 2. Bases de données MySQL
kubectl apply -f devops/k8s/mysql/ -n learnify
# Attendre que MySQL démarre
sleep 60
kubectl get pods -n learnify | grep mysql

# 3. Eureka
kubectl apply -f devops/k8s/eureka/eureka.yaml -n learnify
kubectl rollout status deployment/eureka-server -n learnify

# 4. API Gateway
kubectl apply -f devops/k8s/api-gateway/api-gateway.yaml -n learnify
kubectl rollout status deployment/api-gateway -n learnify

# 5. Microservices
kubectl apply -f devops/k8s/services/ -n learnify

# 6. Frontend
kubectl apply -f devops/k8s/frontend/frontend.yaml -n learnify

# 7. Ingress
kubectl apply -f devops/k8s/ingress/ingress.yaml -n learnify

# 8. Monitoring
kubectl apply -f devops/k8s/monitoring/ -n learnify
```

---

## 11. Lancer la CD

### Via Jenkins

1. Ouvrir le job `learnify-cd`
2. Cliquer **Build with Parameters**
3. Cocher `DEPLOY_MONITORING` : oui
4. Laisser `RESET_DB` : non (sauf premier déploiement)
5. Cliquer **Build**

Le pipeline CD :
- Vérifie que toutes les images sont disponibles sur Docker Hub
- Applique les manifests Kubernetes dans l'ordre
- Vérifie les rollouts
- Affiche l'état du cluster
- Effectue un smoke test HTTP sur les services principaux

---

## 12. Monitoring Prometheus + Grafana

### Prérequis Spring Boot Actuator

Chaque service backend doit avoir dans son `pom.xml` :

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

Et dans `application.yml` ou via la variable d'environnement (déjà dans le ConfigMap) :

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
  endpoint:
    health:
      show-details: always
```

### Accéder à Prometheus

```
http://MINIKUBE_IP:30090
```

Vérifier les targets : **Status → Targets** — tous les services doivent être `UP`.

### Accéder à Grafana

```
http://MINIKUBE_IP:32000
Identifiants : admin / admin123
```

### Importer les Dashboards Grafana

La datasource Prometheus est configurée automatiquement au démarrage.

**Pour importer un dashboard :**
1. Dans Grafana : **Dashboards → Import**
2. Entrer l'ID du dashboard et cliquer **Load**

| Dashboard | ID | Description |
|-----------|-----|-------------|
| JVM Micrometer | `4701` | Métriques JVM (heap, GC, threads) |
| Spring Boot Statistics | `6756` | HTTP requests, response times |
| Spring Boot 3.x | `19004` | Dashboard complet Spring Boot 3 |
| MySQL Overview | `7362` | Métriques MySQL |
| Node Exporter Full | `1860` | Métriques système VM |

**Étapes détaillées pour JVM Micrometer (ID 4701) :**
1. Grafana → **Dashboards → Import**
2. Dashboard ID : `4701` → **Load**
3. Prometheus datasource : sélectionner `Prometheus`
4. **Import**
5. Filtrer par service dans le dropdown `Application`

### Alertes Grafana (optionnel)

**Alerting → Contact points → Add** → configurer email ou Slack.

---

## 13. Debug Kubernetes

### Commandes essentielles

```bash
# Vue d'ensemble
kubectl get all -n learnify

# Pods avec détails
kubectl get pods -n learnify -o wide

# État d'un pod spécifique
kubectl describe pod NOM_DU_POD -n learnify

# Logs d'un service
kubectl logs -f deployment/user-service -n learnify
kubectl logs -f deployment/api-gateway -n learnify --tail=100

# Logs d'un pod qui crash (previous)
kubectl logs NOM_DU_POD -n learnify --previous

# Entrer dans un conteneur
kubectl exec -it deployment/user-service -n learnify -- /bin/sh

# État des services
kubectl get services -n learnify

# État de l'ingress
kubectl get ingress -n learnify
kubectl describe ingress learnify-ingress -n learnify

# État des volumes
kubectl get pvc -n learnify

# Événements (erreurs récentes)
kubectl get events -n learnify --sort-by='.lastTimestamp'

# Redémarrer un déploiement
kubectl rollout restart deployment/user-service -n learnify

# Scaler un service
kubectl scale deployment/event-service --replicas=2 -n learnify

# Vérifier les ressources
kubectl top pods -n learnify
kubectl top nodes
```

### Problèmes fréquents

**Pod en CrashLoopBackOff** :
```bash
kubectl logs deployment/NOM_SERVICE -n learnify --previous
# Cause fréquente : MySQL pas encore prêt → augmenter initialDelaySeconds
```

**MySQL ne démarre pas** :
```bash
kubectl describe pod mysql-user-db-XXXXX -n learnify
# Cause fréquente : PVC non alloué → vérifier que Minikube a suffisamment d'espace
```

**Ingress ne fonctionne pas** :
```bash
kubectl get pods -n ingress-nginx
minikube addons enable ingress
```

**Service non trouvé dans Eureka** :
```bash
# Vérifier que EUREKA_CLIENT_SERVICEURL_DEFAULTZONE est bien configuré
kubectl exec -it deployment/user-service -n learnify -- env | grep EUREKA
```

**Port-forward pour accès direct** :
```bash
# Accéder à un service sans passer par l'Ingress
kubectl port-forward service/api-gateway 8080:8080 -n learnify
kubectl port-forward service/grafana 3000:3000 -n learnify
kubectl port-forward service/prometheus 9090:9090 -n learnify
```

---

## 14. URLs Finales

### Avec NodePort (accès direct Minikube)

```bash
MINIKUBE_IP=$(minikube ip)
echo "Minikube IP: $MINIKUBE_IP"
```

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | `http://MINIKUBE_IP:30000` | — |
| **API Gateway** | `http://MINIKUBE_IP:30080` | — |
| **Eureka Dashboard** | `http://MINIKUBE_IP:30761` | — |
| **Prometheus** | `http://MINIKUBE_IP:30090` | — |
| **Grafana** | `http://MINIKUBE_IP:32000` | admin / admin123 |
| **SonarQube** | `http://MINIKUBE_IP:30900` *(K8s)* ou `http://IP_VM:9000` *(Docker)* | admin / (changé) |
| **Jenkins** | `http://IP_VM:8080` | admin / (défini à l'install) |

### Avec Ingress (domaine learnify.local)

Ajouter dans `/etc/hosts` sur votre machine :
```
MINIKUBE_IP learnify.local
```

| Service | URL |
|---------|-----|
| **Frontend** | `http://learnify.local` |
| **API Gateway** | `http://learnify.local/api/...` |

---

## 15. Structure des fichiers DevOps

```
devops/
├── jenkins/
│   ├── Jenkinsfile-eureka-server          # CI : Eureka
│   ├── Jenkinsfile-api-gateway            # CI : API Gateway
│   ├── Jenkinsfile-user-service           # CI : User Service
│   ├── Jenkinsfile-ai-service             # CI : AI Service
│   ├── Jenkinsfile-preevaluation-service  # CI : Preevaluation
│   ├── Jenkinsfile-event-service          # CI : Event Service
│   ├── Jenkinsfile-payment-service        # CI : Payment Service
│   ├── Jenkinsfile-certificate-service    # CI : Certificate
│   ├── Jenkinsfile-quiz-feedback-service  # CI : Quiz/Feedback
│   ├── Jenkinsfile-course-service         # CI : Course Service
│   ├── Jenkinsfile-job-service            # CI : Job Service
│   ├── Jenkinsfile-frontend               # CI : Frontend Angular
│   └── Jenkinsfile-cd                     # CD : Déploiement K8s global
│
├── k8s/
│   ├── namespace.yaml                     # Namespace learnify
│   ├── secrets.yaml                       # Secrets (API keys, passwords)
│   ├── configmap.yaml                     # Config non-sensible (URLs, ports)
│   ├── mysql/
│   │   ├── mysql-user-db.yaml
│   │   ├── mysql-ai-db.yaml
│   │   ├── mysql-event-db.yaml
│   │   ├── mysql-payment-db.yaml
│   │   ├── mysql-certificate-db.yaml
│   │   ├── mysql-quiz-db.yaml
│   │   ├── mysql-course-db.yaml
│   │   └── mysql-job-db.yaml
│   ├── eureka/
│   │   └── eureka.yaml
│   ├── api-gateway/
│   │   └── api-gateway.yaml
│   ├── services/
│   │   ├── user-service.yaml
│   │   ├── ai-service.yaml
│   │   ├── preevaluation-service.yaml
│   │   ├── event-service.yaml
│   │   ├── payment-service.yaml
│   │   ├── certificate-service.yaml
│   │   ├── quiz-feedback-service.yaml
│   │   ├── course-service.yaml
│   │   └── job-service.yaml
│   ├── frontend/
│   │   └── frontend.yaml
│   ├── ingress/
│   │   └── ingress.yaml
│   └── monitoring/
│       ├── prometheus-configmap.yaml      # Config scrape Prometheus
│       ├── prometheus-deployment.yaml     # Prometheus + RBAC
│       └── grafana-deployment.yaml        # Grafana + datasource auto
│
└── sonarqube/
    ├── docker-compose.yml                 # SonarQube local (Option A)
    ├── sonar-k8s.yaml                     # SonarQube sur K8s (Option B)
    └── sonar-project-frontend.properties # Config SonarQube pour Angular

frontend/
├── Dockerfile                             # Multi-stage Angular + Nginx
└── nginx.conf                             # Config Nginx avec proxy /api

integrated/
└── [service]/
    └── Dockerfile                         # Déjà existants (inchangés)
```

---

## Checklist de Validation (grille prof)

- [ ] Jenkins accessible sur `http://IP_VM:8080`
- [ ] Webhook GitHub configuré et testé (coche verte GitHub)
- [ ] Pipeline CI backend (1 par service) visible dans Jenkins
- [ ] Pipeline CI frontend visible dans Jenkins
- [ ] Chaque pipeline CI : Checkout → Build → Tests → SonarQube → Docker Build → Docker Push
- [ ] Images visibles sur Docker Hub : `abdessalem1222/learnify-*:latest`
- [ ] SonarQube accessible, projets analysés avec Quality Gate
- [ ] Pipeline CD global : déploie tous les manifests K8s
- [ ] `kubectl get pods -n learnify` → tous les pods `Running`
- [ ] Frontend accessible : `http://MINIKUBE_IP:30000`
- [ ] API Gateway accessible : `http://MINIKUBE_IP:30080/actuator/health`
- [ ] Eureka accessible : `http://MINIKUBE_IP:30761`
- [ ] Prometheus accessible : `http://MINIKUBE_IP:30090` → targets UP
- [ ] Grafana accessible : `http://MINIKUBE_IP:32000` → dashboard JVM importé
