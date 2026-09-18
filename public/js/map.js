/**
 * NEXORA Interactive Highway Corridor Map
 * Built with Leaflet.js: Displays monitored highway zones, 10km LoRa gateways,
 * emergency response dispatch vectors, and live accident marker popup.
 */

const HighwayMapManager = {
  map: null,
  markers: {},
  routeLines: [],
  accidentMarker: null,
  isInitialized: false,

  // Corridor Center: Western Expressway Corridor (KM 100 - 140)
  centerCoords: [18.7562, 73.4140],
  corridorPolyline: [
    [18.7050, 73.3400], // KM 100
    [18.7124, 73.3512], // RB-001
    [18.7210, 73.3645], // RB-002
    [18.7305, 73.3790], // RB-003 / GW-01
    [18.7412, 73.3910], // RB-004
    [18.7490, 73.4025], // RB-005
    [18.7562, 73.4140], // RB-006 / GW-02
    [18.7684, 73.4328], // RB-023 (Accident Focus Zone 03)
    [18.7750, 73.4410], // RB-024
    [18.7830, 73.4520], // GW-03
    [18.7891, 73.4612], // RB-030
    [18.7984, 73.4735], // RB-031
    [18.8050, 73.4850]  // KM 140 / GW-04
  ],

  // IoT Gateways every 10 km
  gateways: [
    { id: 'GW-01', name: 'Gateway 01 (KM 108)', coords: [18.7280, 73.3750], rangeKm: 10 },
    { id: 'GW-02', name: 'Gateway 02 (KM 118)', coords: [18.7540, 73.4100], rangeKm: 10 },
    { id: 'GW-03', name: 'Gateway 03 (KM 128)', coords: [18.7740, 73.4390], rangeKm: 10 },
    { id: 'GW-04', name: 'Gateway 04 (KM 138)', coords: [18.8010, 73.4800], rangeKm: 10 }
  ],

  // Emergency Facilities
  emergencyServices: [
    {
      type: 'POLICE',
      name: 'Highway Patrol Post #4',
      coords: [18.7520, 73.4210],
      eta: '4 mins',
      color: '#3b82f6',
      icon: '🚓'
    },
    {
      type: 'HOSPITAL',
      name: 'Apex Trauma Center & Hospital',
      coords: [18.7820, 73.4250],
      eta: '8 mins',
      color: '#ef4444',
      icon: '🏥'
    },
    {
      type: 'AMBULANCE',
      name: 'EMS Emergency Dispatch Depot #3',
      coords: [18.7610, 73.4450],
      eta: '5 mins',
      color: '#10b981',
      icon: '🚑'
    }
  ],

  init() {
    if (this.isInitialized || !document.getElementById('highwayMap')) return;

    if (typeof L === 'undefined') {
      console.warn('Leaflet not loaded, retrying...');
      setTimeout(() => this.init(), 300);
      return;
    }

    // Initialize Map
    this.map = L.map('highwayMap', {
      center: this.centerCoords,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false
    });

    // Clean OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | NEXORA AIoT',
      maxZoom: 18
    }).addTo(this.map);

    // Draw Highway Corridor Line
    L.polyline(this.corridorPolyline, {
      color: '#1e3a8a',
      weight: 6,
      opacity: 0.85,
      dashArray: '10, 0'
    }).addTo(this.map).bindTooltip('Monitored Express Highway Corridor (KM 100 - 140)', { sticky: true });

    // Plot 10km Gateways
    this.gateways.forEach(gw => {
      const gwIcon = L.divIcon({
        className: 'custom-gw-icon',
        html: `<div style="background:#1e3a8a;color:white;padding:3px 6px;border-radius:4px;font-size:10px;font-weight:bold;border:1px solid #60a5fa;box-shadow:0 2px 4px rgba(0,0,0,0.3);text-align:center;">📡 ${gw.id}</div>`,
        iconSize: [60, 24],
        iconAnchor: [30, 12]
      });

      const marker = L.marker(gw.coords, { icon: gwIcon }).addTo(this.map);
      marker.bindPopup(`
        <strong>IoT Gateway: ${gw.name}</strong><br>
        Coverage: ~10 km Radius (LoRaWAN 868MHz)<br>
        Uplink: Dual 4G/Fiber Cellular Backhaul<br>
        Status: <span style="color:#059669;font-weight:bold;">ONLINE (100% Signal)</span>
      `);

      // Add faint coverage radius circle
      L.circle(gw.coords, {
        radius: 5000,
        color: '#3b82f6',
        fillColor: '#60a5fa',
        fillOpacity: 0.05,
        weight: 1,
        dashArray: '4, 4'
      }).addTo(this.map);
    });

    // Plot Emergency Stations
    this.emergencyServices.forEach(es => {
      const esIcon = L.divIcon({
        className: 'custom-es-icon',
        html: `<div style="background:${es.color};color:white;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:bold;border:2px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.3);display:flex;align-items:center;gap:4px;">${es.icon} <span>${es.type}</span></div>`,
        iconSize: [85, 26],
        iconAnchor: [42, 13]
      });

      const marker = L.marker(es.coords, { icon: esIcon }).addTo(this.map);
      marker.bindPopup(`
        <strong>${es.icon} ${es.name}</strong><br>
        Agency Category: ${es.type}<br>
        Baseline Response Time to Zone 03: ${es.eta}<br>
        Integration: Automated API Dispatch Link Active
      `);
    });

    this.isInitialized = true;
  },

  showAccidentMarker(accidentData) {
    if (!this.map) this.init();
    if (!this.map) return;

    const crashCoords = [18.7684, 73.4328]; // RB-023 location

    // Remove previous accident marker & lines
    if (this.accidentMarker) this.map.removeLayer(this.accidentMarker);
    this.clearRouteLines();

    // Red pulsing accident marker
    const crashIcon = L.divIcon({
      className: 'accident-marker-pulse',
      html: `
        <div style="position:relative;width:36px;height:36px;">
          <div style="position:absolute;width:36px;height:36px;border-radius:50%;background:rgba(239,68,68,0.4);animation:pulse-ring 1s infinite;"></div>
          <div style="position:absolute;top:6px;left:6px;width:24px;height:24px;border-radius:50%;background:#dc2626;border:2px solid white;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;">🚨</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    this.accidentMarker = L.marker(crashCoords, { icon: crashIcon }).addTo(this.map);

    const timeString = accidentData.timeFormatted || new Date().toLocaleTimeString();

    const popupContent = `
      <div style="font-family:inherit;min-width:220px;">
        <div style="background:#dc2626;color:white;padding:6px 10px;margin:-14px -14px 10px -14px;border-radius:4px 4px 0 0;font-weight:bold;font-size:13px;display:flex;align-items:center;gap:6px;">
          🚨 ACCIDENT DETECTED
        </div>
        <table style="width:100%;font-size:12px;border-collapse:collapse;line-height:1.7;">
          <tr><td><strong>Barrier ID:</strong></td><td><span style="color:#b45309;font-weight:bold;">RB-023</span></td></tr>
          <tr><td><strong>Zone:</strong></td><td>KM 120–130 (Zone 03)</td></tr>
          <tr><td><strong>Location:</strong></td><td>Highway Curve KM 126.4</td></tr>
          <tr><td><strong>Impact Force:</strong></td><td><span style="color:#dc2626;font-weight:bold;">${accidentData.impact_force || '38.5'} kN</span></td></tr>
          <tr><td><strong>Severity:</strong></td><td><span style="background:#fee2e2;color:#991b1b;padding:1px 6px;border-radius:3px;font-weight:bold;">HIGH</span></td></tr>
          <tr><td><strong>Time:</strong></td><td>${timeString}</td></tr>
          <tr><td><strong>Status:</strong></td><td><span style="color:#059669;font-weight:bold;">✓ EMERGENCY ALERT SENT</span></td></tr>
        </table>
      </div>
    `;

    this.accidentMarker.bindPopup(popupContent).openPopup();
    this.map.flyTo(crashCoords, 13, { duration: 1.2 });

    // Draw dispatch routes from emergency stations to the crash location
    this.emergencyServices.forEach(es => {
      const line = L.polyline([es.coords, crashCoords], {
        color: es.color,
        weight: 3,
        opacity: 0.8,
        dashArray: '6, 6'
      }).addTo(this.map);
      this.routeLines.push(line);
    });
  },

  clearRouteLines() {
    this.routeLines.forEach(line => this.map.removeLayer(line));
    this.routeLines = [];
  },

  reset() {
    if (this.accidentMarker && this.map) {
      this.map.removeLayer(this.accidentMarker);
      this.accidentMarker = null;
    }
    this.clearRouteLines();
    if (this.map) {
      this.map.closePopup();
      this.map.flyTo(this.centerCoords, 12, { duration: 1 });
    }
  }
};

window.HighwayMapManager = HighwayMapManager;
