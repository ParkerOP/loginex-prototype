# AGENTS.md - LogineX Prototype Execution Guide for Jules (Google Coding Agent)

## 0) Quick Execution Brief (Compact)
Use this section for day-to-day execution speed. If any conflict appears, follow detailed sections below.

### 0.1 Build goal
- Deliver a working **intra-city logistics prototype** for India SMEs and owner-operators.
- Validate the core loop: post load -> match -> book -> track -> POD -> close -> rate -> fee capture.

### 0.2 Who matters now
- Core now: B2P (SME shippers to independent mini-truck/LCV drivers).
- Limited now: P2P local ad-hoc moves.
- Later only: B2B heavy integrations, inter-city workflows.

### 0.3 Non-negotiables
- Prototype fast, but keep trust-critical flows auditable.
- Mobile-first for low-end Android and bad networks.
- No advanced ML engines in v1; use deterministic logic.
- Shared API contracts for web and mobile.

### 0.4 What to ship first
1. Auth + RBAC + profile/KYC status scaffolding.
2. Load posting + vehicle availability + deterministic matching.
3. Booking + trip state machine + live tracking.
4. POD submission + retrieval + audit trail.
5. Ratings/trust updates + per-trip fee capture.
6. Return-load suggestions after drop-off.

### 0.5 Pricing/plan model (prototype)
- Revenue anchor: fee only on completed trips.
- Shipper tiers: Free (limited bookings), SME Plan (unlimited + saved routes/addresses + GST invoice support + basic analytics).
- Driver tiers: Free (accept assigned jobs), Pro (search/bid + preferred shippers + simple dispatch + early payout readiness).

### 0.6 Technical guardrails
- API: `/v1`, idempotency keys on retry-prone mutations, cursor pagination, consistent error envelope.
- Realtime: authenticated trip channels, rate-limited location pings, fallback to polling/last-known state.
- Data: structured addresses + map pin + free-text hints; keep both raw and normalized address values.
- Security: OTP auth, RBAC checks on sensitive routes, encrypted PII at rest, tamper-evident audit logs.

### 0.7 Risks to mitigate in v1
- GPS/network: store ping accuracy + timestamp; expose ETA confidence bands.
- Data hygiene: normalize colloquial addresses; require minimum structured fields.
- Fraud: POD timestamp/location/media-hash checks + anomaly flags + manual review queue.
- Shared devices/SIM churn: device history visibility and risk-based re-verification.

### 0.8 Performance targets (realistic)
- p95 match response < 700ms under seeded city data.
- Tracking freshness and stale-session visibility on ops dashboard.
- Lightweight payloads for weak-network mobile usage.

### 0.9 Definition of done (each feature)
- Code + tests + migration (if needed) + telemetry + minimal docs update.
- Must pass lint, typecheck, and relevant tests before handoff.

### 0.10 Execution style for Jules
1. Restate goal and impacted modules.
2. Propose smallest safe prototype change.
3. Implement quickly with tests for risky logic.
4. Run validations (lint/typecheck/tests).
5. Report changelog, known risks, and next step.

---

## 1) Mission and Product Intent
Build **LogineX Prototype v1**, a hyper-local logistics platform for India that prioritizes **intra-city operations** and practical execution for SMEs and owner-operator drivers.

Primary actors in prototype scope:
- Shippers: SME cargo owners (retailers, warehouses, D2C brands)
- Carriers: independent mini-truck/LCV drivers and small fleet owners
- Operators/admins: trust, support, dispute, and audit workflows

Prototype outcomes:
- Reduce empty return trips in intra-city lanes
- Replace broker-first coordination with direct platform matching
- Increase confidence with verification, live tracking, and digital proof of delivery
- Validate repeat usage for SME daily logistics workflows

Source alignment:
- Product deck: `LogineX.pptx`
- Technical + business plan notes: `idea.txt`

---

## 2) Prototype-First Principles (Non-Negotiable)
1. Prototype speed with safety: ship lean slices quickly, but never compromise trust or auditable flows.
2. Mobile reality first: optimize for low-end Android devices and unstable networks.
3. Intra-city before inter-city: avoid premature complexity until core local loops are proven.
4. Explainable operations: matching, pricing fees, and trust actions must be transparent and reviewable.
5. Shared API contracts: web and mobile clients must use the same backend contracts.

---

## 3) Business Scope for Current Prototype
### 3.1 Geographic and segment focus
- Phase 1 is intra-city only.
- Prioritize SME use cases:
  - Retail distribution
  - Warehouse to store shuttles
  - Office/home shifting
  - Local e-commerce deliveries
- Prioritize vehicles: mini-trucks and LCVs (e.g., Tata Ace, 14-ft).

### 3.2 Product value to validate now
- Transparent and standardized pricing display
- Driver comparison before booking
- Real-time location visibility with confidence indicators
- Digital proof of delivery and retrievable trip records

### 3.3 Market model by participant type
- P2P: ad-hoc local loads, app-first, pay-per-trip
- B2P: core segment in prototype (SME to independent drivers)
- B2B: explicitly later phase (fleet/3PL-heavy workflows and ERP/TMS integrations)

### 3.4 Revenue model in prototype
- Primary: per-trip platform fee (fixed or percentage) on completed trips
- Shipper plans:
  - Free: limited monthly bookings
  - SME Plan: unlimited bookings, saved addresses/routes, GST invoice support, basic analytics
- Driver plans:
  - Free: accept assigned jobs, profile + ratings
  - Pro: search/bid on loads, preferred shipper tags, simple dispatch tools, early payout readiness

---

## 4) Explicit Out-of-Scope for Prototype
Do not build unless user explicitly requests:
- Multi-city optimization engines
- Deep finance/credit products
- Advanced ML ETA or dynamic pricing engines
- Enterprise-grade ERP/TMS native integrations
- Full marketplace for heavy project cargo at scale

---

## 5) Suggested Stack (Prototype Practicality)
Frontend:
- Next.js + React + TypeScript + Tailwind CSS

Backend:
- Node.js + NestJS (preferred) or modular Express
- REST APIs for core workflows
- WebSockets for trip tracking updates

Database:
- SQLite allowed for very early local prototype
- PostgreSQL + Prisma required before multi-user pilot

Mobile:
- Flutter consuming same backend contracts

Integrations:
- Maps and GPS: Google Maps API + device GPS
- Auth: NextAuth (web), OTP provider abstraction (Twilio-compatible)
- Payments: Razorpay UPI via payment adapter abstraction

Hosting:
- Azure/AWS/Render etc etc acceptable; choose least operationally heavy path for prototype

---

## 6) Architecture Modules Required in Prototype
Implement minimal but clean boundaries:
1. Identity and Access
2. Verification and Trust
3. Parties (Shipper, Driver, Fleet)
4. Loads and Booking
5. Vehicle and Availability
6. Matching and Return-Load Suggestions
7. Trip Lifecycle and Tracking
8. POD and Documents
9. Ratings and Trust Score
10. Billing/Fees and Payout Events
11. Notifications
12. Admin and Audit

Architecture constraints:
- Strict DTO/input validation at all API boundaries.
- Controllers remain thin; business logic in services/domain layer.
- External providers hidden behind adapters/interfaces.
- Critical state transitions must emit audit events.

---

## 7) Data Model Baseline (Prototype Minimum)
Core entities:
- User
- Role
- Organization
- DriverProfile
- ShipperProfile
- FleetProfile
- Vehicle
- VehicleType
- Load
- LoadQuoteOrBid (optional in v1; required for Driver Pro workflows)
- MatchSuggestion
- Booking
- Trip
- LocationPing
- ProofOfDelivery
- DigitalContractOrTripAgreement
- Rating
- TrustScoreSnapshot
- Dispute
- PlatformFeeRecord
- PaymentOrder
- PaymentTransaction
- NotificationLog
- AuditEvent

Critical relation rules:
- One organization can have many users and vehicles.
- One load can generate many match suggestions.
- One accepted match maps to one booking and one trip.
- One trip has many location pings and at least one POD artifact at completion.
- Completed trips trigger ratings, trust updates, and fee/payment events.

Indexing requirements:
- Geospatial support for origin/destination proximity lookups.
- Composite indexes for (status, scheduled_time), (vehicle_type, availability_window).
- Fast filters for city, zone, and active trip state.

---

## 8) Matching and Optimization Rules (Prototype v1)
Use deterministic weighted scoring only.

Score dimensions:
- Route compatibility (pickup/drop proximity)
- Vehicle fit (capacity/type constraints)
- Availability window fit
- Reliability/trust score
- Rate fit
- Return-leg opportunity score

Rules:
- Return score breakdown in API responses for explainability.
- Keep weights config-driven for fast tuning.
- Add fairness guardrails so small operators are not starved.
- Cache high-traffic city corridors and repeated searches.

Prototype target:
- p95 match response < 700ms under realistic city seed data.

---

## 9) UX and Field Constraints (Must Be Built In)
Driver and shipper UX must assume real-world constraints:
- Low-end Android devices with low RAM/storage
- Glare, weak networks, and battery constraints
- Shared phones and SIM churn
- Low-literacy and multilingual usage patterns

Mandatory UX implementation requirements:
- Lightweight screens and payloads; avoid heavy real-time rendering.
- Large tap targets, clear icon-assisted UI, concise text.
- Multi-language-ready content model (at least architecture-ready in prototype).
- Offline-tolerant actions for key steps (draft booking updates, queued location/POD submissions).
- Explicit sync status on all critical actions.

---

## 10) Technical Risk Register and Required Mitigations
### 10.1 GPS and network reliability
Risks:
- GPS drift and black spots create false ETA and trust erosion.

Mitigations required in prototype:
- Store accuracy and timestamp on each ping.
- ETA quality bands (high/medium/low confidence), not false precision.
- Last-known location with freshness indicator.
- Ping rate limiting + adaptive sampling for battery/network conditions.

### 10.2 Address/data hygiene
Risks:
- Incomplete and colloquial addresses reduce routing quality.

Mitigations required in prototype:
- Structured address fields (city, locality, landmark, pin code where available).
- Address normalization pipeline (raw input + normalized value).
- Capture map pin plus free-text instructions.

### 10.3 Fraud vectors
Risks:
- GPS spoofing, fake POD uploads, collusive mileage inflation.

Mitigations required in prototype:
- Device + session integrity metadata on sensitive events.
- POD minimum checks: timestamp, location envelope, media hash.
- Rule-based anomaly flags (distance/time outliers, repeated collusive pair patterns).
- Manual review queue in admin panel for flagged trips.

### 10.4 Authentication hygiene
Risks:
- Shared devices and SIM churn causing account confusion and misuse.

Mitigations required in prototype:
- OTP login with device history visibility.
- Force re-verification on high-risk changes (SIM/device/profile changes).
- Role-scoped permissions on all sensitive operations.

---

## 11) API and Realtime Standards
API:
- Version endpoints under `/v1`.
- Use idempotency keys on retry-prone mutations (booking accept, trip status change, POD submit, payment events).
- Cursor pagination for listing/search.
- Consistent machine-readable error envelope.

Realtime:
- Authenticated socket sessions only.
- Trip-scoped channels.
- Rate-limited location updates.
- Graceful fallback to polling/last-known state when socket quality degrades.

---

## 12) Security, Compliance, and Audit
Mandatory controls in prototype:
- OTP-based authentication and secure session handling
- RBAC authorization checks on every sensitive route
- Encryption at rest for sensitive PII fields
- Secrets only via env/secret manager
- Input validation and output encoding for untrusted fields
- Tamper-evident audit trails for trip status, POD, disputes, and payment actions

---

## 13) Testing and Quality Bar (Prototype Realistic)
Required test coverage:
- Unit tests for matching score, trust updates, and fee calculation
- Integration tests for booking-to-trip state transitions
- Integration tests for tracking ingestion and stale-location fallback
- Integration tests for POD submission and dispute creation
- Contract tests for public API DTO schemas

Definition of done per feature:
- Code + tests + migration (if applicable) + telemetry + minimal docs update

---

## 14) Observability and Operations
Minimum telemetry:
- Structured logs with request/correlation IDs
- Metrics:
  - Match latency
  - Booking conversion
  - Trip completion rate
  - Tracking freshness
  - POD rejection/flag rates
  - Fraud-flag volume

Operational dashboards:
- API latency and error rates
- Live trips + stale sessions
- Funnel: posted -> matched -> accepted -> completed
- Fraud and dispute queue status

---

## 15) Delivery Conventions and Working Style for Jules
Execution protocol for every task:
1. Restate user goal and impacted modules.
2. Propose smallest safe prototype change set.
3. Implement quickly with tests for risky logic.
4. Run lint, typecheck, and relevant tests.
5. Report changelog, known risks, and next iteration steps.

When requirements are ambiguous:
- Add explicit assumptions and TODO markers.
- Avoid irreversible product behavior without documented rationale.

When changing schema/state machines:
- Include migration safety and backward compatibility notes.

When adding dependencies:
- Justify operational weight and prototype benefit.

---

## 16) Phase Plan for This Prototype

**Strategic Note:** We are following an **API-First (Backend-First) approach**. The entire backend engine will be built and validated via API contracts before any Frontend (Web/Mobile) work begins. This ensures a stable contract for both the Next.js Shipper web app and the Flutter Driver mobile app.

Phase A - Foundation (COMPLETED)
  - Bootstrapped Turborepo monorepo
  - Initialized Next.js frontend and NestJS backend
  - Configured Prisma with SQLite
  - Created baseline schema (User, Role, Organization, Profiles)
  - Implemented base Auth module and RBAC guard placeholders
- Core auth, user roles, city-scoped entities, and baseline booking/trip schemas

Phase B - Core Intra-City Marketplace Engine (Backend) (IN PROGRESS)
  - Implemented: Load posting, driver discovery, deterministic matching, basic booking acceptance.
  - To do: Advanced filtering/search, location/address normalization models.

Phase C - Trip + Trust Loop (Backend)
  - Trip state machine (Started, In-Transit, Arrived, Delivered)
  - Live tracking placeholders (location ping ingestion)
  - Proof of Delivery (POD) capture logic and metadata storage
  - Ratings and trust score update logic
  - Return-load suggestion generation for completed drop-offs

Phase D - Monetization and Ops (Backend)
  - Per-trip fee calculation and capture events
  - Free/Pro plan gating logic
  - Basic invoicing artifacts generation logic
  - Dispute queue data models

Phase E - Frontend Implementation (Web)
  - Implement Shipper Next.js Dashboard (Load creation, Tracking, Invoicing)
  - UI styling using Tailwind CSS based on user guidelines
  - Integration with Backend APIs
  
Phase F - Frontend Implementation (Mobile - Flutter)
  - Implement Driver Flutter App (Load discovery, Match acceptance, Trip updates, POD upload)
  - Mobile-specific UX (offline-tolerant actions, low-end device optimization)
  - Integration with Backend APIs

Phase G - Hardening & MVP Validation
  - End-to-end integration testing
  - Fraud flags, observability tuning, performance optimization
  - Address MVP Acceptance Criteria


---

## 17) MVP Acceptance Criteria (Prototype)
Prototype is acceptable only when all are true:
- Intra-city load can be posted, matched, booked, tracked, and completed.
- POD is captured and retrievable with audit metadata.
- Return-load suggestions are generated for completed drop-offs.
- Trust signals (verification + ratings) influence booking decisions.
- Per-trip monetization is applied on completed jobs.
- Core flows operate reasonably on low-end device/network conditions.

---

## 18) Future Expansion (After Prototype Validation)
Add only after phase-1 validation:
- Inter-city lanes and contract-heavy B2B workflows
- Fleet/3PL deeper integrations
- Advanced pricing intelligence and predictive ETA
- Strong multilingual UX rollout across regions

Keep all future additions backward-compatible and incremental.

This is to be a working 'prototype', don't do too much.
