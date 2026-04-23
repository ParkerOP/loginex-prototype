# LogineX Features Overview

LogineX is a comprehensive logistics platform designed to connect Shippers with Drivers. It features an investor-ready, visually stunning prototype spanning across Web and Mobile, powered by a robust NestJS backend.

## Web Application (Next.js)

- **Role-Based Unified Portal**: A single web interface that seamlessly adapts its UI and functionality based on whether you log in as a "Shipper" or a "Driver".
- **Shipper Dashboard**:
  - **Load Posting**: Intuitive form to post new intra-city loads with origin, destination, weight, and vehicle requirements.
  - **Active Tracking**: View all active, in-transit, and completed loads.
  - **Analytics**: Beautiful animated charts detailing load volume activity.
- **Driver Dashboard**:
  - **Find Loads**: Discover available loads matching the driver's vehicle capabilities.
  - **My Trips**: Manage accepted trips, update statuses (Started, Arrived, Delivered), and submit Proof of Delivery (POD).
- **Graceful Degradation**: Built-in performance modes. On low-end devices or slow networks, heavy Framer Motion animations and complex charts are automatically simplified to ensure a snappy experience.

## Mobile Application (Flutter)

- **Unified Codebase**: Serves both Shippers and Drivers within the same app, reducing maintenance overhead.
- **Driver Core Loop**:
  - **Load Discovery**: View available loads on a map or list and accept matches with swipe gestures.
  - **Trip Execution & Offline Tolerance**: Real-time location tracking using `geolocator`. Built-in caching mechanisms to batch and sync location pings when passing through dead zones.
  - **Proof of Delivery (POD)**: Camera integration to capture delivery evidence and notes.
- **Premium Adaptive UX**:
  - Leverages Lottie, Rive, and `flutter_animate` for high-end micro-interactions.
  - Automatically disables heavy animations and switches to simplified UI patterns when low-end hardware or poor connectivity is detected.

## Backend Service (NestJS)

- **Core Logistics Loop API**: Comprehensive REST API managing the full lifecycle: Post Load -> Match -> Book -> Track -> POD -> Close -> Rate -> Fee Capture.
- **Matching Engine**: Evaluates load criteria against driver profiles and vehicles to suggest optimal matches.
- **Live Tracking**: WebSocket support for real-time location updates.
- **Billing & Monetization**: Tiered monetization (Free vs Pro/SME plans) automatically capturing platform fees per completed trip.
- **Admin Simulator**: Built-in endpoints to simulate full end-to-end load life cycles for demonstration and testing purposes.
