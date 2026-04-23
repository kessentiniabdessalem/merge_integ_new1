#!/bin/bash

# Script de test pour les fonctionnalités avancées
# Module Event - Spring Boot Backend

BASE_URL="http://localhost:8080/back/api"

echo "=========================================="
echo "TEST DES FONCTIONNALITÉS AVANCÉES"
echo "=========================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}1️⃣ TEST STATISTIQUES (Dashboard Admin)${NC}"
echo "GET $BASE_URL/events/statistics"
curl -X GET "$BASE_URL/events/statistics" \
  -H "Content-Type: application/json" | json_pp
echo ""
echo ""

echo -e "${BLUE}2️⃣ TEST LIKE / UNLIKE${NC}"
echo ""

echo -e "${GREEN}2.1 Aimer un événement${NC}"
echo "POST $BASE_URL/events/likes/1/participant/1"
curl -X POST "$BASE_URL/events/likes/1/participant/1"
echo ""
echo ""

echo -e "${GREEN}2.2 Vérifier si aimé${NC}"
echo "GET $BASE_URL/events/likes/1/participant/1/status"
curl -X GET "$BASE_URL/events/likes/1/participant/1/status"
echo ""
echo ""

echo -e "${GREEN}2.3 Compter les likes${NC}"
echo "GET $BASE_URL/events/likes/1/count"
curl -X GET "$BASE_URL/events/likes/1/count"
echo ""
echo ""

echo -e "${GREEN}2.4 Ne plus aimer${NC}"
echo "DELETE $BASE_URL/events/likes/1/participant/1"
curl -X DELETE "$BASE_URL/events/likes/1/participant/1"
echo ""
echo ""

echo -e "${BLUE}3️⃣ TEST RÉSERVATION + TICKET PDF${NC}"
echo ""

echo -e "${GREEN}3.1 Créer une réservation${NC}"
echo "POST $BASE_URL/reservations"
curl -X POST "$BASE_URL/reservations" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "participantId": 1
  }' | json_pp
echo ""
echo ""

echo -e "${GREEN}3.2 Télécharger le ticket PDF${NC}"
echo "GET $BASE_URL/reservations/1/ticket"
echo "Téléchargement du ticket..."
curl -X GET "$BASE_URL/reservations/1/ticket" \
  -o "ticket-test.pdf"
if [ -f "ticket-test.pdf" ]; then
  echo -e "${GREEN}✅ Ticket téléchargé: ticket-test.pdf${NC}"
else
  echo -e "${RED}❌ Erreur lors du téléchargement${NC}"
fi
echo ""
echo ""

echo -e "${BLUE}4️⃣ TEST VALIDATION TICKET (Scan QR Code)${NC}"
echo ""

echo -e "${GREEN}4.1 Valider un ticket valide${NC}"
echo "GET $BASE_URL/reservations/validate/TKT-ABC12345"
curl -X GET "$BASE_URL/reservations/validate/TKT-ABC12345" | json_pp
echo ""
echo ""

echo -e "${GREEN}4.2 Marquer le ticket comme utilisé${NC}"
echo "POST $BASE_URL/reservations/validate/TKT-ABC12345/use"
curl -X POST "$BASE_URL/reservations/validate/TKT-ABC12345/use"
echo ""
echo ""

echo -e "${GREEN}4.3 Valider un ticket déjà utilisé${NC}"
echo "GET $BASE_URL/reservations/validate/TKT-ABC12345"
curl -X GET "$BASE_URL/reservations/validate/TKT-ABC12345" | json_pp
echo ""
echo ""

echo -e "${GREEN}4.4 Valider un ticket invalide${NC}"
echo "GET $BASE_URL/reservations/validate/TKT-INVALID"
curl -X GET "$BASE_URL/reservations/validate/TKT-INVALID" | json_pp
echo ""
echo ""

echo -e "${BLUE}5️⃣ TEST RÉSERVATIONS PAR ÉVÉNEMENT${NC}"
echo "GET $BASE_URL/reservations/event/1"
curl -X GET "$BASE_URL/reservations/event/1" | json_pp
echo ""
echo ""

echo -e "${BLUE}6️⃣ TEST RÉSERVATIONS PAR PARTICIPANT${NC}"
echo "GET $BASE_URL/reservations/participant/1"
curl -X GET "$BASE_URL/reservations/participant/1" | json_pp
echo ""
echo ""

echo "=========================================="
echo -e "${GREEN}✅ TESTS TERMINÉS${NC}"
echo "=========================================="
