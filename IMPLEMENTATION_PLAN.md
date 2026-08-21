# Implementation Plan - Bicycle Parking Locator and Pricing Calculator (Updated)

We want to build a self-contained, high-fidelity Nuxt 3/4 web application using Bootstrap to locate bicycle parking/racks near a specified location, calculate estimated parking fees dynamically based on duration, and manage parking locations through an admin interface.

---

## Technical Feasibility & Design Decisions

### 1. Map Rendering with MapLibre GL JS and OpenMapTiles

The embedded maps now use **MapLibre GL JS** with an OpenMapTiles-compatible style URL. This keeps the app on an open vector-map rendering stack without requiring us to self-host tiles immediately.

- **Map Isolation**: All mapping functionality (rendering pins, drawing popups, picking coordinates, handling map clicks) is encapsulated within `app/components/MapClient.vue`.
- **Hosted Tile Strategy**: The default style URL is configured through `NUXT_PUBLIC_MAP_STYLE_URL`, with optional `NUXT_PUBLIC_MAPTILER_KEY` replacement for hosted MapTiler/OpenMapTiles styles.
- **Future Self-Hosting Path**: Self-hosting remains a future work item. The likely path is TileServer GL or MapTiler Server serving `.mbtiles` over HTTP, with the Nuxt app pointing `NUXT_PUBLIC_MAP_STYLE_URL` at that server's style JSON endpoint.
- **Migration Path**: To switch to Google Maps later, we would rewrite the isolated `MapClient.vue` implementation and replace the geocoding provider. The search page, pricing calculator, and admin forms can remain mostly unchanged.

### 2. Scalability of Single JSON File

- **Feasibility**: Yes, a single JSON file is **more than sufficient** for hundreds (and even a few thousand) of parking spaces.
- **Size and Performance**: 1,000 parking spaces with detailed rate info and base64 thumbnail pointers will compile to less than 2-3 megabytes. Reading and writing this file takes milliseconds, which can easily be cached in-memory by Nitro on startup. It is lightweight, database-free, and perfect for this project scope.

---

## Architectural Adjustments

### 1. Payment Methods Definition & Multi-Country Mapping

To handle payment methods cleanly, we define a master dictionary of payment definitions (including shorthand keys, display names, and icon names). Each country configuration then lists the keys of the payment methods it supports.

```typescript
export interface PaymentMethodDef {
	key: string;
	name: string;
	icon: string; // Material Symbols icon key (e.g. 'payments', 'credit_card', 'contactless')
}

export const PAYMENT_METHODS: Record<string, PaymentMethodDef> = {
	cash: { key: 'cash', name: 'Cash', icon: 'payments' },
	credit: { key: 'credit', name: 'Credit Card', icon: 'credit_card' },
	ic: { key: 'ic', name: 'IC Card (Suica/Pasmo/etc.)', icon: 'contactless' },
	paypay: { key: 'paypay', name: 'PayPay', icon: 'qr_code' },
	linepay: { key: 'linepay', name: 'LINE Pay', icon: 'qr_code_2' },
	applepay: { key: 'applepay', name: 'Apple Pay', icon: 'contactless' },
	googlepay: { key: 'googlepay', name: 'Google Pay', icon: 'contactless' },
};

export interface CountryConfig {
	name: string;
	currencySymbol: string;
	currencyCode: string;
	supportedPaymentMethods: string[]; // List of shorthand keys referring to PAYMENT_METHODS
}

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
	Japan: {
		name: 'Japan',
		currencySymbol: '¥',
		currencyCode: 'JPY',
		supportedPaymentMethods: ['cash', 'credit', 'ic', 'paypay', 'linepay'],
	},
	'United States': {
		name: 'United States',
		currencySymbol: '$',
		currencyCode: 'USD',
		supportedPaymentMethods: ['cash', 'credit', 'applepay', 'googlepay'],
	},
	'United Kingdom': {
		name: 'United Kingdom',
		currencySymbol: '£',
		currencyCode: 'GBP',
		supportedPaymentMethods: ['cash', 'credit', 'applepay', 'googlepay'],
	},
};
```

We will update [shared/types/parking.ts](file:///c:/Users/Ethan/Workspace/bicycle-parking/shared/types/parking.ts) to:

- Include `country: string`.
- Make `paymentMethods` store shorthand keys (e.g., `["cash", "ic"]`).
- Dynamically resolve keys to display names and icons on the client side using the country configuration.

### 2. Page Structure (Airbnb/Google Flights Flow)

We will split the interface into three pages:

1. **Landing Page (`pages/index.vue`)**:
    - A beautiful, immersive, and premium landing page with a hero search console.
    - Inputs: Destination address (with geocoding autocomplete dropdown) and optional stay duration (hours/minutes).
    - "Search" button redirects to `/search` with query params (e.g. `/search?q=Ikebukuro&lat=35.7289&lng=139.7104&duration=180`).
2. **Search & Results Page (`pages/search.vue`)**:
    - A split-screen layout (results & filters on the left, interactive MapLibre map on the right).
    - Synchronized with URL query parameters so reloading keeps the exact search state.
    - An inline search bar at the top lets users modify location or duration, instantly updating results on the same page.
    - Shows distances, dynamic prices, and cheapest/closest recommendations.
3. **Admin Dashboard Page (`pages/admin.vue`)**:
    - Create, edit, and delete parking locations.
    - Selecting a country automatically adjusts available payment checkboxes and rate currency previews.

---

## Open Questions Resolved

- **Default Location**: Ikebukuro Station (`35.7289, 139.7104`) will be the default center for empty searches.
- **Currency and Payments**: The system will dynamically select currency symbols (e.g., `¥`, `$`, `£`) and payment options based on the lot's `country` field.
- **Seeding Data**: The application will automatically seed `shared/data/parking.json` with three example lots (Lot A, Lot B, and a US-based Lot C for testing multi-currency support) if the file doesn't exist yet.

---

## Proposed Changes

### Configuration & Style

#### [MODIFY] [nuxt.config.ts](file:///c:/Users/Ethan/Workspace/bicycle-parking/nuxt.config.ts)

- Configure styles and head options to include MapLibre GL JS CSS/JS CDNs dynamically.

#### [MODIFY] [global.scss](file:///c:/Users/Ethan/Workspace/bicycle-parking/app/styles/global.scss)

- Define custom dark/light variables for a high-end UI theme.
- Add split-screen page layout classes, animations, slider styling, and map constraints.

### Types & Utilities

#### [NEW] [parking.ts](file:///c:/Users/Ethan/Workspace/bicycle-parking/shared/types/parking.ts)

- Add interfaces for `ParkingLocation`, `PricingRate`, `ChargeStep`, `CountryConfig`, `PaymentMethodDef`, and mapping dictionaries.

#### [NEW] [pricing.ts](file:///c:/Users/Ethan/Workspace/bicycle-parking/shared/utils/pricing.ts)

- Core price calculator implementation.
- Haversine distance calculator.

#### [NEW] [pricing.test.ts](file:///c:/Users/Ethan/Workspace/bicycle-parking/shared/utils/pricing.test.ts)

- Quick validation script for Lot A and Lot B rates for durations like 1h, 2h, 3h, 5h, 9h, 24h.

### Server API

#### [NEW] [parking.get.ts](file:///c:/Users/Ethan/Workspace/bicycle-parking/server/api/parking.get.ts)

- Returns all parking locations. If `lat` and `lng` query params are passed, computes and includes distance.
- Auto-seeds the database if empty.

#### [NEW] [parking.post.ts](file:///c:/Users/Ethan/Workspace/bicycle-parking/server/api/parking.post.ts)

- Creates or updates a parking location in the JSON storage file.

#### [NEW] [parking.delete.ts](file:///c:/Users/Ethan/Workspace/bicycle-parking/server/api/parking.delete.ts)

- Deletes a parking location by ID.

### Frontend Components & Pages

#### [NEW] [Map.client.vue](file:///c:/Users/Ethan/Workspace/bicycle-parking/app/components/Map.client.vue)

- MapLibre map component with custom pins for destination and nearby parking lots. Handles click events and supports hosted OpenMapTiles-compatible styles.

#### [MODIFY] [index.vue](file:///c:/Users/Ethan/Workspace/bicycle-parking/app/pages/index.vue)

- A highly polished hero landing page. Hero search card with autocomplete address input and duration slider.

#### [NEW] [search.vue](file:///c:/Users/Ethan/Workspace/bicycle-parking/app/pages/search.vue)

- The main interactive finder. Dual-panel view syncing inputs, slider, lists, and map coordinates.

#### [NEW] [admin.vue](file:///c:/Users/Ethan/Workspace/bicycle-parking/app/pages/admin.vue)

- CRUD dashboard for parking lots, featuring rate forms, photo uploads (base64 conversion), map coordinate picking, and country configurations.

---

## Verification Plan

### Automated Verification

- Run tests on `pricing.test.ts` to confirm calculations match.
- Build checking via `npm run build` or `npx nuxt prepare`.

### Manual Verification

1. Open the home page (`/`) and search for a destination (e.g. "Ikebukuro Station"). Verify it redirects to `/search` with parameters.
2. Drag the stay duration slider on the search page. Confirm prices update in real-time.
3. Switch countries in the admin panel to "United States" and add a lot. Verify that currency symbols ($) and Apple/Google Pay options adjust automatically.
4. Verify photo uploads load correctly.
