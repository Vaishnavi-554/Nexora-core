/**
 * NEXORA – AIoT Smart Rolling Barrier & Accident Response System
 * Backend Server (Node.js + Express)
 * SIH Innovation Prototype
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sensor Fusion Decision Matrix
function evaluateSensorFusion(acceleration, force, tilt) {
  // Acceleration in g, Force in kN, Tilt in degrees
  let score = 0;
  let severity = 'NORMAL';
  let verificationNotes = [];

  // Accelerometer verification (Baseline: 0.98g)
  if (acceleration > 4.0) {
    score += 40;
    verificationNotes.push('Severe kinetic shockwave detected (> 4.0g)');
  } else if (acceleration > 2.5) {
    score += 25;
    verificationNotes.push('Moderate impact acceleration detected (> 2.5g)');
  } else if (acceleration > 1.4) {
    score += 10;
    verificationNotes.push('Minor vibration / road bump (< 2.5g)');
  }

  // Load Cell verification (Baseline: 0 kN)
  if (force > 30.0) {
    score += 40;
    verificationNotes.push('Critical structural impact force detected (> 30 kN)');
  } else if (force > 15.0) {
    score += 25;
    verificationNotes.push('Significant collision force detected (> 15 kN)');
  } else if (force > 5.0) {
    score += 10;
    verificationNotes.push('Low-level grazing impact (< 15 kN)');
  }

  // Tilt Sensor verification (Baseline: 2.0 deg)
  if (tilt > 15.0) {
    score += 20;
    verificationNotes.push('Permanent structural displacement / severe tilt (> 15°)');
  } else if (tilt > 8.0) {
    score += 15;
    verificationNotes.push('Noticeable barrier displacement (> 8°)');
  } else if (tilt > 4.0) {
    score += 5;
    verificationNotes.push('Minor angular flexure (< 8°)');
  }

  // Final Fusion Classification
  if (score >= 70) {
    severity = 'HIGH'; // or CRITICAL
    if (force > 40 || acceleration > 5.0 || tilt > 20) severity = 'CRITICAL';
  } else if (score >= 40) {
    severity = 'MEDIUM';
  } else if (score >= 15) {
    severity = 'LOW';
  } else {
    severity = 'NORMAL';
  }

  return {
    score,
    severity,
    isAccident: severity !== 'NORMAL' && severity !== 'LOW',
    notes: verificationNotes,
    algorithm: 'Multi-Sensor Fusion Triangulation (ADXL345 + HX711 + MPU6050)'
  };
}

// REST API Endpoints

// 1. Get all barriers
app.get('/api/barriers', async (req, res) => {
  try {
    const barriers = await db.getAllBarriers();
    res.json({ success: true, data: barriers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get single barrier
app.get('/api/barriers/:id', async (req, res) => {
  try {
    const barrier = await db.getBarrier(req.params.id);
    if (!barrier) return res.status(404).json({ success: false, error: 'Barrier not found' });
    res.json({ success: true, data: barrier });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Sensor Fusion Verification endpoint
app.post('/api/fusion/verify', (req, res) => {
  const { acceleration = 0.98, force = 0.0, tilt = 2.0 } = req.body;
  const result = evaluateSensorFusion(
    parseFloat(acceleration),
    parseFloat(force),
    parseFloat(tilt)
  );
  res.json({ success: true, data: result });
});

// 4. Simulate Accident
app.post('/api/simulate', async (req, res) => {
  try {
    const {
      barrier_id = 'RB-023',
      acceleration = 4.80,
      force = 38.50,
      tilt = 18.20,
      speed_kmh = 82
    } = req.body;

    const fusion = evaluateSensorFusion(acceleration, force, tilt);
    
    // Log sensor reading
    await db.logSensorReading({
      barrier_id,
      acceleration,
      force,
      tilt
    });

    // Record accident and alerts
    const { accident, alert } = await db.recordAccident({
      barrier_id,
      location: 'KM 126.4 - Sharp Curve (Zone 03)',
      zone: 'Zone 03 (KM 120-130)',
      severity: fusion.severity,
      impact_force: force,
      peak_acceleration: acceleration,
      tilt_deflection: tilt
    });

    const stats = await db.getStats();

    res.json({
      success: true,
      simulation: {
        status: 'ACCIDENT_DETECTED_AND_DISPATCHED',
        vehicleSpeedKmh: speed_kmh,
        fusionAnalysis: fusion,
        accident,
        alert,
        stats,
        telemetry: {
          barrier_id,
          gps: { lat: 18.7684, lng: 73.4328 },
          zone: 'Zone 03 (KM 120-130)',
          gateway: 'GW-03 (LoRaWAN 868MHz - Range 10km)',
          latency: '2.4s',
          packet_hex: '0xRB023A30F267E1'
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Reset Simulation
app.post('/api/reset', async (req, res) => {
  try {
    db.reset();
    const stats = await db.getStats();
    res.json({
      success: true,
      message: 'System simulation state reset to nominal baseline.',
      stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Get Recent Accidents
app.get('/api/accidents', async (req, res) => {
  try {
    const accidents = await db.getAccidents();
    res.json({ success: true, data: accidents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Get Emergency Alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await db.getEmergencyAlerts();
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Command Center Stats
app.get('/api/command-center', async (req, res) => {
  try {
    const stats = await db.getStats();
    const accidents = await db.getAccidents();
    const alerts = await db.getEmergencyAlerts();
    res.json({
      success: true,
      stats,
      recentAccidents: accidents.slice(0, 5),
      recentAlerts: alerts.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Root route fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  NEXORA AIoT Highway Safety Prototype Online     `);
  console.log(`  Server Port : http://localhost:${PORT}             `);
  console.log(`  Stack       : Node.js + Express + MySQL Architecture`);
  console.log(`====================================================`);
});
