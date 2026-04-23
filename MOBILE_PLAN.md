# Mobile Execution Plan and Architecture

## 1. Overview

The LogineX mobile application is the primary interface for Drivers (load discovery, trip management, POD) and an auxiliary interface for Shippers (load tracking). The application will be built using Flutter, adhering to a unified architecture.

## 2. Architecture Principles

- **Unified App:** A single codebase for both Shippers and Drivers. Role routing occurs post-authentication.
- **Offline-Tolerance & Sync:** Drivers may operate in poor network areas. Core flows (e.g., POD capture, location pings) will cache locally and batch-sync upon connection using `sqflite` and the existing `/pings/batch` API.
- **Maximum Visual Fidelity & Premium Experience:** The application must deliver an "investor-ready" premium experience utilizing maximum visual fidelity and heavy, dynamic animations by default. This will involve using several external libraries (such as Lottie, flutter_animate, Rive, shader libraries and complex physics-based UI transitions to create a stunning, high-end feel.
- **Graceful UI Degradation:** Utilizing `device_info_plus` and `connectivity_plus`, the app will monitor the device capabilities and network conditions. If the connection suffers or if the device is low-end, the app will gracefully downgrade by disabling heavy features (Lottie, complex animations, parallax) and defaulting to simpler layouts and standard list views.
- **State Management:** Using `Riverpod` or `Bloc` to securely manage authentication tokens, active trips, and WebSocket tracking states.

## 3. Business Model Implementation (Monetization & Plans)

As verified in the backend (`billing.service.ts`), the platform monetization operates on a dual-tier system:

- **Free Tier:** Drivers on the `FREE` plan pay a higher fixed fee (e.g., $50) per trip completion. Shippers pay a standard invoice amount.
- **Pro/SME Tier:** Drivers on the `PRO` plan pay a reduced fee (e.g., $10). Shippers on the `SME` plan receive discounted trip rates.

**Mobile Implementation:**

- **In-App Subscriptions / Wallet:** Implement a "Wallet & Earnings" view for drivers to see their platform fees subtracted from their payouts.
- **Upsell Prompts:** Inject contextual UI prompts for `FREE` tier drivers offering a `PRO` upgrade to reduce per-trip fees.

## 4. Phase F Implementation Steps (Flutter)

### Step 1: Scaffold Flutter Monorepo Integration

- Initialize Flutter project under `apps/mobile`.
- Configure `pubspec.yaml` with core dependencies (`dio`, `flutter_riverpod`, `geolocator`, `connectivity_plus`, `device_info_plus`, `flutter_animate`, `lottie`, `rive`, `web_socket_channel`).

### Step 2: Authentication & Role Switcher

- Implement login screen matching Web prototype (phone + dummy OTP).
- Store `x-user-id` and `x-user-role` securely (`flutter_secure_storage`).
- Build animated root navigator to dynamically render Shipper or Driver dashboard based on role.

### Step 3: Driver Core Loop UI

- **Load Discovery:** Map-based or list-based view calling `/matches/available`. Implement "Accept" swipe gestures.
- **Trip Execution:** Active trip screen. Background location tracking using `geolocator` transmitting to `/trips/:id/pings/batch` to handle dead zones.
- **POD Flow:** Camera integration. Form for image capture and notes. Call `submitPOD` to trigger the backend billing events.

### Step 4: Graceful Degradation & Animation Layers

- Implement `PerformanceService` to detect device RAM/Network speed in real-time.
- **High-End Default:** Apply heavy vector animations (Lottie/Rive), hero transitions, parallax, and custom physics for maximum visual fidelity.
- **Low-End/Poor Network Fallback:** Instantly disable heavy assets and use simplified Material/Cupertino widgets to preserve core functionality.

### Step 5: Web Parity Check

- Verify visual consistency with the Next.js `logo.ico` animations.
- Ensure the investor-ready aesthetic translates to mobile via dark mode styling, glassmorphism containers (via `BackdropFilter`), and premium typography.
