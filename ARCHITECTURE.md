# Architektur-Dokumentation

## System-Übersicht

Die Rezept-App folgt einer klassischen 3-Tier-Architektur mit klarer Trennung zwischen Präsentation, Business-Logik und Datenhaltung.

```
┌─────────────────────────────────────────────────┐
│           Frontend (React/Vite)                 │
│  - React Components                             │
│  - Zustand State Management                     │
│  - Axios API Client                             │
│  - Dark Mode, Responsive Design                 │
└────────────────┬────────────────────────────────┘
                 │ HTTP/REST API
                 │ JWT Authentication
┌────────────────▼────────────────────────────────┐
│        Backend (Node.js/Express)                │
│  - RESTful API Endpoints                        │
│  - JWT Auth Middleware                          │
│  - Recipe Parser (Cheerio)                      │
│  - Conversion Service                           │
│  - Image Processing (Sharp)                     │
│  - Rate Limiting                                │
└────────────────┬────────────────────────────────┘
                 │ pg Client
                 │ SQL Queries
┌────────────────▼────────────────────────────────┐
│         Database (PostgreSQL 16)                │
│  - Normalized Schema                            │
│  - Full-text Search (pg_trgm)                   │
│  - Indexes for Performance                      │
│  - Triggers for Timestamps                      │
└─────────────────────────────────────────────────┘

         Persistent Volumes
         ├─ postgres_data (Database)
         └─ recipe_uploads (Images)
```

## Datenmodell

### Kernentitäten

1. **users**: Benutzerkonten mit Authentifizierung
2. **recipes**: Hauptentität für Rezepte
3. **recipe_ingredients**: Zutaten pro Rezept (1:n)
4. **recipe_instructions**: Zubereitungsschritte (1:n)
5. **recipe_images**: Bilder pro Rezept (1:n)
6. **categories**: Vordefinierte Kategorien
7. **tags**: Dynamische Tags (m:n über recipe_tags)
8. **unit_conversions**: Cups-zu-Gramm-Tabelle
9. **recipe_shares**: Interne Freigaben (m:n)

### Beziehungen

```
users (1) ──── (n) recipes
recipes (1) ──── (n) recipe_ingredients
recipes (1) ──── (n) recipe_instructions
recipes (1) ──── (n) recipe_images
recipes (n) ──── (1) categories
recipes (n) ──── (n) tags [via recipe_tags]
recipes (n) ──── (n) users [via recipe_shares]
```

## API-Endpunkte

### Authentifizierung
- `POST /api/auth/register` - Neuen Benutzer registrieren
- `POST /api/auth/login` - Anmelden und JWT erhalten
- `GET /api/auth/me` - Aktuellen Benutzer abrufen

### Rezepte
- `GET /api/recipes` - Liste aller Rezepte (mit Filter/Search)
- `GET /api/recipes/:id` - Einzelnes Rezept (mit opt. Portionsumrechnung)
- `POST /api/recipes` - Neues Rezept erstellen
- `PUT /api/recipes/:id` - Rezept aktualisieren
- `DELETE /api/recipes/:id` - Rezept löschen
- `GET /api/recipes/public/:token` - Öffentliches Rezept per Token

### Bilder
- `POST /api/recipes/:id/images` - Bild hochladen
- `DELETE /api/recipes/:id/images/:imageId` - Bild löschen

### Import
- `POST /api/import/parse-url` - Rezept von URL parsen

### Weitere
- `GET /api/categories` - Alle Kategorien
- `GET /api/tags` - Alle Tags
- `GET /api/users/search` - Benutzer suchen (für Sharing)
- `GET /api/health` - Health-Check

## Sicherheitskonzept

### Authentifizierung
- **JWT** mit konfigurierbarem Secret und Ablaufzeit
- Tokens im Authorization Header: `Bearer <token>`
- Optional Authentication für öffentliche Rezepte

### Autorisierung
- **Ownership-basiert**: Nur Ersteller kann eigene Rezepte bearbeiten/löschen
- **Role-basiert**: Admin-Rolle für erweiterte Rechte
- Public Token für lesende Freigabe ohne Auth

### Datenschutz
- Passwörter mit bcrypt (10 Runden)
- Uploads validiert (Typ, Größe)
- SQL-Injection-Schutz durch Prepared Statements
- Rate Limiting gegen Brute-Force

### Uploads
- MIME-Type-Validierung
- File-Size-Limit
- Automatische Bildoptimierung
- Unique Filenames (UUID)

## Performance-Optimierungen

### Datenbank
- **Indexes** auf häufig genutzte Spalten (user_id, category_id, visibility)
- **Full-text Index** mit pg_trgm für fuzzy search
- **Connection Pooling** (max 20 Connections)
- **Query-Logging** für Performance-Analyse

### API
- **Pagination** für Listen-Endpunkte
- **Selective Field Loading** (JOIN nur bei Bedarf)
- **Image Optimization** (Sharp: Resize + JPEG Compression)

### Frontend
- **Code-Splitting** durch Vite
- **Lazy Loading** von Routes
- **Persistent Storage** (Zustand) für Auth State
- **Optimistic UI Updates** wo möglich

## Skalierung

### Horizontal
- **Backend**: Mehrere Container hinter Load Balancer
- **Database**: PostgreSQL Replication (Master-Slave)
- **Uploads**: Shared Volume oder Object Storage (S3)

### Vertikal
- PostgreSQL Memory-Tuning (shared_buffers, effective_cache_size)
- Node.js Cluster Mode (Worker Threads)
- Nginx Worker Processes

## Erweiterbarkeit

### Modulare Architektur
- **Services**: Wiederverwendbare Business-Logik (Parser, Conversion)
- **Middleware**: Pluggable Auth, Upload, Validation
- **Routes**: RESTful Structure, einfach erweiterbar

### Geplante Erweiterungen
1. **Shopping List**: Neue Tabelle + API Endpoints
2. **Meal Planning**: Kalender-Integration
3. **Nutrition Info**: API-Integration (z.B. USDA)
4. **Social Features**: Kommentare, Ratings
5. **Export**: PDF-Generator (Puppeteer)
6. **Multi-Language**: i18n mit react-i18next

## Deployment

### Docker-first
- Multi-stage Builds für kleine Images
- Health-checks für Orchestrierung
- Named Volumes für Persistenz
- Restart-Policies für Stabilität

### Production-Ready
- Environment-basierte Konfiguration
- Structured Logging
- Graceful Shutdown
- Backup-Strategie dokumentiert

## Monitoring

### Empfohlene Tools
- **Logs**: docker-compose logs, Loki
- **Metrics**: Prometheus + Grafana
- **Traces**: Jaeger (optional)
- **Health**: `/api/health` Endpoint

### Key Metrics
- API Response Time
- Database Query Performance
- Upload Success Rate
- Authentication Success Rate
- Active Users

## Technologie-Entscheidungen

### Warum Node.js/TypeScript?
- Async I/O perfekt für API-Server
- Große Community & Libraries
- Type-Safety durch TypeScript
- Single Language (JS/TS für Frontend & Backend)

### Warum PostgreSQL?
- Robuste relationale Datenbank
- Hervorragende Full-text Search
- ACID-konform
- Große Open-Source Community

### Warum React?
- Bewährt und stabil
- Große Community & Ökosystem
- Gute Performance
- TypeScript-Support

### Warum Vite?
- Extrem schnelle Build-Zeiten
- Hot Module Replacement
- Optimale Production Builds
- Native ES Modules

### Warum Docker?
- Reproduzierbare Builds
- Einfaches Deployment
- Isolation & Sicherheit
- Plattform-unabhängig

## Best Practices

### Code-Qualität
- TypeScript Strict Mode
- ESLint & Prettier (konfigurierbar)
- Klare Folder-Struktur
- Aussagekräftige Namen

### Security
- Keine Secrets in Code
- Environment-basierte Config
- Input Validation
- Output Sanitization
- Regular Dependency Updates

### Testing (optional erweiterbar)
- Unit Tests (Jest)
- Integration Tests (Supertest)
- E2E Tests (Playwright)
