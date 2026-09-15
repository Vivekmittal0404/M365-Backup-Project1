# Vaultline — M365 Backup Dashboard (Frontend)

Next.js 14 (App Router) + Tailwind frontend for the build sheet in PRODUCT 01.

## Setup

```
npm install
cp .env.local.example .env.local   # point at your backend
npm run dev
```

Runs on http://localhost:3000, expects the backend on http://localhost:5000
(matching `MS_REDIRECT_URI` in the backend `.env`).

## Pages

| Route | Purpose |
|---|---|
| `/login`, `/register` | auth, JWT stored in `localStorage` |
| `/dashboard` | job/vault/DPDP counts + recent jobs |
| `/connect` | Microsoft 365 OAuth kickoff, connected tenant list |
| `/backups` | start a backup job, view jobs, browse & restore items |
| `/ex-employee` | archive a departing employee's mailbox, view vault costs |
| `/compliance` | download the DPDP PDF report, view log entries |
| `/search` | subject search over backed-up mail |

## Assumptions beyond the build sheet

The build sheet's API list covers writes and job listing but not everything a
multi-page dashboard needs to read. The frontend assumes these additions on
the backend, since every page below needs the tenant to be scoped to the
logged-in user:

- **`GET /api/tenant/list`** — tenants for the authenticated user
  (`[{ tenantId, displayName, status }]`). Used by `TenantPicker` on every
  page. Without it, users can never pick which tenant they're viewing.
- **`GET /api/archive/ex-employee?tenantId=`** — list vaults for a tenant
  (the sheet only specifies the `POST` to create one).
- **`GET /api/compliance/dpdp-logs?tenantId=`** — list `DPDPLog` rows (the
  sheet's `GET /api/compliance/dpdp-report` only returns a generated PDF, not
  raw rows for a table).
- **`POST /api/backup/restore`** — implied by the `backups/page.jsx` spec line
  ("Restore button → `POST /backup/restore`") but not listed under section 4's
  API list. Body sent as `{ tenantId, wasabiKey, itemId }`.
- The **Backups** and **Search** pages both list items via
  `POST /api/search/ai` with an empty query for "show everything" — the sheet
  doesn't define a plain item-listing endpoint, and reusing search seemed
  closer to the spec than inventing a new route. Worth confirming against
  what the backend actually implements.
- `BackupItem` has no `sizeMB` field in the sheet's model, but the page spec
  asks for a Size column — the UI renders it as `—` until that field exists.
- After the Microsoft OAuth callback (handled entirely on the backend, per
  `MS_REDIRECT_URI`), the backend should redirect the browser back to
  `/connect?connected=1` (or `?error=...`) so the user sees a confirmation.

None of this is exotic, but flagging it since the backend build sheet doesn't
mention these routes explicitly — add them alongside the ones it does list.

## Design

Ledger/dossier aesthetic rather than a generic SaaS card kit — dark ink
sidebar, paper canvas, hairline rules instead of shadowed cards, Newsreader
serif for headings, Inter for body copy, IBM Plex Mono for tabular data
(dates, sizes, IDs, costs) so columns of numbers actually align.
