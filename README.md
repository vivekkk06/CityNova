# CityNova: Transparent and interactive civic reporting and accountable governance Platform
### Ponda Municipal Council (PMC), Goa
**Enforcing the Goa (Right of Citizens to Time-Bound Delivery of Public Services) Act, 2013 & Goa Municipalities Act, 1968**

CityNova is a production-grade, local-first civic reporting and governance ledger deployed for **Ponda Municipal Council (PMC), Goa**. It eliminates accountability gaps between citizens and municipal engineers through **The Promise-to-Proof Ledger**, **Two-Stage Geo-Gated Resolution Gates**, **Multimodal AI Intake**, and **Spatial GIS Deduplication**.

---

## 🏛️ Grounded in Ponda, Goa: Jurisdictions & Wards

CityNova models the real municipal wards of Ponda Municipal Council with precise GeoJSON boundary polygons:

| Ward Code | Ward Name & Localities | Jurisdiction Zone | Key Landmarks |
|---|---|---|---|
| **WARD-01** | **Ward 1 - Upper Bazar & Sadar Heritage** | Central Heritage & Market Core | PMC Administrative Bhavan, Old Bus Stand, Kranti Maidan, Almeida High School, Municipal Vegetable & Fish Market |
| **WARD-02** | **Ward 2 - Khadpabandh & Tisk Urban Corridor** | Commercial & Healthcare Corridor | Tisk Highway Junction, Ponda Sub-District Hospital, Rajiv Gandhi Kala Mandir, Khadpabandh Housing societies |
| **WARD-03** | **Ward 3 - Curti & Khandepar Riverfront Belt** | Water Works & Industrial Outer Ring | PWD Khandepar Water Works & Raw Water Intake, Curti Industrial Estate, KTC Bus Stand, Betora Bypass |

---

## 🛠️ Municipal Departments & Statutory Goa SLA Mandates

Every reported issue is mapped directly to responsible Goan agencies with statutory turnaround deadlines under the **Goa (Right of Citizens to Time-Bound Delivery of Public Services) Act, 2013**:

1. **PWD Division III (Khandepar Water Works)**:
   - *Scope*: Drinking water feeder pipeline ruptures, treatment plant distribution, pressure failures.
   - *Statutory SLA*: 8-Hour Emergency Containment; mandatory free municipal water tanker provision if supply disruption exceeds 12 hours.
2. **PWD Works Division XIV (Roads & Bridges, Ponda)**:
   - *Scope*: Monsoon pothole craters, asphalt sinkholes, stormwater culverts, road cave-ins.
   - *Statutory SLA*: Mandatory 4-hour barricading, 48-hour mastic bitumen restoration.
3. **Ponda Municipal Council Solid Waste Management Cell**:
   - *Scope*: Market waste dumps, fish market organic waste, door-to-door dry/wet waste segregation, Clean Goa Mission enforcement.
   - *Statutory SLA*: 24-hour clearance for commercial/residential dump blackspots.
4. **Goa Electricity Department (Sub-Station Ponda)**:
   - *Scope*: Streetlight outages, hospital access illumination, fallen cable short-circuit hazards.
   - *Statutory SLA*: 24-hour luminaire fix; 2-hour emergency isolation for live wire hazards.

---

## 🌟 Core System Modules

### 1. Multimodal Intake & AI Structuring (`/report`)
- **Voice Note Recording**: Citizens can record voice notes in Konkani, Marathi, or English. The browser Web Speech API transcribes live, and an audio file is preserved.
- **Automated AI Drafting**: Parses natural speech into structured JSON containing title, category, urgency, suggested department, and legal Citizen Charter rights.
- **Zero-Config Local Fallback**: Built-in CityNova municipal heuristic rule-engine runs completely offline without requiring third-party API keys, with optional OpenAI GPT-4o-mini / Whisper integration.

### 2. GIS Municipal Routing & 50m Spatial Deduplication
- **Geofenced Ward Routing**: Point-in-Polygon ray-casting matches coordinates to Ponda Municipal Council Wards 1, 2, or 3.
- **50-Meter Spatial Deduplication**: If an issue is placed within 50 meters of an active complaint in the same category, citizens are alerted and prompted to **"Upvote / Add Observation"**, preventing duplicate work orders.
- **Dual Identifiers**: Emits immutable platform IDs (`CTN-2026-W03-0842`) alongside municipal legacy reference numbers (`PMC-PWD-8921`).

### 3. The Promise-to-Proof Ledger (`/ticket/[id]`)
- **Commitment Card**: Displays assigned officer (e.g. Datta Gaonkar, PWD Works Div XIV), public commitment date, and real-time SLA countdown.
- **Provenance Tracking**: Every log in the timeline displays certified source labels:
  - `Resident Input` (Green)
  - `AI Structured` (Purple)
  - `Official Update` (Blue)
  - `Proof-of-Work Submitted` (Amber)
  - `Citizen Verified` / `Citizen Disputed` (Teal/Red)
- **Ponda Civic Memory**: Automatically discovers past resolved infrastructure tickets within 150 meters to spot recurring municipal problem areas.

### 4. Two-Stage Resolution Gate (Field Worker App `/field`)
- **Mobile Terminal**: Field workers view work orders with proximity distance calculated from their live or simulated GPS.
- **Geo-Gated "Proof of Work"**: Staff can only mark a ticket *Provisionally Resolved* by uploading an on-site "After" photograph with verified GPS coordinates matching the incident location.
- **Sovereign Citizen Sign-Off**:
  - `[Verify & Close]`: Resident inspects the location and gives final clearance to close the case.
  - `[Dispute & Reopen]`: If work was substandard, the resident can dispute with reason and evidence photos, triggering an immediate escalation to the Chief Officer of Ponda Municipal Council.

### 5. Trust, Safety & Transparency Dashboard
- **Citizen Privacy Filter**: Automatic data minimization masks citizen names (`R***n B****r`) and phone numbers (`+91-98****667`) on public ledgers.
- **Zonal Command Matrix (`/admin`)**: Real-time SLA countdown surveillance and Chief Officer dispute escalation inbox.
- **CityNova AI Copilot**: 24x7 municipal AI assistant with quick prompts for statutory SLAs, officer contacts, and tracking.

---

## 🚀 Quickstart (Zero-Setup Local SQLite Mode)

CityNova runs out-of-the-box using local SQLite and local filesystem storage with no external dependencies required.

```bash
# 1. Install dependencies
npm install

# 2. Push schema to local SQLite database (dev.db)
npx prisma db push

# 3. Seed real Ponda Municipal Council wards, departments, field workers & tickets
npx prisma db seed

# 4. Start Development Server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🐳 Docker Deployment (Full Application Stack)

CityNova is fully dockerized with a production multi-stage Next.js runtime, PostgreSQL with PostGIS spatial extensions, and S3-compatible media storage.

### 1. Start the entire application stack:
```bash
# Build and start all services (web app, PostGIS, and MinIO)
docker compose up --build -d
```

The container automatically:
- Waits for PostgreSQL to be healthy.
- Synchronizes the Prisma schema (`npx prisma db push`).
- Seeds Ponda Municipal Council (PMC) wards, departments, and initial tickets on first startup.
- Serves the Next.js web application on **[http://localhost:3000](http://localhost:3000)**.

### 2. Service Endpoints & Ports:
- **CityNova Web App**: [http://localhost:3000](http://localhost:3000)
- **PostgreSQL / PostGIS**: Host port `5433` (maps to container `5432` to avoid host PostgreSQL port conflicts)
- **MinIO S3 API**: [http://localhost:9010](http://localhost:9010) (maps to container `9000`)
- **MinIO Web Console**: [http://localhost:9011](http://localhost:9011) (Username: `minioadmin` / Password: `minioadminpassword`)

### 3. Docker Hub Image Verification & Notes:
- **`postgis/postgis:16-3.4`**: Verified and active on Docker Hub.
- **`node:22-bookworm-slim`**: Verified official Node.js image with native OpenSSL support for Prisma.
- **`coollabsio/minio:latest`**: Verified alternative on Docker Hub. *Note: The official `minio/minio` image was removed from Docker Hub by upstream MinIO; `coollabsio/minio:latest` is a community-maintained 1:1 drop-in replacement built from MinIO releases with the identical CLI and API interface.*

### 4. Useful Docker Commands:
```bash
# View application logs
docker compose logs -f app

# Force re-seed database with initial PMC data
docker compose exec -e FORCE_SEED=true app /usr/local/bin/docker-entrypoint.sh npm start

# Stop containers
docker compose down

# Stop and wipe persistent database/upload volumes
docker compose down -v
```

---

## 🗺️ Application Routes

| Route | Description |
|---|---|
| `/` | **Landing Page**: Public GIS Ward Map of Ponda, Transparency Ledger, Live Goa SLA metrics. |
| `/report` | **Reporting Wizard**: Voice/Photo/Text intake -> AI Draft review -> GIS Pin on Ponda Map -> Deduplication check. |
| `/ticket/[id]` | **The Promise-to-Proof Docket**: Dual Before/After photo comparison, Two-Stage sign-off gate, neighbor thread, provenance logs, Ponda civic memory. |
| `/field` | **Field Staff Terminal**: Mobile work queue for Ponda PWD/PMC crews with geo-gated resolution photo upload. |
| `/admin` | **Command Matrix**: Real-time SLA countdown surveillance & Chief Officer dispute escalations. |

---

## 📞 Emergency Control Room & Contacts
- **Ponda Municipal Council Control Room**: `0832-2312148`
- **Toll-Free Citizen Helpline**: `1913`
- **PWD Khandepar Water Supply Emergency**: `0832-2314567`
