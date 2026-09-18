# NEXORA – AIoT Smart Rolling Barrier & Accident Response System

> **Smart India Hackathon (SIH) Prototype**  
> *"Smarter Barriers. Faster Response. Safer Highways."*

Turning highway barriers into intelligent safety infrastructure that absorbs collision energy, detects crashes in milliseconds, pinpoints exact GPS coordinates, and dispatches automated emergency alerts to Police, Trauma Hospitals, and Ambulances.

---

## 🚀 Quick Start (Running the Prototype)

### 1. Requirements
- **Node.js**: v18+ (Tested on v24)
- **Browser**: Modern Chromium, Edge, Firefox, or Safari

### 2. Start the Application
Open a terminal in the project directory:
```bash
node server.js
```
The console will display:
```
====================================================
  NEXORA AIoT Highway Safety Prototype Online     
  Server Port : http://localhost:3000             
  Stack       : Node.js + Express + MySQL Architecture
====================================================
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🛠️ Technical Architecture & Stack

Strictly aligned with the hackathon specification:

| Layer | Technology | Function |
|---|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6 Modules) | Interactive physics collision simulation, Leaflet GIS map, real-time canvas oscilloscopes, Jury Mode tour |
| **Backend** | Node.js + Express | REST APIs (`/api/simulate`, `/api/barriers`, `/api/accidents`, `/api/command-center`) |
| **Database** | MySQL (`database/schema.sql`) | Full relational schema (`barriers`, `sensor_readings`, `accidents`, `emergency_alerts`) with zero-config auto-fallback |
| **IoT Prototype** | Raspberry Pi + LoRaWAN (868 MHz) + ESP32 | 10 km gateway zones receiving packet telemetry from triple-sensor barrier modules |

---

## 🎯 Key Features & Jury Highlights

1. **Live Rolling Barrier Collision Simulation**:
   - Vehicle approaches and strikes the rolling barrier.
   - Cylinders visibly rotate with rotational kinetic damping ("Impact Energy ➔ Rotational Energy").
   - Multi-sensor spike: Accelerometer (0.98g ➔ 4.8g), Load Cell (0 kN ➔ 38.5 kN), Tilt Sensor (2° ➔ 18°).
   - Real-time LoRa packet flight from Barrier RB-023 to the 10km Gateway and Cloud backend.
2. **Real-Time Sensor Dashboard**:
   - Live oscilloscope waveforms for Acceleration, Collision Force, and Tilt.
3. **Interactive Highway Corridor GIS Map**:
   - Monitored 40 km corridor (KM 100 to 140) with 4 Zones.
   - Live gateways every 10 km, emergency stations (Police, Trauma Hospital, Ambulance).
   - Pulsing accident beacon and automated dispatch routing lines.
4. **Emergency Notification & Command Center**:
   - Multi-agency alert panel triggered in 2.4 seconds (`DEMO SIMULATION`).
   - Unified Highway Command Center with live KPI counters and relational incident audit log.
5. **Barrier Network Health Monitoring**:
   - Grid of 10+ monitored units.
   - Click any barrier to inspect live telemetry, battery/solar status, and maintenance history.
6. **AI Multi-Sensor Fusion Sandbox**:
   - Interactive sliders and presets (Speed bump, Wind gust, Minor graze, Severe crash) to test false-alarm rejection.
7. **Jury Demo Mode (60–90s Guided Walkthrough)**:
   - Click `[JURY DEMO MODE]` in the navbar to start the automated 6-step presentation tour.

---

## 📁 Project Structure

```
Nexora/
├── server.js                      # Express backend REST server & static host
├── package.json                   # Project dependencies (express, cors)
├── database/
│   ├── schema.sql                 # MySQL relational schema & seed data
│   └── db.js                      # Relational store (MySQL / Memory fallback)
├── public/
│   ├── index.html                 # Comprehensive 24-section single-page application
│   ├── css/
│   │   ├── style.css              # Highway design system
│   │   ├── simulation.css         # Live collision & rotating cylinder physics
│   │   └── dashboard.css          # Command center, charts, and alert panel
│   └── js/
│       ├── api.js                 # API client with offline fallback
│       ├── charts.js              # Real-time canvas oscilloscope waveforms
│       ├── map.js                 # Leaflet GIS corridor map & dispatch vectors
│       ├── simulation.js          # Collision physics & 12-step event pipeline
│       ├── sensor-fusion.js       # AI sensor fusion decision matrix
│       ├── jury-mode.js           # 60-90s guided SIH presentation tour
│       └── main.js                # UI orchestrator & barrier modal inspector
└── README.md                      # Documentation
```

---

## ⚖️ Realism & Ethics Note
This project is an **SIH Innovation Prototype**. Simulated emergency notifications and telemetry are labeled `DEMO SIMULATION` to ensure complete academic transparency.
