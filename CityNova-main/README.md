# CityNova

CityNova is a citizen reporting portal. Each account is associated with a state and city; maps, complaint lists, statistics, and the Copilot use that city. Complaint locations are geocoded at account setup and shown on a city-centered map.

## Run locally

1. Install dependencies with `npm install`.
2. Set these server-side values in `.env.local`:

   ```env
   DATABASE_URL="file:./dev.db"
   CITYNOVA_AUTH_SECRET="a-random-secret-at-least-32-characters-long"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

   Generate a secure auth secret with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. Keep `.env.local` private and configure a separate secret in each deployment environment.

3. Apply the Prisma schema with `npx prisma db push`.
4. Optionally add sample Ponda reports with `npx prisma db seed`. Seeding clears existing complaints, but leaves citizen accounts intact.
5. Start Next.js with `npm run dev` and open `http://localhost:3000`.

The project uses SQLite at `prisma/dev.db` by default. Back up the database before applying schema changes. The current schema no longer stores city wards, departments, or officer records.

## Accounts and privacy

Registration asks for name, phone, Aadhaar number, state, city, and a unique username. Aadhaar is stored as a keyed one-way hash to enforce one account per Aadhaar number; it is not sent to the city lookup service and CityNova does not verify it with UIDAI. Login checks username and phone. Add OTP verification before using these credentials for official or sensitive services.

The session cookie is HttpOnly and expires after 30 days. Complaint APIs enforce the signed-in user's city. Public complaint views mask names and phone numbers.

City coordinates are looked up using OpenStreetMap Nominatim when a city is first registered and cached in the database. Single-instance requests are queued to stay within the public service's one-request-per-second limit; the signup page identifies the lookup provider and the map shows tile attribution. See the [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/) before deploying or scaling this service.

## Main routes

| Route | Description |
|---|---|
| `/login` | Sign in or create a citizen account |
| `/` | City-specific complaint statistics, filters, and map |
| `/report` | Submit a complaint for the signed-in city |
| `/ticket/[id]` | View a complaint docket and status |

## Optional AI configuration

Set `GEMINI_API_KEY` to enable CityNova Copilot. Set `OPENAI_API_KEY` to enable AI-assisted report drafting; without it, the general civic classifier is used.
