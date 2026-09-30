# 🏪 ShopMicro - Plateforme E-commerce Microservices

## 🚀 Démarrage Immédiat

### Windows
1. **Extraire** le dossier ZIP
2. **Double-cliquer** sur `START-HERE.bat`
3. **La plateforme démarre automatiquement!**

### Linux/Mac
```bash
# Donner les permissions d'exécution
chmod +x start-platform.sh
chmod +x scripts/*.sh

# Lancer la plateforme
./start-platform.sh
```

## 📡 Accès aux Services

- **API Gateway**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Documentation API**: Voir ci-dessous

## 🧪 Test Rapide

### Windows
```cmd
scripts\test-scenario.bat
```

### Linux/Mac
```bash
./scripts/test-scenario.sh
```

## 🔧 Services Déployés

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 8080 | Point d'entrée unique |
| User Service | 8001 | Gestion utilisateurs |
| Product Service | 8002 | Catalogue produits |
| Order Service | 8003 | Commandes |
| Payment Service | 8004 | Paiements |
| Notification Service | 8005 | Notifications |

## 📚 API Examples

### Créer un utilisateur
```bash
POST http://localhost:8080/api/users/register
{
  "email": "test@example.com",
  "name": "John Doe"
}
```

### Voir les produits
```bash
GET http://localhost:8080/api/products
```

### Créer une commande
```bash
POST http://localhost:8080/api/orders
{
  "userId": 1,
  "productId": 1,
  "quantity": 2
}
```

## 🛑 Arrêt des Services

### Docker Compose
```bash
docker-compose down
```

### PM2
```bash
pm2 delete all
```

## 🔍 Monitoring

```bash
# Voir les logs
docker-compose logs

# Statut des conteneurs
docker-compose ps

# Ressources utilisées
docker stats
```
