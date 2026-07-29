# MÉMOIRE BACKEND — Gestion Scolaire

## État actuel

| Élément | Statut |
|---------|--------|
| **Phases 1-3** (Analyse, Schéma, Contrat API) | ✅ Validé |
| **Phase 4** (Fondations : serveur, auth, middleware) | ✅ Validé |
| **Phase 5** (Modules métier) | ✅ Complété |
| **Phase 6** (Durcissement & livraison) | ✅ En cours |

## Modules livrés

1. **Auth** — Login, refresh, logout, change-password, JWT + bcrypt
2. **Enseignants** — CRUD + matricule auto + soft delete
3. **Élèves** — CRUD + code auto + filtre classe
4. **Classes** — CRUD + filtre filière
5. **Matières** — CRUD + unicité code
6. **Coefficients** — Spécifiques (règle de précédence documentée)
7. **Affectations** — Lien teacher → class → subject (unicité quadruplet)
8. **Périodes** — CRUD + toggle-open + validate (cascade notes)
9. **Notes** — Batch upsert, submit, validate, reopen (machine à états complète)
10. **Dashboard enseignant** — Affectations + élèves + périodes ouvertes
11. **Bulletins PDF** — Génération avec pdfkit (logo, notes, moyennes, rang, signatures)
12. **Tableaux d'honneur PDF** — Top élèves par classe/trimestre
13. **Statistiques** — Vue d'ensemble + stats classe détaillées
14. **Sauvegarde/Restauration** — Export/import toutes collections Firestore

## Décisions techniques

| Décision | Justification |
|----------|---------------|
| Firestore (NoSQL) malgré relations | Choix du client |
| PDF stocké en base64 dans Firestore | Simplification (v1) — migrer vers Firebase Storage recommandé |
| Blacklist JWT en mémoire | Acceptable en v1 — migrer vers Firestore si redémarrage fréquent |
| Coefficient spécifique > coefficient défaut | Règle de précédence documentée Phase 1 + implémentée |
| Notes stockées par étudiant×matière×période | Évite les sous-collections complexes (collection groups queries) |

## Prochaine étape recommandée

**Frontend :** Interface utilisateur (React / Vue / HTML vanilla) pour consommer l'API.

## Contrat d'API

Version actuelle : **1.0.0** — Documentée via Swagger à `/api-docs`
