/**
 * NEXORA API Client
 * Seamlessly interfaces with Node.js Express Backend,
 * with reliable client-side mock fallback if loaded offline.
 */

const API = {
  baseUrl: window.location.origin,

  async isBackendLive() {
    try {
      const res = await fetch(`${this.baseUrl}/api/barriers`, { method: 'GET' });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async getBarriers() {
    try {
      const res = await fetch(`${this.baseUrl}/api/barriers`);
      const data = await res.json();
      return data.data;
    } catch (e) {
      console.warn('Backend unavailable, using client store:', e);
      return this.getLocalBarriers();
    }
  },

  async simulateAccident(payload = {}) {
    try {
      const res = await fetch(`${this.baseUrl}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, generating simulated local response:', e);
      return this.generateLocalSimulationResponse(payload);
    }
  },

  async resetSimulation() {
    try {
      const res = await fetch(`${this.baseUrl}/api/reset`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      return { success: true, message: 'Reset local simulation' };
    }
  },

  async getCommandCenterData() {
    try {
      const res = await fetch(`${this.baseUrl}/api/command-center`);
      return await res.json();
    } catch (e) {
      return {
        success: true,
        stats: {
          activeAccidents: 1,
          monitoredBarriers: 120,
          healthyBarriers: 117,
          damagedBarriers: 2,
          alertsSent: 1
        },
        recentAccidents: [],
        recentAlerts: []
      };
    }
  },

  async verifyFusion(acceleration, force, tilt) {
    try {
      const res = await fetch(`${this.baseUrl}/api/fusion/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceleration, force, tilt })
      });
      return await res.json();
    } catch (e) {
      let score = 0;
      if (acceleration > 4.0) score += 40;
      else if (acceleration > 2.0) score += 20;
      if (force > 30.0) score += 40;
      else if (force > 15.0) score += 20;
      if (tilt > 15.0) score += 20;
      else if (tilt > 5.0) score += 10;

      let severity = 'NORMAL';
      if (score >= 70) severity = force > 40 ? 'CRITICAL' : 'HIGH';
      else if (score >= 40) severity = 'MEDIUM';
      else if (score >= 15) severity = 'LOW';

      return {
        success: true,
        data: {
          score,
          severity,
          isAccident: severity !== 'NORMAL' && severity !== 'LOW',
          notes: [`Triangulated verification score: ${score}/100`]
        }
      };
    }
  },

  getLocalBarriers() {
    return [
      { barrier_id: 'RB-001', location: 'KM 102.4 - Northbound', zone: 'Zone 01', status: 'HEALTHY', sensors: { acceleration: 0.98, force: 0, tilt: 1.8 }, last_inspection: '2026-09-10', impact_history: 0, battery: 98 },
      { barrier_id: 'RB-002', location: 'KM 105.8 - Northbound', zone: 'Zone 01', status: 'HEALTHY', sensors: { acceleration: 0.99, force: 0, tilt: 2.0 }, last_inspection: '2026-09-10', impact_history: 0, battery: 95 },
      { barrier_id: 'RB-003', location: 'KM 109.1 - Southbound', zone: 'Zone 01', status: 'HEALTHY', sensors: { acceleration: 0.98, force: 0, tilt: 1.9 }, last_inspection: '2026-09-11', impact_history: 0, battery: 99 },
      { barrier_id: 'RB-004', location: 'KM 112.3 - Curve Entry', zone: 'Zone 02', status: 'MAINTENANCE_REQUIRED', sensors: { acceleration: 1.05, force: 0.2, tilt: 5.4 }, last_inspection: '2026-08-28', impact_history: 1, battery: 82 },
      { barrier_id: 'RB-005', location: 'KM 115.6 - Valley Bridge', zone: 'Zone 02', status: 'HEALTHY', sensors: { acceleration: 0.98, force: 0, tilt: 2.1 }, last_inspection: '2026-09-12', impact_history: 0, battery: 97 },
      { barrier_id: 'RB-006', location: 'KM 118.9 - Southbound', zone: 'Zone 02', status: 'HEALTHY', sensors: { acceleration: 0.97, force: 0, tilt: 2.0 }, last_inspection: '2026-09-12', impact_history: 0, battery: 94 },
      { barrier_id: 'RB-023', location: 'KM 126.4 - Sharp Curve', zone: 'Zone 03', status: 'HEALTHY', sensors: { acceleration: 0.98, force: 0, tilt: 2.1 }, last_inspection: '2026-09-15', impact_history: 0, battery: 96 },
      { barrier_id: 'RB-024', location: 'KM 128.2 - Gradient Section', zone: 'Zone 03', status: 'HEALTHY', sensors: { acceleration: 0.98, force: 0, tilt: 2.2 }, last_inspection: '2026-09-15', impact_history: 0, battery: 93 },
      { barrier_id: 'RB-030', location: 'KM 133.5 - Southbound', zone: 'Zone 04', status: 'HEALTHY', sensors: { acceleration: 0.98, force: 0, tilt: 1.7 }, last_inspection: '2026-09-16', impact_history: 0, battery: 100 },
      { barrier_id: 'RB-031', location: 'KM 137.0 - Interchange Entry', zone: 'Zone 04', status: 'HEALTHY', sensors: { acceleration: 0.99, force: 0, tilt: 2.3 }, last_inspection: '2026-09-16', impact_history: 0, battery: 91 }
    ];
  },

  generateLocalSimulationResponse(payload) {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    return {
      success: true,
      simulation: {
        status: 'ACCIDENT_DETECTED_AND_DISPATCHED',
        vehicleSpeedKmh: payload.speed_kmh || 82,
        fusionAnalysis: {
          score: 85,
          severity: 'HIGH',
          isAccident: true,
          notes: ['Severe kinetic shockwave detected (> 4.0g)', 'Critical structural collision force (> 30 kN)']
        },
        accident: {
          accident_id: `ACC-${Date.now().toString().slice(-6)}`,
          barrier_id: payload.barrier_id || 'RB-023',
          location: 'KM 126.4 - Sharp Curve',
          zone: 'Zone 03 (KM 120-130)',
          severity: 'HIGH',
          impact_force: payload.force || 38.5,
          peak_acceleration: payload.acceleration || 4.8,
          tilt_deflection: payload.tilt || 18.0,
          timeFormatted: timeStr,
          response_status: 'ALERT_SENT'
        },
        alert: {
          alert_id: `ALT-${Date.now().toString().slice(-6)}`,
          accident_id: `ACC-${Date.now().toString().slice(-6)}`,
          barrier_id: 'RB-023',
          location: 'KM 126.4 - Sharp Curve',
          severity: 'HIGH',
          timeFormatted: timeStr,
          latency_sec: 2.40,
          police: { station: 'Highway Patrol Post #4', status: 'SENT', eta: '4 mins' },
          hospital: { hospital: 'Apex Trauma Center', status: 'SENT', eta: '8 mins' },
          ambulance: { unit: 'EMS Unit 108-Alpha', status: 'DISPATCHED', eta: '5 mins' }
        },
        stats: {
          activeAccidents: 1,
          monitoredBarriers: 120,
          healthyBarriers: 117,
          damagedBarriers: 2,
          alertsSent: 1
        }
      }
    };
  }
};

window.API = API;
