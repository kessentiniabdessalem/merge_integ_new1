#!/bin/bash

# ============================================
# Script de test API - Module Event
# ============================================

BASE_URL="http://localhost:8080/api"

echo "🚀 Tests API - Module Event Management"
echo "======================================"
echo ""

# ============================================
# EVENTS
# ============================================

echo "📋 1. Liste tous les événements"
curl -X GET "$BASE_URL/events" | jq
echo ""
echo "---"
echo ""

echo "🔍 2. Recherche événements (keyword=workshop)"
curl -X GET "$BASE_URL/events/search?keyword=workshop&page=0&size=10" | jq
echo ""
echo "---"
echo ""

echo "🎯 3. Filtrage par catégorie (WORKSHOP)"
curl -X GET "$BASE_URL/events/search?category=WORKSHOP&page=0&size=10" | jq
echo ""
echo "---"
echo ""

echo "📊 4. Filtrage par status (Upcoming)"
curl -X GET "$BASE_URL/events/search?status=Upcoming&page=0&size=10" | jq
echo ""
echo "---"
echo ""

echo "🔎 5. Recherche combinée (keyword + category + status)"
curl -X GET "$BASE_URL/events/search?keyword=angular&category=WORKSHOP&status=Upcoming&page=0&size=10" | jq
echo ""
echo "---"
echo ""

echo "📖 6. Détail d'un événement (ID=1)"
curl -X GET "$BASE_URL/events/1" | jq
echo ""
echo "---"
echo ""

echo "📈 7. Statistiques (Admin)"
curl -X GET "$BASE_URL/events/statistics" | jq
echo ""
echo "---"
echo ""

echo "📚 8. Liste des catégories"
curl -X GET "$BASE_URL/events/categories" | jq
echo ""
echo "---"
echo ""

echo "➕ 9. Créer un événement (Admin)"
curl -X POST "$BASE_URL/events" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Workshop React & Next.js",
    "category": "WORKSHOP",
    "status": "Upcoming",
    "date": "2026-05-20",
    "placesLimit": 80,
    "description": "Atelier pratique sur React 19 et Next.js 15",
    "location": "Salle E, Code School",
    "photoUrl": "/uploads/react.jpg",
    "organizerFirstName": "Nour",
    "organizerLastName": "Slimani"
  }' | jq
echo ""
echo "---"
echo ""

echo "✏️ 10. Modifier un événement (Admin)"
curl -X PUT "$BASE_URL/events/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Workshop Angular Avancé - Mis à jour",
    "category": "WORKSHOP",
    "status": "Upcoming",
    "date": "2026-04-20",
    "placesLimit": 120,
    "description": "Description mise à jour",
    "location": "Salle A, Bâtiment 3",
    "photoUrl": "/uploads/angular.jpg",
    "organizerFirstName": "Ahmed",
    "organizerLastName": "Mansour"
  }' | jq
echo ""
echo "---"
echo ""

echo "🔄 11. Changer le status d'un événement (Admin)"
curl -X PATCH "$BASE_URL/events/1/status?status=Ongoing" | jq
echo ""
echo "---"
echo ""

# ============================================
# RESERVATIONS
# ============================================

echo "🎟️ 12. Créer une réservation"
curl -X POST "$BASE_URL/reservations" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "participantId": 1
  }' | jq
echo ""
echo "---"
echo ""

echo "📋 13. Réservations par événement (Admin)"
curl -X GET "$BASE_URL/reservations/event/1" | jq
echo ""
echo "---"
echo ""

echo "👤 14. Réservations par participant"
curl -X GET "$BASE_URL/reservations/participant/1" | jq
echo ""
echo "---"
echo ""

echo "📥 15. Télécharger ticket PDF (ouvre dans le navigateur)"
echo "URL: $BASE_URL/reservations/1/ticket"
# curl -X GET "$BASE_URL/reservations/1/ticket" --output ticket.pdf
echo "Pour télécharger: curl -X GET '$BASE_URL/reservations/1/ticket' --output ticket.pdf"
echo ""
echo "---"
echo ""

echo "❌ 16. Annuler une réservation"
curl -X DELETE "$BASE_URL/reservations/1" | jq
echo ""
echo "---"
echo ""

# ============================================
# LIKES
# ============================================

echo "❤️ 17. Liker un événement"
curl -X POST "$BASE_URL/events/likes/1/participant/1"
echo ""
echo "---"
echo ""

echo "🔢 18. Nombre de likes d'un événement"
curl -X GET "$BASE_URL/events/likes/1/count"
echo ""
echo "---"
echo ""

echo "✅ 19. Vérifier si un participant a liké"
curl -X GET "$BASE_URL/events/likes/1/participant/1/status"
echo ""
echo "---"
echo ""

echo "💔 20. Unliker un événement"
curl -X DELETE "$BASE_URL/events/likes/1/participant/1"
echo ""
echo "---"
echo ""

# ============================================
# TESTS D'ERREUR
# ============================================

echo "⚠️ 21. Test erreur - Événement inexistant"
curl -X GET "$BASE_URL/events/999" | jq
echo ""
echo "---"
echo ""

echo "⚠️ 22. Test erreur - Réservation doublon"
curl -X POST "$BASE_URL/reservations" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "participantId": 1
  }' | jq
echo ""
echo "---"
echo ""

echo "⚠️ 23. Test erreur - Événement complet"
echo "Créer un événement avec reservedPlaces = placesLimit puis tenter de réserver"
echo ""
echo "---"
echo ""

# ============================================
# SUPPRESSION (Admin)
# ============================================

echo "🗑️ 24. Supprimer un événement (Admin)"
# curl -X DELETE "$BASE_URL/events/12"
echo "Pour supprimer: curl -X DELETE '$BASE_URL/events/12'"
echo ""
echo "---"
echo ""

echo "✅ Tests terminés !"
echo ""
echo "📚 Pour plus d'informations:"
echo "  - API_DOCUMENTATION.md"
echo "  - POSTMAN_COLLECTION.json"
echo "  - RESERVATION_FLOW.md"
