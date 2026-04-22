# Local Setup & Run Guide

Follow these steps to get the LogineX prototype running locally after cloning the repository. This is a monorepo managed by Turborepo.

## Prerequisites
- **Node.js**: v18 or later
- **Package Manager**: `pnpm` (recommended)
- **Flutter SDK**: Required only if you want to run the mobile app (v3.11.0+)

---

## 1. Initial Setup

From the root of the project, install all dependencies:

```bash
# If you encounter issues with the specific pnpm version in package.json in restricted environments,
# you may temporarily remove the "packageManager" field from package.json and run pnpm install.
pnpm install
```

## 2. Backend Setup (Prisma & SQLite)

The backend uses a local SQLite database for the prototype, so no external database setup is required. You just need to initialize it.

```bash
cd apps/backend

# Generate the Prisma client
npx prisma generate

# Push the schema to the local SQLite database (creates dev.db)
npx prisma db push

# (Optional) You can seed the database if you have a seed script configured.

# Go back to the root
cd ../../
```

## 3. Running the Web Application & Backend API

You can spin up both the NestJS backend and the Next.js frontend simultaneously from the root directory using Turborepo:

```bash
# From the root directory
pnpm run dev
```

This will start:
- **Backend API**: `http://localhost:3000` (by default, as defined in `apps/backend/src/main.ts`)
- **Frontend App**: `http://localhost:3000` (Note: Ensure that either your frontend or backend uses a different port via `.env` files to avoid port conflicts. For example, add `PORT=3001` to `apps/backend/.env` if the frontend enforces port 3000).

*To run them separately:*
- Backend: `cd apps/backend && npm run start:dev`
- Frontend: `cd apps/frontend && npm run dev`

### Accessing the Web Prototype
1. Open the frontend URL in your browser.
2. The login page will prompt you for a Phone Number and OTP.
3. **Prototype Login**: Enter any phone number (e.g., `9876543210`) and **any 4-digit OTP** (e.g., `1234`).
4. Select your role (Shipper or Driver) to experience the unified UI.

## 4. Running the Mobile Application (Flutter)

To run the mobile app, you need Android Studio/Xcode and a running emulator/simulator.

```bash
# Navigate to the mobile app directory
cd apps/mobile

# Get Flutter dependencies
flutter pub get

# Run the app (ensure your emulator is running)
flutter run
```

*Note on Local API connectivity:* By default, Android emulators access the host machine's localhost via `http://10.0.2.2:<port>`. Ensure your Dio networking configuration in the Flutter app points to `http://10.0.2.2:3000` (or whichever port the backend is running on).

## 5. Testing & Verification

To run tests across the monorepo:
```bash
# Run all tests
npx turbo test

# Run tests only for backend
npx turbo test --filter=backend
```

To simulate a full load lifecycle for demonstration without a UI:
```bash
# Make sure the backend is running, then execute:
curl -X POST http://localhost:3000/admin/simulate
```
