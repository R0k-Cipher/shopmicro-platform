#!/bin/bash

echo
echo "========================================"
echo "   🏪 SHOPMICRO PLATFORM - LINUX/MAC"
echo "========================================"
echo

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fonction de vérification
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 n'est pas installé!${NC}"
        echo -e "${YELLOW}📥 $2${NC}"
        exit 1
    fi
}

echo "Vérification des prérequis..."

# Vérifications
check_command "docker" "Installez Docker: https://docs.docker.com/get-docker/"
check_command "node" "Installez Node.js: https://nodejs.org/"

echo -e "${GREEN}✅ Prérequis vérifiés!${NC}"
echo

echo "🐳 Arrêt des services existants..."
docker-compose down

echo "🚀 Démarrage des services avec Docker Compose..."
docker-compose up -d

echo
echo -e "${YELLOW}⏳ Attente du démarrage des services...${NC}"
sleep 10

echo
echo "📊 Vérification du statut des services..."
docker-compose ps

echo
echo -e "${GREEN}🌐 Plateforme démarrée avec succès!${NC}"
echo
echo "📍 URLs d'accès:"
echo "   API Gateway: http://localhost:8080"
echo "   Health Check: http://localhost:8080/health"
echo
echo -e "${YELLOW}🧪 Pour tester: ./scripts/test-scenario.sh${NC}"
echo

# Ouvrir le navigateur (Linux)
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8080/health
elif command -v open &> /dev/null; then
    open http://localhost:8080/health
fi
