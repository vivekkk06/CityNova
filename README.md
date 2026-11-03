# CityNova 

**Transparent and Interactive Civic Reporting and Accountable Governance
System**\
**Theme:** Governance & Civic Technology\
**Team:** CityNova

## Overview

CityNova is a socially interactive civic-tech platform designed to
connect citizens with local authorities and make community issues easier
to report, discuss, track, and resolve. The goal is to improve
transparency and accountability by giving citizens a shared place to
raise concerns and follow the progress of civic work.

The platform is envisioned as a "city in your pocket," bringing civic
reporting and public information into one accessible interface.

## Quick Start (run locally)

**Stack**: Next.js (React, TypeScript, Tailwind CSS), Prisma ORM, SQLite, Leaflet maps. No Docker or external database is needed.

**Requirements**: Node.js, npm, and an internet connection (for map tiles and package install).
```
git clone https://github.com/vivekkk06/CityNova.git
cd CityNova
npm install
cp .env.example .env      --> Windows PowerShell: copy .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```
Open http://localhost:3000 in your browser.
The repository already includes `prisma/dev.db` with sample reports, so the site is populated on first run. To reset the sample data at any time, run `npx prisma db seed`. Note that this replaces existing reports with the sample set.

## Environment variables

`.env.example` contains everything required:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite file location. Keep `file:./dev.db`. |
| `CITYNOVA_AUTH_SECRET` | Yes | Random string of 32+ characters used for sessions. The app will not start login without it. |
| `GEMINI_API_KEY` | Optional | Enables the Gemini-powered public-enquiry agent. |
| `OPENAI_API_KEY` | Optional | Enables OpenAI report drafting. Without it, the built-in civic classifier is used. |

## Troubleshooting

- **Login fails with "Account security is not configured"**: the `.env` file is missing or `CITYNOVA_AUTH_SECRET` is too short. Copy `.env.example` to `.env` (it already has a valid value), then restart `npm run dev`.
- **Port 3000 is busy**: run `npm run dev -- -p 3001`.
- **Prisma errors after install**: run `npx prisma generate` again.
## Demo Accounts(for testing)

The database ships with ready-made accounts so you can test the site without registering. There is no password: sign in with the username and phone number.

### Citizen accounts
Choose **Citizen** on the login page.

| Name | Username | Phone |
|---|---|---|
| Ujjwal Mishra | vivek1 | 8619860851 |
| Yuvraj Singh | vivek2 | 8619860852 |
| Rudra Rohra | vivek3 | 8619860853 |
| Vivek Badgujar | vivek4 | 8619860854 |
| Kini Arya | vivek5 | 8619860855 |

### Authority account
Choose **Authority** on the login page.

| Name | Username | Phone | Employee ID | Designation
|---|---|---|---|---|
| Saksham Pandey | saksham1 | 9259234046 | 823456781239925 | CP

You can also register a new account from the sign-up page. The numbers above are demo data only.

## The Problem

Citizens face everyday community problems such as potholes, garbage
accumulation, water scarcity, leakage, theft, and bullying. They may not
know which authority is responsible, how to contact it, or how to follow
up after submitting a complaint. Information about reports, official
responses, and completed work can be difficult to find in one place.

CityNova aims to bridge this gap with an interactive platform where
citizens can report issues, contribute evidence, and track official
commitments.

## Proposed Solution

CityNova combines civic issue reporting with social interaction and
accountability features. Citizens can submit reports, discuss issues,
add supporting evidence, and follow updates. Authorities can post
responses and progress updates. The platform also aims to make recurring
problems and ward-level indicators more visible.

## Key Features

-   **Multi-format civic reporting:** Submit issues using text,
    photographs, voice notes, and geolocation.
-   **Map-based issue visibility:** View reports across different areas
    of a city.
-   **Report categorization:** Help classify reports so they are
    easier to organize and access.
-   **Community interaction:** Allow residents to comment, confirm
    reports, flag possible duplicates, and contribute additional
    evidence.
-   **Promise-to-Proof Ledger:** Keep a time-stamped record of official
    commitments, deadlines, progress updates, and evidence of completed
    work.
-   **Know Your Rights:** Provide citizens with information about
    relevant rights, official channels, and ways to seek assistance.
-   **AI public-enquiry agent:** Help users find general information and
    navigate the platform. 
-   **Privacy-conscious reporting:** Support anonymous reporting to help
    protect a reporter's public profile.
-   **Civic contribution score:** Explore a contribution-based score
    that recognizes useful, genuine reports and successful resolution.
    Scoring rules should be transparent and include safeguards against
    unfair penalties.

## Technical Approach

The project presentation describes the following technical components:

1.  A simple website with sections for citizens, authorities, city
    information, and an AI enquiry agent.
2.  The Enquiry tab is powered by ML. It uses Google DeepMind's Gemini model. Multilingual NLP is used for voice detection.
3.  Reporting through text, images, voice notes, and geolocation. When citizens report via voice notes, Gemini Multimodal Audio AI transcribes the spoken speech into text.
4.  Privacy protection is already enforced by strict system instructions.
5.  Classification of civic reports into progress-wise categories.
6.  Community feedback and evidence to support report verification.
7.  A time-stamped ledger for commitments, deadlines, progress, and
    completion evidence.
8.  Dashboards for recurring issues, pending reports, resolution
    timelines.

**Technology stack:** The project presentation refers to web frameworks,
databases, and AI/ML tools, but does not specify their exact names.
Update this section with the actual frameworks, languages, database,
APIs, and model/tool names used in the repository.


## Expected Impact

-   **Greater transparency:** Make reports and official responses easier
    to find.
-   **Stronger accountability:** Let citizens follow commitments and
    inspect evidence of completed work.
-   **Better prioritization:** Highlight urgent, recurring, and
    long-pending problems.
-   **More citizen participation:** Give residents a shared place to
    report, discuss, and support civic issues.
-   **Improved public trust:** Make progress and outcomes more visible.
-   **Sustainable communities:** Support collective action toward
    cleaner and safer neighbourhoods.

## Feasibility, Risks, and Safeguards

Key risks include fake or duplicate reports, privacy and security
concerns, low official participation, misuse of
civic scores, and outdated information.

Potential safeguards include:

-   Moderation, duplicate detection, and evidence-based verification.
-   Data minimization, access controls, and clear privacy practices.
-   Transparent scoring criteria and an appeal process.
-   Avoiding simplistic ward rankings that ignore differences in
    reporting rates and local context.
-   Showing official sources, update dates, and uncertainty where
    applicable.
-   Starting with a small pilot and expanding after evaluation.

Reports involving police or neighbours should not expose a reporter's
identity or make public verification a requirement in situations where
it could create safety risks. Any civic score should assess the quality
of contributions rather than reward volume alone.

## Team

-   Tarique Bin Yusuf
-   Vivek Badgujar
-   Anuneet Gupta

## References and Related Work

These projects and resources informed the concept and provide useful
points of comparison:

-   [Nagarika](https://nagarika.app/) --- civic reporting and
    accountability.
-   [Puramithra](https://cdma.ap.gov.in/initiatives/puramithra/) ---
    municipal citizen services in Andhra Pradesh.
-   [CPGRAMS](https://pgportal.gov.in/) --- Government of India public
    grievance portal.
-   [MyNeta](https://myneta.com/) --- civic accountability platform.
-   [United Nations Sustainable Development
    Goals](https://sdgs.un.org/goals), particularly [SDG
    11](https://sdgs.un.org/goals/goal11) and [SDG
    16](https://sdgs.un.org/goals/goal16).

## Project Status

The team presentation describes a website prototype with an AI
public-enquiry agent, report classification, and
voice-related capabilities. The platform is improved with respect to reliability and usability. 


## License

No license has been specified yet. Add a `LICENSE` file before
presenting this project as open source. Without a license, the
repository's default copyright restrictions generally remain in effect.
