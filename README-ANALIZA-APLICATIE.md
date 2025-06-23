# Analiză Aplicație: Sistem de Monitorizare Boli Infecțioase

## Prezentare Generală

Această aplicație este un sistem complet de monitorizare și management al bolilor infecțioase, construit cu o arhitectură modulară care include:

- **Backend**: API REST construit cu NestJS și TypeScript
- **Admin Frontend**: Interface de administrare cu Next.js 15 și React 19
- **User Frontend**: Interface publică cu Next.js 15 și React 19

## Arhitectura Sistemului

### Backend (NestJS + PostgreSQL)
- **Framework**: NestJS cu TypeScript
- **Baza de date**: PostgreSQL cu TypeORM
- **Autentificare**: JWT cu bcrypt pentru hash-uirea parolelor
- **Securitate**: Helmet.js pentru headers de securitate, CORS configurat
- **Port**: 5000

#### Entități principale:
1. **User**: Utilizatori cu roluri (admin/user)
2. **Case**: Cazuri de boli infecțioase
3. **Location**: Locații geografice cu coordonate

#### Module și funcționalități:
- **Auth**: Autentificare JWT
- **Users**: Management utilizatori
- **Cases**: CRUD cazuri, filtrare, statistici
- **Locations**: Management locații
- **Statistics**: Rapoarte și analize statistice

### Admin Frontend (Next.js)
- **Framework**: Next.js 15 cu React 19
- **UI**: Mantine Core + Radix UI + TailwindCSS
- **Icons**: React Icons (Feather Icons)
- **Charts**: Recharts
- **Maps**: Leaflet + React Leaflet
- **Autentificare**: JWT cu localStorage

#### Pagini principale:
1. **Dashboard** (`/`): Statistici generale, grafice, overview
2. **Cases** (`/cases`): CRUD cazuri cu filtrare avansată
3. **Locations** (`/locations`): Management locații
4. **Statistics** (`/statistics`): Rapoarte detaliate
5. **Predictions** (`/predictions`): Simulări și predicții focare
6. **Login** (`/login`): Autentificare administratori

### User Frontend (Next.js)
- **Framework**: Next.js 15 cu React 19
- **UI**: TailwindCSS cu componente custom
- **Charts**: Recharts
- **Maps**: Leaflet pentru vizualizare geospațială

#### Pagini principale:
1. **Home** (`/`): Landing page cu statistici publice
2. **Map** (`/map`): Hartă interactivă cu distribuția cazurilor
3. **Statistics** (`/statistics`): Statistici publice
4. **Cases** (`/cases`): Vizualizare cazuri publice
5. **About** (`/about`): Informații despre platformă

## Funcționalități Cheie

### 1. Management Cazuri
- **CRUD complet**: Creare, citire, actualizare, ștergere cazuri
- **Date capturate**:
  - ID pacient, vârstă, gen
  - Boală, simptome (array)
  - Status (suspectat, confirmat, recuperat, decedat)
  - Locație (cu relație către Location)
  - Data diagnosticului
  - Note suplimentare

### 2. System de Locații
- **Date geografice**: Nume, oraș, județ, țară
- **Coordonate**: Latitudine și longitudine pentru mapping
- **Relații**: Un-to-many cu cazurile
- **Densitate populație**: Pentru analize demografice

### 3. Statistici și Raportare
- **Statistici generale**: Total cazuri, distribuție pe status, locații top
- **Analize temporale**: Evoluție în timp (zilnic, săptămânal, lunar)
- **Distribuție geografică**: Cazuri pe județe și locații
- **Comparații boli**: Statistici per tip de boală

### 4. Vizualizare Geospațială
- **Harta de căldură**: Intensitatea cazurilor pe zone
- **Marcatori**: Locații exacte cu numărul de cazuri
- **Interactivitate**: Zoom, click pentru detalii
- **Multiple view modes**: Heat map vs markers

### 5. Predicții și Simulări (Admin)
- **Simulare răspândire**: Modelul SIR/SEIR pentru predicții
- **Predicție focare**: Analiză risc de focar în locații
- **Parametri configurabili**: R0, rata de recuperare, populația inițial infectată
- **Vizualizare rezultate**: Grafice temporale cu evoluția

### 6. Autentificare și Securitate
- **Roluri utilizatori**: Admin (CRUD complet) vs User (readonly)
- **JWT tokens**: Autentificare securizată
- **Interceptors**: Auto-refresh și logout la expirare
- **Guards**: Protecție rute admin vs publice

## Stack Tehnologic

### Backend
```json
{
  "nestjs": "^10.0.0",
  "typeorm": "^0.3.21",
  "postgresql": "PostgreSQL database",
  "jwt": "^11.0.0",
  "bcrypt": "^5.1.1",
  "helmet": "^8.1.0"
}
```

### Admin Frontend
```json
{
  "next": "15.2.4",
  "react": "^19.0.0",
  "mantine": "^7.17.3",
  "tailwindcss": "^4",
  "recharts": "^2.15.1",
  "leaflet": "^1.9.4",
  "axios": "^1.8.4"
}
```

### User Frontend
```json
{
  "next": "15.2.4",
  "react": "^19.0.0",
  "tailwindcss": "^4",
  "recharts": "^2.15.1",
  "leaflet": "^1.9.4",
  "axios": "^1.8.4"
}
```

## Fluxul de Date

1. **Admin** se autentifică și adaugă cazuri în sistem
2. **Cazurile** sunt stocate cu informații complete (pacient, locație, simptome)
3. **Serviciile de statistici** procesează datele pentru analize
4. **Dashboard-ul admin** afișează statistici complete cu CRUD
5. **Frontend-ul public** afișează date agregated fără informații sensibile
6. **Harta publică** vizualizează distribuția geografică
7. **Simulările** folosesc datele istorice pentru predicții

## Securitate și Privacy

- **Separarea accesului**: Admin vs public cu permisiuni diferite
- **Anonimizare**: ID-uri pacienți, nu nume complete
- **JWT security**: Tokens cu expirare automată
- **CORS**: Configurare restrictivă pentru origini permise
- **Validare**: Input validation pe backend cu class-validator

## Cazuri de Utilizare

1. **Epidemiolog**: Monitorizează focarele, analizează tendințele
2. **Administrator sănătate**: Raportare și management cazuri
3. **Cercetător**: Acces la statistici pentru studii
4. **Public**: Informare despre situația locală
5. **Decidenti**: Dashboards pentru luarea deciziilor

Aceasta este o aplicație completă de eHealth pentru monitorizarea bolilor infecțioase, cu focus pe analiza epidemiologică și suportul decizional în sănătatea publică. 