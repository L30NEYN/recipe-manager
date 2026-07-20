# GitHub-Upload Anleitung

## Schritt 1: Git-Repository initialisieren

```bash
cd recipe-app
git init
git add .
git commit -m "Initial commit: Complete self-hosted recipe management app

Features:
- Full CRUD for recipes
- URL import with automatic parsing
- Portion scaling & cups-to-grams conversion
- Image upload with optimization
- Full-text search & filters
- Categories & tags
- Sharing (private/internal/public)
- Docker-based deployment
- PostgreSQL database
- React + TypeScript frontend
- Node.js + Express backend"
```

## Schritt 2: GitHub-Repository erstellen

### Option A: Via GitHub WebUI
1. Gehe zu https://github.com/new
2. Repository-Name: z.B. "recipe-manager"
3. Beschreibung: "Self-hosted recipe management app with Docker"
4. Sichtbarkeit: Public oder Private
5. **NICHT** "Initialize with README" aktivieren
6. Klicke "Create repository"

### Option B: Via GitHub CLI
```bash
gh repo create recipe-manager --public --description "Self-hosted recipe management app"
```

## Schritt 3: Remote hinzufügen und pushen

```bash
# Remote hinzufügen
git remote add origin https://github.com/<username>/recipe-manager.git

# Oder mit SSH:
git remote add origin git@github.com:<username>/recipe-manager.git

# Branch umbenennen (falls nötig)
git branch -M main

# Pushen
git push -u origin main
```

## Schritt 4: Repository-Einstellungen

### README als Repository-Homepage
GitHub erkennt automatisch die README.md und zeigt sie auf der Repository-Startseite an.

### Topics hinzufügen
Gehe zu Settings > About und füge Topics hinzu:
- `recipe-management`
- `docker`
- `self-hosted`
- `typescript`
- `react`
- `nodejs`
- `postgresql`

### GitHub Pages (optional)
Falls du die Frontend-Docs oder Demo hosten möchtest:
1. Settings > Pages
2. Source: "main" Branch
3. Folder: "/docs" (falls vorhanden)

## Schritt 5: .gitignore überprüfen

Stelle sicher, dass folgende Dateien/Ordner NICHT committed werden:
```
node_modules/
.env
.env.local
.env.production
dist/
build/
uploads/
*.log
.DS_Store
```

## Schritt 6: Secrets entfernen

⚠️ **Wichtig**: Überprüfe, dass keine Secrets im Code sind:
- `.env` Dateien
- Passwörter
- JWT-Secrets
- API-Keys
- Datenbank-Credentials

Nur `.env.example` mit Platzhaltern committen!

## Optional: CI/CD mit GitHub Actions

Erstelle `.github/workflows/docker-build.yml`:

```yaml
name: Docker Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Backend
      run: docker build -t recipe-backend ./backend
    
    - name: Build Frontend
      run: docker build -t recipe-frontend ./frontend
    
    - name: Test with Docker Compose
      run: |
        docker-compose up -d
        sleep 10
        curl http://localhost:5000/api/health
        docker-compose down
```

## Optional: Automatische Releases

Erstelle `.github/workflows/release.yml`:

```yaml
name: Create Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Create Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        draft: false
        prerelease: false
```

## Collaboration

### Issues aktivieren
Settings > Features > Issues aktivieren für Bug-Reports und Feature-Requests

### Pull Request Template
Erstelle `.github/pull_request_template.md`:

```markdown
## Beschreibung
<!--- Beschreibe deine Änderungen -->

## Art der Änderung
- [ ] Bug-Fix
- [ ] Neues Feature
- [ ] Breaking Change
- [ ] Dokumentation

## Checklist
- [ ] Code folgt dem Style-Guide
- [ ] Selbst-Review durchgeführt
- [ ] Dokumentation aktualisiert
- [ ] Keine Secrets committed
```

## Best Practices

### Commit-Messages
```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Scope: backend, frontend, database, docker, etc.

Beispiele:
feat(backend): Add recipe import from URL
fix(frontend): Fix dark mode toggle
docs(readme): Update installation instructions
```

### Branching-Strategie
```
main          - Production-ready code
dev           - Development branch
feature/*     - New features
bugfix/*      - Bug fixes
hotfix/*      - Urgent fixes
```

## Troubleshooting

### "Repository not found"
```bash
# SSH-Key überprüfen
ssh -T git@github.com

# Remote URL überprüfen
git remote -v

# Remote neu setzen
git remote set-url origin <neue-url>
```

### "Permission denied"
```bash
# Für HTTPS: Personal Access Token verwenden
# Settings > Developer settings > Personal access tokens

# Für SSH: SSH-Key hinzufügen
# Settings > SSH and GPG keys
```

### Große Dateien
Für Dateien >100MB nutze Git LFS:
```bash
git lfs install
git lfs track "*.psd"
git add .gitattributes
```
