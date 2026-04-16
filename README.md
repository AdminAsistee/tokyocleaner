# TokyoCleaner — Customer Portal

This repository contains the codebase for the **TokyoCleaner Customer Portal**, a dedicated web application for customers to manage their properties, track cleaning orders, and securely book new services.

## Architecture & Tech Stack

This project uses a modern web architecture designed for speed, security, and premium user experience:

- **Frontend:** Next.js 15 (App Router) + React + Vanilla CSS (No Frameworks)
- **Backend:** FastAPI (Python) + Uvicorn
- **Database:** Supabase (Managed PostgreSQL)
- **Authentication:** Supabase Auth (Passwordless Magic Links)
- **Payments:** Stripe API (Native checkout)
- **Deployment:** DigitalOcean App Platform / Docker

## Repository Structure

```text
tokyocleaner/
├── portal/                 # Next.js frontend application (Root for UI)
│   ├── src/app/            # App Router pages (Dashboard, Login, Orders)
│   ├── src/components/     # Shared React components (Sidebar, etc.)
│   ├── src/lib/            # Supabase client/server utilities
│   └── public/             # Static assets
├── design/                 # Static HTML/CSS UI mockups (Reference only)
├── .env.example            # Template for required environment variables
├── implementation_plan.md  # Detailed technical rollout strategy
├── proposal.html           # Exec overview and timeline
└── migrate_*.py            # Data migration scripts (CSV -> PostgreSQL)
```

## Getting Started (Frontend Development)

To run the Next.js portal locally on your machine:

**1. Navigate to the portal directory:**
```bash
cd portal
```

**2. Install dependencies:**
```bash
npm install
```

**3. Setup Environment Variables:**
Since secrets are never committed to GitHub, you need to create a `.env.local` file inside the `portal/` folder. Ask your project manager for the Supabase keys, and format them like this:

```env
# portal/.env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**4. Start the development server:**
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

## Key Features

- **Magic Link Authentication:** Customers log in instantly via an email link (no passwords required).
- **Localization:** The UI fully supports realtime switching between English and Japanese via the `useLang` hook.
- **Property Registry:** Customers save entry instructions, Google Maps links, and building photos once for seamless future cleanings.
- **Native Booking Flow:** A 4-step wizard integrated directly with Stripe to book immediate cleaning sessions (In Development).

## Team Note
This repository replaces the previous AppSheet and Calendly workflow with a fully in-house portal. For backend API development on the native booking flow, please refer to the `implementation_plan.md` artifact.