# Rezept-Manager - Self-Hosted Recipe Management App

Eine vollständig selbst hostbare, moderne Rezeptverwaltung mit Docker, die ohne Cloud-Zwang funktioniert.

## 🎯 Features

### Core-Funktionen
- ✅ Vollständige Rezeptverwaltung (Erstellen, Bearbeiten, Löschen, Archivieren)
- ✅ Leistungsstarke Volltextsuche und Filterung
- ✅ Kategorien und Tags für Organisation
- ✅ Favoriten-Markierung
- ✅ Bilder pro Rezept (Upload, Verwaltung, automatische Optimierung)
- ✅ Portionsumrechnung mit dynamischer Neuberechnung der Mengen
- ✅ Cups-zu-Gramm-Konvertierung mit zutatspezifischer Logik
- ✅ Rezept-Import per URL mit automatischem Parsing
- ✅ Kochmodus mit Schritt-für-Schritt-Anleitung
- ✅ Responsives Design (Desktop & Mobile)
- ✅ Dunkelmodus

### Teilen & Rechte
- ✅ Private Rezepte (nur für eigenen Benutzer)
- ✅ Interne Freigabe (alle authentifizierten Benutzer)
- ✅ Öffentliche Links mit Token (teilbar ohne Login)
- ✅ Benutzerverwaltung mit Rollen (Admin/User)

### Technologie
- ✅ Docker-first Architektur
- ✅ Persistente Datenbank (PostgreSQL)
- ✅ Persistente Bild-Uploads
- ✅ JWT-basierte Authentifizierung
- ✅ Sicheres Passwort-Hashing
- ✅ API Rate Limiting
- ✅ Reverse Proxy Ready

## 📋 Technologie-Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express + TypeScript
- **Datenbank**: PostgreSQL 16 mit pg_trgm Extension
- **Authentifizierung**: JWT + bcrypt
- **Bild-Verarbeitung**: Sharp (automatische Optimierung)
- **Rezept-Parser**: Cheerio (HTML-Scraping mit JSON-LD, Microdata, Schema.org Support)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build-Tool**: Vite
- **Routing**: React Router
- **State Management**: Zustand mit Persist
- **API Client**: Axios
- **Styling**: Custom CSS mit Dark Mode

### Infrastruktur
- **Container**: Docker + Docker Compose
- **Web-Server**: Nginx (Frontend)
- **Volumes**: Persistente Daten für DB und Uploads

## 🚀 Schnellstart

### Voraussetzungen

- Docker (v20+)
- Docker Compose (v2+)
- 2GB freier RAM
- 5GB freier Speicherplatz

### Installation

1. **Repository klonen oder herunterladen**

```bash
# Falls Git verfügbar:
git clone <repository-url>
cd recipe-app

# Oder: ZIP herunterladen und entpacken
```

2. **Umgebungsvariablen konfigurieren**

```bash
cp .env.example .env
```

Bearbeite `.env` und ändere **mindestens**:
- `POSTGRES_PASSWORD` (starkes Passwort)
- `JWT_SECRET` (langer zufälliger String, z.B. aus `openssl rand -base64 32`)

3. **App starten**

```bash
docker-compose up -d
```

Beim ersten Start werden alle Container gebaut (dauert 3-5 Minuten).

4. **Zugriff**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5432

### Erster Login

Die Datenbank wird mit Demo-Accounts initialisiert:

**Admin-Account:**
- Username: `admin`
- Password: `admin123`

**Demo-Account:**
- Username: `demo`
- Password: `user123`

⚠️ **Wichtig**: Ändere die Passwörter nach dem ersten Login oder lösche die Demo-Accounts!

## 🔧 Konfiguration

### Umgebungsvariablen (.env)

```bash
# Datenbank
POSTGRES_DB=recipedb
POSTGRES_USER=recipeuser
POSTGRES_PASSWORD=<STARKES-PASSWORT>
POSTGRES_PORT=5432

# Backend
NODE_ENV=production
BACKEND_PORT=5000
JWT_SECRET=<LANGER-ZUFÄLLIGER-STRING>
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760  # 10MB in Bytes

# Frontend
FRONTEND_PORT=3000
VITE_API_URL=http://localhost:5000

# Application
BASE_URL=http://localhost:3000
```

### Ports anpassen

Falls die Standard-Ports bereits belegt sind, ändere in `.env`:

```bash
FRONTEND_PORT=8080
BACKEND_PORT=8081
POSTGRES_PORT=5433
```

### Hinter Reverse Proxy betreiben

**Beispiel: Nginx Reverse Proxy**

```nginx
server {
    listen 80;
    server_name recipes.example.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Dann in `.env`:
```bash
BASE_URL=https://recipes.example.com
VITE_API_URL=https://recipes.example.com
```

**Traefik mit Docker Labels** (docker-compose.yml erweitern):

```yaml
services:
  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.recipes.rule=Host(`recipes.example.com`)"
      - "traefik.http.routers.recipes.entrypoints=websecure"
      - "traefik.http.routers.recipes.tls.certresolver=letsencrypt"
```

## 📚 Verwendung

### Rezept manuell erstellen

1. Anmelden
2. Auf "Neues Rezept" klicken
3. Alle Felder ausfüllen (Zutaten und Anleitung Zeile für Zeile)
4. Optional: Kategorie, Tags, Bilder hinzufügen
5. Speichern

### Rezept per URL importieren

1. Auf "Rezept importieren" klicken
2. URL einer Rezeptseite eingeben (z.B. Chefkoch, AllRecipes, etc.)
3. Vorschau wird angezeigt - Parser extrahiert automatisch:
   - Titel, Beschreibung
   - Zutaten mit Mengen und Einheiten
   - Zubereitungsschritte
   - Zeiten, Portionen
   - Hauptbild
4. Daten manuell korrigieren/ergänzen
5. Speichern

**Unterstützte Formate:**
- JSON-LD (Schema.org Recipe)
- Microdata
- Generische HTML-Struktur

### Portionen umrechnen

1. Rezept öffnen
2. Buttons +/- neben Portionsanzahl nutzen
3. Alle Zutatenmengen werden automatisch neu berechnet

### Cups-zu-Gramm-Konvertierung

Die App enthält eine Konvertierungstabelle für häufige Zutaten:
- Mehl: 1 Cup = 120g
- Zucker: 1 Cup = 200g
- Butter: 1 Cup = 227g
- u.v.m.

Neue Zutat hinzufügen (per SQL):

```sql
INSERT INTO unit_conversions (ingredient_name, cups_to_grams, is_approximate) 
VALUES ('Reis (ungekocht)', 185, false);
```

### Rezepte teilen

**Privat** (Standard):
- Nur für dich sichtbar

**Intern**:
- Alle authentifizierten Benutzer können es sehen
- Nur du kannst es bearbeiten

**Öffentlich**:
- Jeder mit dem Link kann es lesen (ohne Login)
- Link-Format: `https://recipes.example.com/recipes/public/<token>`
- Token ist 64 Zeichen lang und schwer zu erraten

## 🔒 Sicherheit

### Passwörter

- Werden mit bcrypt gehasht (10 Runden)
- Nie im Klartext gespeichert
- Minimallänge: 6 Zeichen

### JWT Tokens

- Signiert mit Secret aus `.env`
- Ablauf-Zeit konfigurierbar (Standard: 7 Tage)
- Gespeichert in LocalStorage (Frontend)

### Upload-Validierung

- Nur Bilder erlaubt: JPEG, PNG, WebP, GIF
- Max. Dateigröße: 10MB (konfigurierbar)
- Bilder werden automatisch optimiert (Sharp)
- Max. Auflösung: 1200x1200px

### Rate Limiting

- API: 100 Requests pro 15 Minuten pro IP
- Verhindert Brute-Force-Angriffe

### Empfohlene Maßnahmen

1. **Starke Passwörter**:
   ```bash
   # JWT Secret generieren:
   openssl rand -base64 32

   # Postgres Password generieren:
   openssl rand -base64 24
   ```

2. **HTTPS verwenden** (bei Reverse Proxy)
3. **Firewall**: Nur Ports 80/443 öffentlich, Rest lokal
4. **Regelmäßige Updates**: `docker-compose pull && docker-compose up -d`

## 💾 Backup & Restore

### Datenbank-Backup

**Manuell:**

```bash
docker-compose exec postgres pg_dump -U recipeuser recipedb > backup.sql
```

**Automatisiert (Cron-Job):**

```bash
# /etc/cron.daily/recipe-backup
#!/bin/bash
cd /pfad/zur/recipe-app
docker-compose exec -T postgres pg_dump -U recipeuser recipedb | gzip > /backup/recipe-$(date +%Y%m%d).sql.gz
find /backup -name "recipe-*.sql.gz" -mtime +30 -delete
```

### Bilder-Backup

```bash
docker run --rm -v recipe-app_recipe_uploads:/data -v $(pwd):/backup alpine \
  tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore

**Datenbank:**

```bash
cat backup.sql | docker-compose exec -T postgres psql -U recipeuser recipedb
```

**Bilder:**

```bash
docker run --rm -v recipe-app_recipe_uploads:/data -v $(pwd):/backup alpine \
  tar xzf /backup/uploads-20240720.tar.gz -C /data
```

### Vollständiges Backup-Skript

```bash
#!/bin/bash
BACKUP_DIR="/backup/recipe-app"
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR

# DB Backup
docker-compose exec -T postgres pg_dump -U recipeuser recipedb | gzip > $BACKUP_DIR/db-$DATE.sql.gz

# Uploads Backup
docker run --rm -v recipe-app_recipe_uploads:/data -v $BACKUP_DIR:/backup alpine \
  tar czf /backup/uploads-$DATE.tar.gz -C /data .

# .env Backup
cp .env $BACKUP_DIR/env-$DATE

# Alte Backups löschen (älter als 30 Tage)
find $BACKUP_DIR -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR"
```

## 🔄 Updates

### App aktualisieren

```bash
# Stoppen
docker-compose down

# Neueste Images ziehen
docker-compose pull

# Neu bauen (falls Code-Änderungen)
docker-compose build --no-cache

# Starten
docker-compose up -d

# Logs prüfen
docker-compose logs -f
```

### Datenbank-Migration

Bei Schema-Änderungen:

```bash
docker-compose exec postgres psql -U recipeuser recipedb -f /pfad/zu/migration.sql
```

## 🧹 Wartung

### Logs anzeigen

```bash
# Alle Services
docker-compose logs -f

# Nur Backend
docker-compose logs -f backend

# Nur Frontend
docker-compose logs -f frontend

# Nur Datenbank
docker-compose logs -f postgres
```

### Speicherplatz prüfen

```bash
# Docker Volumes
docker system df -v

# Recipe App Volumes
docker volume ls | grep recipe
```

### Alte Images entfernen

```bash
docker system prune -a
```

### Container neu starten

```bash
# Alle
docker-compose restart

# Nur ein Service
docker-compose restart backend
```

## 🐛 Fehlerbehebung

### Frontend lädt nicht

```bash
# Nginx Logs prüfen
docker-compose logs frontend

# Container neu starten
docker-compose restart frontend

# Build neu durchführen
docker-compose build --no-cache frontend
docker-compose up -d
```

### Backend API nicht erreichbar

```bash
# Backend Logs
docker-compose logs backend

# Datenbank-Verbindung prüfen
docker-compose exec backend sh -c "echo 'select 1' | nc postgres 5432"

# Container neu starten
docker-compose restart backend
```

### Datenbank-Probleme

```bash
# Logs
docker-compose logs postgres

# Verbindung testen
docker-compose exec postgres psql -U recipeuser -d recipedb -c "SELECT version();"

# Performance prüfen
docker-compose exec postgres psql -U recipeuser -d recipedb -c "SELECT * FROM pg_stat_activity;"
```

### Upload funktioniert nicht

```bash
# Volume prüfen
docker volume inspect recipe-app_recipe_uploads

# Berechtigungen prüfen
docker-compose exec backend ls -la /app/uploads

# Bei Problemen: Volume neu erstellen
docker-compose down
docker volume rm recipe-app_recipe_uploads
docker-compose up -d
```

## 📊 Performance-Tuning

### PostgreSQL optimieren

```sql
-- Shared buffers (25% of RAM)
ALTER SYSTEM SET shared_buffers = '512MB';

-- Effective cache size (50-75% of RAM)
ALTER SYSTEM SET effective_cache_size = '2GB';

-- Work mem (RAM / max_connections / 2)
ALTER SYSTEM SET work_mem = '16MB';

-- Maintenance work mem
ALTER SYSTEM SET maintenance_work_mem = '128MB';

-- Reload config
SELECT pg_reload_conf();
```

### Backend Scaling

Für höhere Last mehrere Backend-Instanzen:

```yaml
services:
  backend:
    deploy:
      replicas: 3
```

### Nginx Caching (Reverse Proxy)

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=recipe_cache:10m max_size=1g;

location / {
    proxy_cache recipe_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    # ... rest of proxy config
}
```

## 🤝 Beitragen

Beiträge sind willkommen! Bitte:
1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Pushe zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📝 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

## 🙏 Danksagung

- **Node.js** & **Express** - Backend Framework
- **React** & **Vite** - Frontend Framework
- **PostgreSQL** - Datenbank
- **Docker** - Containerisierung
- **TypeScript** - Type Safety
- **Cheerio** - HTML Parsing
- **Sharp** - Bildoptimierung

## 📧 Support

Bei Problemen oder Fragen:
1. Prüfe die [Fehlerbehebung](#-fehlerbehebung)
2. Suche in den [GitHub Issues](https://github.com/L30NEYN/recipe-manager/issues)
3. Erstelle ein neues Issue mit detaillierter Beschreibung

## 🗺️ Roadmap

### Geplante Features

- [ ] Shopping-Liste aus Rezepten generieren
- [ ] Meal-Planning / Wochenplan
- [ ] Nährwertangaben (API-Integration)
- [ ] Bewertungen & Kommentare
- [ ] PDF-Export von Rezepten
- [ ] Multi-Language Support (i18n)
- [ ] Mobile App (React Native)
- [ ] OCR für Rezepte aus Fotos
- [ ] Rezept-Kollektionen
- [ ] Social Sharing (Pinterest, Instagram)

---

**Viel Spaß beim Kochen! 🍳**