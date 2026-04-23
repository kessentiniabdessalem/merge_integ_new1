#!/bin/bash

# ============================================
# Script de Vérification - Module Event
# ============================================

echo "🔍 Vérification du Module Event Management"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
PASSED=0
FAILED=0

# Fonction de test
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1"
        ((FAILED++))
    fi
}

# ============================================
# 1. VÉRIFICATION DE L'ENVIRONNEMENT
# ============================================

echo "📦 1. Vérification de l'environnement"
echo "--------------------------------------"

# Java
java -version > /dev/null 2>&1
check "Java installé"

# Maven
mvn -version > /dev/null 2>&1
check "Maven installé"

# MySQL
mysql --version > /dev/null 2>&1
check "MySQL installé"

echo ""

# ============================================
# 2. VÉRIFICATION DES FICHIERS
# ============================================

echo "📁 2. Vérification des fichiers"
echo "--------------------------------------"

# Entités
[ -f "src/main/java/pi/backrahma/entity/Event.java" ]
check "Event.java existe"

[ -f "src/main/java/pi/backrahma/entity/Reservation.java" ]
check "Reservation.java existe"

[ -f "src/main/java/pi/backrahma/entity/EventLike.java" ]
check "EventLike.java existe"

# Repositories
[ -f "src/main/java/pi/backrahma/Repository/EventRepository.java" ]
check "EventRepository.java existe"

[ -f "src/main/java/pi/backrahma/Repository/ReservationRepository.java" ]
check "ReservationRepository.java existe"

[ -f "src/main/java/pi/backrahma/Repository/EventLikeRepository.java" ]
check "EventLikeRepository.java existe"

# Services
[ -f "src/main/java/pi/backrahma/Service/EventServiceImp.java" ]
check "EventServiceImp.java existe"

[ -f "src/main/java/pi/backrahma/Service/ReservationService.java" ]
check "ReservationService.java existe"

[ -f "src/main/java/pi/backrahma/Service/QRCodeService.java" ]
check "QRCodeService.java existe"

[ -f "src/main/java/pi/backrahma/Service/PDFTicketService.java" ]
check "PDFTicketService.java existe"

# Controllers
[ -f "src/main/java/pi/backrahma/Controller/EventController.java" ]
check "EventController.java existe"

[ -f "src/main/java/pi/backrahma/Controller/ReservationController.java" ]
check "ReservationController.java existe"

[ -f "src/main/java/pi/backrahma/Controller/EventLikeController.java" ]
check "EventLikeController.java existe"

# Documentation
[ -f "START_HERE.md" ]
check "START_HERE.md existe"

[ -f "README_EVENT_MODULE.md" ]
check "README_EVENT_MODULE.md existe"

[ -f "API_DOCUMENTATION.md" ]
check "API_DOCUMENTATION.md existe"

[ -f "POSTMAN_COLLECTION.json" ]
check "POSTMAN_COLLECTION.json existe"

[ -f "TEST_DATA.sql" ]
check "TEST_DATA.sql existe"

echo ""

# ============================================
# 3. COMPILATION
# ============================================

echo "🔨 3. Compilation du projet"
echo "--------------------------------------"

mvn clean compile -q > /dev/null 2>&1
check "Compilation Maven réussie"

echo ""

# ============================================
# 4. TESTS UNITAIRES
# ============================================

echo "🧪 4. Tests unitaires"
echo "--------------------------------------"

mvn test -q > /dev/null 2>&1
check "Tests unitaires passent"

echo ""

# ============================================
# 5. VÉRIFICATION DE LA BASE DE DONNÉES
# ============================================

echo "🗄️ 5. Vérification de la base de données"
echo "--------------------------------------"

# Vérifier si la BDD existe
mysql -u root -e "USE event_db" > /dev/null 2>&1
check "Base de données event_db existe"

echo ""

# ============================================
# 6. VÉRIFICATION DE L'APPLICATION
# ============================================

echo "🚀 6. Vérification de l'application"
echo "--------------------------------------"

# Vérifier si l'application tourne
curl -s http://localhost:8080/api/events > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: Application accessible sur port 8080"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARN${NC}: Application non lancée (normal si pas démarrée)"
fi

echo ""

# ============================================
# 7. VÉRIFICATION DES DÉPENDANCES
# ============================================

echo "📦 7. Vérification des dépendances"
echo "--------------------------------------"

# Vérifier ZXing
grep -q "com.google.zxing" pom.xml
check "Dépendance ZXing (QR Code) présente"

# Vérifier iText7
grep -q "com.itextpdf" pom.xml
check "Dépendance iText7 (PDF) présente"

# Vérifier Spring Boot
grep -q "spring-boot-starter-web" pom.xml
check "Dépendance Spring Boot Web présente"

# Vérifier JPA
grep -q "spring-boot-starter-data-jpa" pom.xml
check "Dépendance Spring Data JPA présente"

echo ""

# ============================================
# 8. VÉRIFICATION DE LA CONFIGURATION
# ============================================

echo "⚙️ 8. Vérification de la configuration"
echo "--------------------------------------"

[ -f "src/main/resources/application.properties" ]
check "application.properties existe"

grep -q "spring.datasource.url" src/main/resources/application.properties
check "Configuration datasource présente"

echo ""

# ============================================
# RÉSUMÉ
# ============================================

echo ""
echo "=========================================="
echo "📊 RÉSUMÉ"
echo "=========================================="
echo -e "${GREEN}✅ Tests réussis: $PASSED${NC}"
echo -e "${RED}❌ Tests échoués: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Tous les tests sont passés ! ($PERCENTAGE%)${NC}"
    echo "✅ Le module est prêt à être utilisé"
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  La plupart des tests sont passés ($PERCENTAGE%)${NC}"
    echo "⚠️  Vérifiez les erreurs ci-dessus"
else
    echo -e "${RED}❌ Plusieurs tests ont échoué ($PERCENTAGE%)${NC}"
    echo "❌ Corrigez les erreurs avant de continuer"
fi

echo ""
echo "=========================================="
echo "📚 Prochaines étapes:"
echo "=========================================="
echo "1. Lancer l'application: mvn spring-boot:run"
echo "2. Tester avec Postman: Importer POSTMAN_COLLECTION.json"
echo "3. Insérer des données: mysql -u root -p event_db < TEST_DATA.sql"
echo "4. Consulter la doc: START_HERE.md"
echo ""

exit $FAILED
