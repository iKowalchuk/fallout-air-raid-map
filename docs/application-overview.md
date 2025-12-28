# Application Overview

Real-time air raid alert monitoring application for Ukraine, styled in the Fallout Pip-Boy aesthetic. The application displays active alerts across all 25 Ukrainian oblasts (regions) with an interactive map and message log.

## Purpose

- Display real-time air raid alerts from the Ukrainian alerts API (https://api.alerts.in.ua)
- Provide visual representation of alert status across Ukraine's regions
- Show historical alert messages with timeline visualization

## Data Model

### External API (alerts.in.ua)

The application consumes data from the Ukrainian alerts API:

```typescript
// Alert from external API
interface AlertsInUaAlert {
  id: number;                    // Unique alert identifier
  location_title: string;        // Location name (e.g., "Київська область")
  location_type: LocationType;   // "oblast" | "raion" | "hromada" | "city"
  started_at: string;            // ISO datetime - alert start
  finished_at: string | null;    // ISO datetime - end (null if active)
  alert_type: ApiAlertType;      // "air_raid" | "artillery_shelling" | "urban_fights" | "chemical" | "nuclear"
  location_uid: string;          // Location UID for mapping
  location_oblast?: string;      // Oblast name
}
```

### Internal Data Model

The application transforms external data to internal format:

```typescript
// Internal alert state
interface AlertState {
  regionId: string;      // Internal region ID (e.g., "kyiv-city", "kharkiv")
  isActive: boolean;     // Whether alert is currently active
  alertType: AlertType;  // Internal alert type
  startTime: string | null;
}

// Alert message for message log
interface AlertMessage {
  id: string;
  timestamp: string;
  regionId: string;
  regionName: string;    // Human-readable region name (Ukrainian)
  type: MessageType;     // "alert_start" | "alert_end" | "uav_detected" | "missile_detected" | "info"
  message: string;
}
```

### Region Model

All 25 Ukrainian oblasts plus Crimea and Sevastopol:

```typescript
interface Region {
  id: string;           // Internal ID (e.g., "kyiv-city", "kharkiv")
  nameUa: string;       // Ukrainian name
  nameEn: string;       // English name
  position: "left" | "right";  // UI positioning for region list
}
```

## Core Features

### 1. Map View (`/map`)
- Interactive SVG map of Ukraine
- Regions colored based on alert status (active/inactive)
- Click regions to view details
- Mobile-friendly with drawer navigation

### 2. Info View (`/info`) - Default
- Real-time alert status indicator
- Message log showing alert history (start/end events)
- Timeline bar visualization
- Cache status indicator

### 3. API Layer
- **`/api/alerts`** - Returns current active alerts for all regions
- **`/api/alerts/history`** - Returns alert history messages with caching

## Data Flow

```
alerts.in.ua API
       ↓
  Next.js API Routes (transform & cache)
       ↓
  React Query (client-side caching & polling)
       ↓
  UI Components (Map, Info, MessageLog)
```

## Get Started

To get started, check the README.md file.
