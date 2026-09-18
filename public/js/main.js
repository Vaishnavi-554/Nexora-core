/**
 * NEXORA Application Orchestrator & UI Controller
 * Integrates simulation, telemetry streaming, Leaflet GIS map,
 * barrier health inspections, and interactive modals.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Submodules
  if (window.TelemetryChartsManager) window.TelemetryChartsManager.init();
  if (window.HighwayMapManager) window.HighwayMapManager.init();
  if (window.SimulationEngine) window.SimulationEngine.init();
  if (window.SensorFusionDemo) window.SensorFusionDemo.init();
  if (window.JuryDemoMode) window.JuryDemoMode.init();

  // Load Barrier Network Health Cards
  initBarrierNetworkGrid();

  // Initialize Navigation Scroll Tracking
  initNavigationScrollSpy();

  // Setup Quick Action Jump Buttons
  initQuickActionButtons();

  // Setup Barrier Details Modal
  initModalListeners();
});

/**
 * Section 10: Barrier Health Monitoring Grid
 */
async function initBarrierNetworkGrid() {
  const grid = document.getElementById('barrierNetworkGrid');
  if (!grid) return;

  const barriers = await window.API.getBarriers();

  grid.innerHTML = barriers.map(b => {
    let statusClass = 'healthy';
    let statusLabel = '✓ Healthy';
    let badgeClass = 'badge-green';

    if (b.status === 'MAINTENANCE_REQUIRED') {
      statusClass = 'warning';
      statusLabel = '⚠ Inspection Req';
      badgeClass = 'badge-yellow';
    } else if (b.status === 'DAMAGE_DETECTED') {
      statusClass = 'critical';
      statusLabel = '🚨 Damage Detected';
      badgeClass = 'badge-red';
    }

    return `
      <div class="barrier-node-card ${statusClass}" onclick="openBarrierDetailsModal('${b.barrier_id}')">
        <div class="b-id">${b.barrier_id}</div>
        <div class="b-loc">${b.zone.split(' ')[0]} • KM ${b.location.split(' ')[1]}</div>
        <span class="badge ${badgeClass}">${statusLabel}</span>
      </div>
    `;
  }).join('');
}

/**
 * Opens detailed telemetry and inspection modal for a barrier
 */
async function openBarrierDetailsModal(barrierId) {
  const modal = document.getElementById('barrierDetailsModal');
  if (!modal) return;

  const barrier = (await window.API.getBarriers()).find(b => b.barrier_id === barrierId);
  if (!barrier) return;

  document.getElementById('modalBarrierId').textContent = barrier.barrier_id;
  document.getElementById('modalBarrierLocation').textContent = barrier.location;
  document.getElementById('modalBarrierZone').textContent = barrier.zone;
  document.getElementById('modalBarrierStatus').textContent = barrier.status;
  document.getElementById('modalBarrierGPS').textContent = `${barrier.latitude.toFixed(4)}° N, ${barrier.longitude.toFixed(4)}° E`;
  document.getElementById('modalBarrierGateway').textContent = `${barrier.gateway_id} (Range 10km LoRa)`;
  document.getElementById('modalBarrierBattery').textContent = `${barrier.battery}% (Solar Hybrid)`;
  document.getElementById('modalBarrierInspection').textContent = barrier.last_inspection;
  document.getElementById('modalBarrierHistory').textContent = `${barrier.impact_history} Collision Events Logged`;

  // Sensor readouts
  document.getElementById('modalSensorAccel').textContent = `${barrier.sensors.acceleration} g`;
  document.getElementById('modalSensorForce').textContent = `${barrier.sensors.force} kN`;
  document.getElementById('modalSensorTilt').textContent = `${barrier.sensors.tilt}°`;

  modal.classList.add('active');
}

function initModalListeners() {
  const modal = document.getElementById('barrierDetailsModal');
  const closeBtn = document.getElementById('btnModalClose');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}

/**
 * Quick jump button shortcuts
 */
function initQuickActionButtons() {
  const btnJumpMap = document.getElementById('btnJumpToMap');
  const btnJumpSensors = document.getElementById('btnJumpToSensors');
  const btnJumpAlert = document.getElementById('btnJumpToAlert');

  if (btnJumpMap) {
    btnJumpMap.addEventListener('click', () => {
      document.getElementById('mapSection')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (btnJumpSensors) {
    btnJumpSensors.addEventListener('click', () => {
      document.getElementById('sensorDashboardSection')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (btnJumpAlert) {
    btnJumpAlert.addEventListener('click', () => {
      document.getElementById('emergencyAlertsSection')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/**
 * Navigation Scrollspy
 */
function initNavigationScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

window.openBarrierDetailsModal = openBarrierDetailsModal;
