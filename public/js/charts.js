/**
 * NEXORA Real-Time Oscilloscope Canvas Charts
 * Lightweight, high-frame-rate rendering for Accelerometer, Load Cell, and Tilt.
 */

class TelemetryChart {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.label = options.label || 'Telemetry';
    this.unit = options.unit || '';
    this.color = options.color || '#3b82f6';
    this.minY = options.minY !== undefined ? options.minY : 0;
    this.maxY = options.maxY !== undefined ? options.maxY : 10;
    this.nominal = options.nominal || 0;
    this.maxPoints = options.maxPoints || 50;
    this.dataPoints = [];

    // Initialize with nominal points
    for (let i = 0; i < this.maxPoints; i++) {
      this.dataPoints.push(this.nominal);
    }

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * (window.devicePixelRatio || 1);
    this.canvas.height = rect.height * (window.devicePixelRatio || 1);
    this.draw();
  }

  addPoint(val) {
    this.dataPoints.push(val);
    if (this.dataPoints.length > this.maxPoints) {
      this.dataPoints.shift();
    }
    this.draw();
  }

  reset(nominalVal) {
    if (nominalVal !== undefined) this.nominal = nominalVal;
    this.dataPoints = [];
    for (let i = 0; i < this.maxPoints; i++) {
      this.dataPoints.push(this.nominal);
    }
    this.draw();
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    const gridRows = 4;
    for (let i = 1; i < gridRows; i++) {
      const y = (h / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Baseline indicator
    const normY = h - ((this.nominal - this.minY) / (this.maxY - this.minY)) * h;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, normY);
    ctx.lineTo(w, normY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (this.dataPoints.length < 2) return;

    // Draw waveform line
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5 * (window.devicePixelRatio || 1);
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const stepX = w / (this.maxPoints - 1);
    this.dataPoints.forEach((val, idx) => {
      const clamped = Math.max(this.minY, Math.min(this.maxY, val));
      const y = h - ((clamped - this.minY) / (this.maxY - this.minY)) * h;
      const x = idx * stepX;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Area fill gradient
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, this.color + '33');
    grad.addColorStop(1, this.color + '00');
    ctx.fillStyle = grad;
    ctx.fill();

    // Current latest point tag
    const latestVal = this.dataPoints[this.dataPoints.length - 1];
    const latestY = h - ((Math.max(this.minY, Math.min(this.maxY, latestVal)) - this.minY) / (this.maxY - this.minY)) * h;
    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(w - 6, latestY, 4 * (window.devicePixelRatio || 1), 0, Math.PI * 2);
    ctx.fill();
  }
}

const TelemetryChartsManager = {
  accelChart: null,
  forceChart: null,
  tiltChart: null,
  streamInterval: null,
  isAccidentActive: false,

  currentAccel: 0.98,
  currentForce: 0.0,
  currentTilt: 2.0,

  targetAccel: 0.98,
  targetForce: 0.0,
  targetTilt: 2.0,

  init() {
    this.accelChart = new TelemetryChart('chartAccel', {
      label: 'Acceleration',
      unit: 'g',
      color: '#38bdf8',
      minY: 0,
      maxY: 6.0,
      nominal: 0.98
    });

    this.forceChart = new TelemetryChart('chartForce', {
      label: 'Collision Force',
      unit: 'kN',
      color: '#f59e0b',
      minY: 0,
      maxY: 50.0,
      nominal: 0.0
    });

    this.tiltChart = new TelemetryChart('chartTilt', {
      label: 'Tilt Deflection',
      unit: '°',
      color: '#ef4444',
      minY: 0,
      maxY: 25.0,
      nominal: 2.0
    });

    this.startStreaming();
  },

  startStreaming() {
    if (this.streamInterval) clearInterval(this.streamInterval);

    this.streamInterval = setInterval(() => {
      // Small sensor jitter around target
      let jitterA = (Math.random() - 0.5) * 0.04;
      let jitterF = Math.random() * 0.05;
      let jitterT = (Math.random() - 0.5) * 0.1;

      if (this.isAccidentActive) {
        // Smoothly decay peak back towards damaged state
        this.currentAccel += (this.targetAccel - this.currentAccel) * 0.15;
        this.currentForce += (this.targetForce - this.currentForce) * 0.12;
        this.currentTilt += (this.targetTilt - this.currentTilt) * 0.2;
      } else {
        this.currentAccel = 0.98 + jitterA;
        this.currentForce = Math.max(0, 0.0 + jitterF);
        this.currentTilt = 2.0 + jitterT;
      }

      this.accelChart.addPoint(this.currentAccel);
      this.forceChart.addPoint(this.currentForce);
      this.tiltChart.addPoint(this.currentTilt);

      // Update numeric DOM metrics
      this.updateMetricElements(this.currentAccel, this.currentForce, this.currentTilt);
    }, 150);
  },

  updateMetricElements(accel, force, tilt) {
    const elAccel = document.getElementById('metricAccelVal');
    const elForce = document.getElementById('metricForceVal');
    const elTilt = document.getElementById('metricTiltVal');

    if (elAccel) elAccel.textContent = `${accel.toFixed(2)} g`;
    if (elForce) elForce.textContent = `${force.toFixed(1)} kN`;
    if (elTilt) elTilt.textContent = `${tilt.toFixed(1)}°`;
  },

  triggerAccidentSpike(peakAccel = 4.80, peakForce = 38.5, peakTilt = 18.2, mode = 'nexora') {
    this.isAccidentActive = true;
    this.currentAccel = peakAccel;
    this.currentForce = peakForce;
    this.currentTilt = peakTilt;

    if (mode === 'traditional') {
      // Extreme dead-stop shockwave
      this.targetAccel = 1.0;
      this.targetForce = 0.0;
      this.targetTilt = 2.0;

      ['metricCardAccel', 'metricCardForce'].forEach(id => {
        const card = document.getElementById(id);
        if (card) card.classList.add('alert-state', 'spiked');
      });

      const elSeverity = document.getElementById('metricSeverityVal');
      const elBarrierStatus = document.getElementById('metricStatusVal');
      if (elSeverity) {
        elSeverity.textContent = 'LETHAL (18.4g TRAUMA)';
        elSeverity.className = 'value badge-red';
      }
      if (elBarrierStatus) {
        elBarrierStatus.textContent = 'UNMONITORED (NO SENSORS)';
        elBarrierStatus.className = 'value badge-red';
      }
    } else {
      // NEXORA rotational absorption & deflection
      this.targetAccel = 1.15;
      this.targetForce = 1.2;
      this.targetTilt = 18.0;

      ['metricCardAccel', 'metricCardForce', 'metricCardTilt'].forEach(id => {
        const card = document.getElementById(id);
        if (card) card.classList.add('alert-state', 'spiked');
      });

      const elSeverity = document.getElementById('metricSeverityVal');
      const elBarrierStatus = document.getElementById('metricStatusVal');
      if (elSeverity) {
        elSeverity.textContent = 'HIGH (ABSORBED - 73% LESS)';
        elSeverity.className = 'value badge-green';
      }
      if (elBarrierStatus) {
        elBarrierStatus.textContent = 'DAMAGE DETECTED (DISPATCHED)';
        elBarrierStatus.className = 'value badge-yellow';
      }
    }
  },

  reset() {
    this.isAccidentActive = false;
    this.currentAccel = 0.98;
    this.currentForce = 0.0;
    this.currentTilt = 2.0;
    this.targetAccel = 0.98;
    this.targetForce = 0.0;
    this.targetTilt = 2.0;

    if (this.accelChart) this.accelChart.reset(0.98);
    if (this.forceChart) this.forceChart.reset(0.0);
    if (this.tiltChart) this.tiltChart.reset(2.0);

    ['metricCardAccel', 'metricCardForce', 'metricCardTilt'].forEach(id => {
      const card = document.getElementById(id);
      if (card) {
        card.classList.remove('alert-state', 'spiked');
      }
    });

    const elSeverity = document.getElementById('metricSeverityVal');
    const elBarrierStatus = document.getElementById('metricStatusVal');
    if (elSeverity) {
      elSeverity.textContent = 'NORMAL';
      elSeverity.className = 'value badge-green';
    }
    if (elBarrierStatus) {
      elBarrierStatus.textContent = 'HEALTHY';
      elBarrierStatus.className = 'value badge-green';
    }

    this.updateMetricElements(0.98, 0.0, 2.0);
  }
};

window.TelemetryChartsManager = TelemetryChartsManager;
