# Deploying PharmaCare to the shop PC (offline, local, no cloud)

This app runs entirely on one Windows PC: PostgreSQL, the Express API, and the
Next.js frontend all run on `localhost`. Nothing talks to the internet while the
shop is open — see "Why no network is needed" at the bottom.

## 0. What you need on the shop PC (one-time, needs internet)

- **Node.js** (LTS, v22.x to match dev) — https://nodejs.org
- **PostgreSQL** (same installer you used for dev) — https://www.postgresql.org/download/windows/
  During install, set a password for the `postgres` user and remember it.
- **Git** (to clone the repo) — https://git-scm.com, or copy the project folder via USB instead.
- **Google Chrome or Edge** (almost certainly already installed).

Everything below this point can be done with the PC offline, **except** the two
steps marked 🌐 (they need internet once).

## 1. Get the code onto the PC

🌐 Either:
```bash
git clone https://github.com/AnjanaRanasinghe/Pharmacy-system-architecture-and-webapp-development.git
```
or copy the project folder from a USB drive if that PC has no internet at all.

**Important:** `server/node_modules` is accidentally committed in this repo (a
pre-existing `.gitignore` gap, not something to fix tonight). Native modules
like `bcrypt` are compiled for a specific Node version/CPU — the copy in git may
not match the shop PC. Delete it and reinstall fresh:
```bash
cd server
rm -rf node_modules
```

## 2. Create the database

Open the PostgreSQL shell (`psql` from the Start menu, or `psql -U postgres`) and run:
```sql
CREATE DATABASE pharmacare;
```

## 3. Configure environment files

`server/.env`:
```
PORT=5000
DATABASE_URL="postgresql://postgres:<the-password-you-set>@localhost:5432/pharmacare"
CORS_ORIGIN="http://localhost:3000"
JWT_SECRET=<generate a long random string, not "your_jwt_secret">
```

`client/.env`:
```
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

## 4. Install dependencies and set up the database schema

🌐 (needs internet to download packages)
```bash
cd server
npm install
npx prisma migrate deploy
npm run build
```
```bash
cd client
npm install
npm run build
```
`npm run build` for the client fetches the Inter font files once
(`next/font/google`) and bakes them into the build output — this is the other
step that needs internet, and only this once. After a successful build, the
app never calls Google Fonts (or anything else) again at runtime.

## 5. First run — register the real admin account

```bash
cd server && node dist/server.js
```
In another window:
```bash
cd client && npm run start
```
Open `http://localhost:3000`, click **Sign up**, and create the real pharmacy
admin account (this only works once — registration locks itself after the
first account, by design). Then fill in **Settings** with the real pharmacy
name/address/phone.

The database is brand new and empty, so there's no test data to clean up and
no factory reset needed on this PC.

## 6. Make it start automatically and feel like a desktop app

Create `start-pharmacy-app.bat` in the project root:
```bat
@echo off
start "PharmaCare API" /min cmd /c "cd /d D:\PathToProject\server && node dist\server.js"
timeout /t 3 /nobreak >nul
start "PharmaCare Web" /min cmd /c "cd /d D:\PathToProject\client && npm run start"
timeout /t 3 /nobreak >nul
start chrome --app=http://localhost:3000
```
(Adjust the path and swap `chrome` for `msedge` if that's what's installed.)

Put a shortcut to this `.bat` file in the Startup folder so both servers come
up automatically when the PC turns on:
- Press `Win+R`, type `shell:startup`, press Enter.
- Copy a shortcut to `start-pharmacy-app.bat` into that folder.

Also make a Desktop shortcut with the same `chrome --app=http://localhost:3000`
target (and a custom icon if you like) — that's the icon the pharmacy staff
double-click. It opens as its own window with no address bar or tabs, so it
looks and feels like a real desktop app even though it's a browser underneath.

**Later, if you want**, this can be upgraded to a real Windows service (so it
also survives the user logging off, not just a reboot) using NSSM, or wrapped
in Electron for a true installable `.exe` with no browser dependency at all.
Neither is needed for tonight — the Startup-folder + Chrome-app-mode approach
above is what most small local POS setups actually run.

## 7. Backups

Use the in-app **Settings → Backup & Restore** (nightly automatic backup is
already built in). Periodically copy the newest file from `server/backups/`
onto a USB drive or a personal cloud drive — a backup that only lives on this
one PC doesn't help if the PC itself fails.

## Why no network access is needed

| Needs internet? | When |
|---|---|
| ❌ Taking a sale, purchase, return, report, backup, restore | Never — Postgres, the API, and the web app all talk to each other over `localhost` only |
| ✅ Installing Node/PostgreSQL/Git | Once, before setup |
| ✅ `npm install` (both folders) | Once, at setup |
| ✅ `npm run build` (client) | Once per build — fetches font files and bakes them in |
| ❌ Rebuilding later with the same fonts already cached | No (fonts are already saved locally after the first build) |
| Optional, not required | A second till/tablet on the same shop LAN, cloud backup copies, software updates |

If this PC has no internet at all, every 🌐 step above can be done once on a
different PC with internet, then copied over via USB:
- Node.js / PostgreSQL / Git: download the offline `.exe` installers.
- The repo + a `npm install`'d `node_modules` for both `client` and `server`,
  done on a PC with the **same CPU architecture and Node version**, copied
  over whole (this is the one place where copying `node_modules` instead of
  reinstalling is fine, since both machines did the install).
- The client's `.next` build output, created once with internet available.
