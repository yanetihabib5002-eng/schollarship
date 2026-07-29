# API Gestion Scolaire — Bulletins & Notes

Application web de gestion scolaire avec génération automatique des bulletins PDF et tableaux d'honneur.

## Stack

- **Runtime :** Node.js + Express
- **Base de données :** Firebase Firestore
- **Auth :** JWT (access + refresh tokens) — bcrypt (cost 12)
- **Validation :** Zod
- **PDF :** pdfkit
- **Doc API :** Swagger / OpenAPI

## Prérequis

- Node.js >= 18
- Compte Firebase avec Firestore activé
- Clé de service Firebase Admin SDK

## Installation

```bash
# 1. Cloner le projet
cd scholarship

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Firebase

# 4. Lancer le seed (admin + données de base)
npm run seed

# 5. Démarrer le serveur
npm start
```

## Démarrage rapide

```bash
npm start
# Serveur : http://localhost:3000
# Swagger : http://localhost:3000/api-docs
# Health  : http://localhost:3000/api/v1/health
```

### Compte admin par défaut (seed)

| Email | Mot de passe |
|-------|-------------|
| `admin@ecole.com` | `Admin123!` |

> **Important :** Changez le mot de passe après la première connexion.

## Structure du projet

```
src/
├── config/          # Firebase, env
├── middleware/       # auth, roleGuard, validate, errorHandler, rateLimiter
├── routes/          # Tous les endpoints par module
├── services/        # Logique métier
├── utils/           # Errors, audit
├── validators/      # Schémas Zod
├── app.js           # Configuration Express
└── server.js        # Point d'entrée
seed.js              # Données initiales
swagger.js           # Configuration OpenAPI
```

## API — Endpoints

### Authentification
| Méthode | Route | Rôle |
|---------|-------|------|
| POST | `/api/v1/auth/login` | public |
| POST | `/api/v1/auth/refresh` | public |
| POST | `/api/v1/auth/logout` | admin, teacher |
| PUT | `/api/v1/auth/change-password` | teacher |

### Enseignants (CRUD)
| Méthode | Route | Rôle |
|---------|-------|------|
| GET | `/api/v1/teachers` | admin |
| POST | `/api/v1/teachers` | admin |
| GET | `/api/v1/teachers/:id` | admin |
| PUT | `/api/v1/teachers/:id` | admin |
| DELETE | `/api/v1/teachers/:id` | admin |
| PATCH | `/api/v1/teachers/:id/toggle-active` | admin |

### Élèves (CRUD)
| Méthode | Route | Rôle |
|---------|-------|------|
| GET | `/api/v1/students` | admin |
| POST | `/api/v1/students` | admin |
| GET | `/api/v1/students/:id` | admin |
| PUT | `/api/v1/students/:id` | admin |
| DELETE | `/api/v1/students/:id` | admin |

### Classes / Matières / Coefficients
| Méthode | Route | Rôle |
|---------|-------|------|
| GET | `/api/v1/classes` | admin, teacher |
| POST | `/api/v1/classes` | admin |
| GET | `/api/v1/subjects` | admin, teacher |
| POST | `/api/v1/subjects` | admin |
| GET/POST/DELETE | `/api/v1/coefficients` | admin |

### Affectations (enseignant → classe → matière)
| Méthode | Route | Rôle |
|---------|-------|------|
| GET/POST | `/api/v1/assignments` | admin |
| DELETE | `/api/v1/assignments/:id` | admin |

### Périodes et Saisie
| Méthode | Route | Rôle |
|---------|-------|------|
| GET/POST | `/api/v1/periods` | admin |
| PATCH | `/api/v1/periods/:id/toggle-open` | admin |
| PATCH | `/api/v1/periods/:id/validate` | admin |

### Notes
| Méthode | Route | Rôle |
|---------|-------|------|
| GET | `/api/v1/grades` | admin, teacher |
| PUT | `/api/v1/grades/batch` | admin, teacher |
| PATCH | `/api/v1/grades/:id/submit` | teacher |
| POST | `/api/v1/grades/validate-batch` | admin |
| PATCH | `/api/v1/grades/:id/reopen` | admin |

### Dashboard Enseignant
| Méthode | Route | Rôle |
|---------|-------|------|
| GET | `/api/v1/teacher/dashboard` | teacher |

### Bulletins PDF
| Méthode | Route | Rôle |
|---------|-------|------|
| GET | `/api/v1/report-cards` | admin |
| POST | `/api/v1/report-cards/generate` | admin |
| GET | `/api/v1/report-cards/:id/pdf` | admin |

### Tableaux d'Honneur PDF
| Méthode | Route | Rôle |
|---------|-------|------|
| GET | `/api/v1/honor-rolls` | admin |
| POST | `/api/v1/honor-rolls/generate` | admin |
| GET | `/api/v1/honor-rolls/:id/pdf` | admin |

### Statistiques
| Méthode | Route | Rôle |
|---------|-------|------|
| GET | `/api/v1/statistics/overview` | admin |
| GET | `/api/v1/statistics/class/:classId/trimester/:trimester` | admin |

### Sauvegarde
| Méthode | Route | Rôle |
|---------|-------|------|
| POST | `/api/v1/backup` | admin |
| POST | `/api/v1/backup/restore` | admin |
| GET | `/api/v1/backup/:id/download` | admin |

## Formules de calcul

### Moyenne trimestrielle
```
Moyenne = Σ(Note_matière × Coefficient) / Σ(Coefficients)
Exemple : (14×4 + 12×3 + 16×2) / (4+3+2) = 13,78
```

### Rang
```
Position dans le classement décroissant des moyennes de la classe
```

## Sécurité

- Authentification JWT obligatoire sur tous les endpoints (sauf login/refresh)
- Validation Zod sur toutes les entrées
- Rate limiting sur auth (10 req/15min)
- Helmet (en-têtes HTTP sécurisés)
- CORS configuré strictement
- bcrypt cost factor 12
- Audit logging de toutes les actions sensibles
- Soft delete sur toutes les entités (pas de perte de données)
- Journal d'audit immuable

## Déploiement

### Local (desktop) avec accès réseau local

```bash
# 1. Démarrer le serveur
npm start

# 2. Trouver l'IP locale
ipconfig  # Noter l'adresse IPv4 (ex: 192.168.1.42)

# 3. Les enseignants accèdent via : http://192.168.1.42:3000
```

### Variables d'environnement essentielles

| Variable | Description |
|----------|-------------|
| `PORT` | Port du serveur (défaut: 3000) |
| `FIREBASE_PROJECT_ID` | ID du projet Firebase |
| `FIREBASE_CLIENT_EMAIL` | Email du service account |
| `FIREBASE_PRIVATE_KEY` | Clé privée du service account |
| `JWT_ACCESS_SECRET` | Secret JWT (32+ caractères) |
| `JWT_REFRESH_SECRET` | Secret refresh JWT (32+ caractères) |
| `CORS_ORIGIN` | Origine autorisée (défaut: http://localhost:5173) |
