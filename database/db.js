/**
 * NEXORA Database Access Layer
 * Supports seamless in-memory relational store for zero-config prototype demo,
 * with standard MySQL structure matching database/schema.sql.
 */

const fs = require('fs');
const path = require('path');

// Initial seed barriers matching the highway corridor
const initialBarriers = [
  {
    barrier_id: 'RB-001',
    location: 'KM 102.4 - Northbound Straight',
    zone: 'Zone 01 (KM 100-110)',
    status: 'HEALTHY',
    latitude: 18.7124,
    longitude: 73.3512,
    gateway_id: 'GW-01',
    sensors: { acceleration: 0.98, force: 0.0, tilt: 1.8 },
    last_inspection: '2026-09-10 08:30:00',
    impact_history: 0,
    battery: 98
  },
  {
    barrier_id: 'RB-002',
    location: 'KM 105.8 - Northbound Bridge',
    zone: 'Zone 01 (KM 100-110)',
    status: 'HEALTHY',
    latitude: 18.7210,
    longitude: 73.3645,
    gateway_id: 'GW-01',
    sensors: { acceleration: 0.99, force: 0.0, tilt: 2.0 },
    last_inspection: '2026-09-10 09:15:00',
    impact_history: 0,
    battery: 95
  },
  {
    barrier_id: 'RB-003',
    location: 'KM 109.1 - Southbound Ramp',
    zone: 'Zone 01 (KM 100-110)',
    status: 'HEALTHY',
    latitude: 18.7305,
    longitude: 73.3790,
    gateway_id: 'GW-01',
    sensors: { acceleration: 0.98, force: 0.0, tilt: 1.9 },
    last_inspection: '2026-09-11 11:00:00',
    impact_history: 0,
    battery: 99
  },
  {
    barrier_id: 'RB-004',
    location: 'KM 112.3 - Curve Entry (Zone 02)',
    zone: 'Zone 02 (KM 110-120)',
    status: 'MAINTENANCE_REQUIRED',
    latitude: 18.7412,
    longitude: 73.3910,
    gateway_id: 'GW-02',
    sensors: { acceleration: 1.05, force: 0.2, tilt: 5.4 },
    last_inspection: '2026-08-28 14:20:00',
    impact_history: 1,
    battery: 82
  },
  {
    barrier_id: 'RB-005',
    location: 'KM 115.6 - Valley Bridge',
    zone: 'Zone 02 (KM 110-120)',
    status: 'HEALTHY',
    latitude: 18.7490,
    longitude: 73.4025,
    gateway_id: 'GW-02',
    sensors: { acceleration: 0.98, force: 0.0, tilt: 2.1 },
    last_inspection: '2026-09-12 10:10:00',
    impact_history: 0,
    battery: 97
  },
  {
    barrier_id: 'RB-006',
    location: 'KM 118.9 - Southbound Valley',
    zone: 'Zone 02 (KM 110-120)',
    status: 'HEALTHY',
    latitude: 18.7562,
    longitude: 73.4140,
    gateway_id: 'GW-02',
    sensors: { acceleration: 0.97, force: 0.0, tilt: 2.0 },
    last_inspection: '2026-09-12 13:40:00',
    impact_history: 0,
    battery: 94
  },
  {
    barrier_id: 'RB-023',
    location: 'KM 126.4 - Sharp Curve (Demo Focus)',
    zone: 'Zone 03 (KM 120-130)',
    status: 'HEALTHY',
    latitude: 18.7684,
    longitude: 73.4328,
    gateway_id: 'GW-03',
    sensors: { acceleration: 0.98, force: 0.0, tilt: 2.1 },
    last_inspection: '2026-09-15 15:30:00',
    impact_history: 0,
    battery: 96
  },
  {
    barrier_id: 'RB-024',
    location: 'KM 128.2 - Gradient Section',
    zone: 'Zone 03 (KM 120-130)',
    status: 'HEALTHY',
    latitude: 18.7750,
    longitude: 73.4410,
    gateway_id: 'GW-03',
    sensors: { acceleration: 0.98, force: 0.0, tilt: 2.2 },
    last_inspection: '2026-09-15 16:15:00',
    impact_history: 0,
    battery: 93
  },
  {
    barrier_id: 'RB-030',
    location: 'KM 133.5 - Southbound Straight',
    zone: 'Zone 04 (KM 130-140)',
    status: 'HEALTHY',
    latitude: 18.7891,
    longitude: 73.4612,
    gateway_id: 'GW-04',
    sensors: { acceleration: 0.98, force: 0.0, tilt: 1.7 },
    last_inspection: '2026-09-16 09:00:00',
    impact_history: 0,
    battery: 100
  },
  {
    barrier_id: 'RB-031',
    location: 'KM 137.0 - Interchange Entry',
    zone: 'Zone 04 (KM 130-140)',
    status: 'HEALTHY',
    latitude: 18.7984,
    longitude: 73.4735,
    gateway_id: 'GW-04',
    sensors: { acceleration: 0.99, force: 0.0, tilt: 2.3 },
    last_inspection: '2026-09-16 11:30:00',
    impact_history: 0,
    battery: 91
  }
];

class Database {
  constructor() {
    this.reset();
  }

  reset() {
    this.barriers = JSON.parse(JSON.stringify(initialBarriers));
    this.sensorReadings = [];
    this.accidents = [];
    this.emergencyAlerts = [];
  }

  async getAllBarriers() {
    return this.barriers;
  }

  async getBarrier(id) {
    return this.barriers.find(b => b.barrier_id === id) || null;
  }

  async updateBarrierStatus(id, status, sensorUpdate = {}) {
    const barrier = this.barriers.find(b => b.barrier_id === id);
    if (barrier) {
      barrier.status = status;
      if (sensorUpdate.acceleration !== undefined) barrier.sensors.acceleration = sensorUpdate.acceleration;
      if (sensorUpdate.force !== undefined) barrier.sensors.force = sensorUpdate.force;
      if (sensorUpdate.tilt !== undefined) barrier.sensors.tilt = sensorUpdate.tilt;
      if (status === 'DAMAGE_DETECTED' || status === 'IMPACT_DETECTED') {
        barrier.impact_history += 1;
      }
    }
    return barrier;
  }

  async logSensorReading(data) {
    const reading = {
      reading_id: this.sensorReadings.length + 1,
      sensor_id: data.sensor_id || `SENS-${data.barrier_id}`,
      barrier_id: data.barrier_id,
      acceleration: parseFloat(data.acceleration),
      force: parseFloat(data.force),
      tilt: parseFloat(data.tilt),
      timestamp: new Date().toISOString()
    };
    this.sensorReadings.push(reading);
    return reading;
  }

  async recordAccident(accidentData) {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', { hour12: false });
    
    const accident = {
      accident_id: `ACC-${Date.now().toString().slice(-6)}`,
      barrier_id: accidentData.barrier_id || 'RB-023',
      location: accidentData.location || 'KM 126.4 - Sharp Curve',
      zone: accidentData.zone || 'Zone 03 (KM 120-130)',
      severity: accidentData.severity || 'HIGH',
      impact_force: parseFloat(accidentData.impact_force || 38.5),
      peak_acceleration: parseFloat(accidentData.peak_acceleration || 4.8),
      tilt_deflection: parseFloat(accidentData.tilt_deflection || 18.0),
      timestamp: now.toISOString(),
      timeFormatted: timeFormatted,
      response_status: 'ALERT_SENT'
    };

    this.accidents.unshift(accident);

    // Update barrier status
    await this.updateBarrierStatus(accident.barrier_id, 'DAMAGE_DETECTED', {
      acceleration: accident.peak_acceleration,
      force: accident.impact_force,
      tilt: accident.tilt_deflection
    });

    // Create corresponding emergency alerts
    const alert = {
      alert_id: `ALT-${Date.now().toString().slice(-6)}`,
      accident_id: accident.accident_id,
      barrier_id: accident.barrier_id,
      location: accident.location,
      severity: accident.severity,
      timestamp: accident.timestamp,
      timeFormatted: timeFormatted,
      latency_sec: 2.40,
      police: {
        station: 'Highway Patrol Post #4 (KM 121)',
        status: 'SENT',
        message: 'Collision alert transmitted. Lane-1 hazard flag raised.',
        eta: '4 mins'
      },
      hospital: {
        hospital: 'Apex Trauma Center & Hospital (Lonavala Bypass)',
        status: 'SENT',
        message: 'Severe kinetic impact reported. Trauma triage prepared.',
        eta: '8 mins'
      },
      ambulance: {
        unit: 'EMS Unit 108-Alpha (Station 3)',
        status: 'DISPATCHED',
        message: 'GPS emergency vector locked. Unit en route.',
        eta: '5 mins'
      }
    };

    this.emergencyAlerts.unshift(alert);

    return { accident, alert };
  }

  async getAccidents() {
    return this.accidents;
  }

  async getEmergencyAlerts() {
    return this.emergencyAlerts;
  }

  async getStats() {
    const total = 120; // 120 monitored along corridor
    const activeAccidents = this.accidents.length;
    const damaged = this.barriers.filter(b => b.status === 'DAMAGE_DETECTED' || b.status === 'MAINTENANCE_REQUIRED').length;
    const healthy = total - damaged - activeAccidents;
    const alertsSent = this.emergencyAlerts.length;

    return {
      activeAccidents: activeAccidents,
      monitoredBarriers: total,
      healthyBarriers: healthy,
      damagedBarriers: damaged,
      alertsSent: alertsSent,
      gatewayCount: 4,
      networkUptime: '99.98%'
    };
  }
}

module.exports = new Database();
