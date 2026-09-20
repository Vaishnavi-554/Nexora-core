/**
 * NEXORA Live Rolling Barrier Collision Simulation Engine
 * Supports:
 * 1. NEXORA Smart Rolling Barrier (Our Solution - Rotational Cushioning & Auto Dispatch)
 * 2. Traditional Rigid Divider (Concrete Wall - Fatal Dead Stop & No Sensors)
 * 3. Side-by-Side Dual Comparison Mode (Simultaneous Crash Physics Benchmark)
 */

const SimulationEngine = {
  isRunning: false,
  isAccidentSimulated: false,
  mode: 'dual', // 'dual' | 'nexora' | 'traditional'
  audioCtx: null,

  playAudioTone(type) {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'impact') {
        // Cushioned rolling barrier thump + friction
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.3);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'heavy_crash') {
        // Harsh, violent concrete impact
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.5);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'chirp') {
        // High-pitch LoRa telemetry packet beep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'alert') {
        // Multi-agency siren chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659, now);
        osc.frequency.setValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  },

  init() {
    const btnSimulate = document.getElementById('btnSimulateAccident');
    const btnReset = document.getElementById('btnResetSimulation');

    if (btnSimulate) {
      btnSimulate.addEventListener('click', () => this.runSimulation());
    }
    if (btnReset) {
      btnReset.addEventListener('click', () => this.resetSimulation());
    }

    // Mode Selector Tab Listeners
    const btnModeNexora = document.getElementById('btnModeNexora');
    const btnModeTrad = document.getElementById('btnModeTraditional');
    const btnModeDual = document.getElementById('btnModeDual');

    if (btnModeNexora) btnModeNexora.addEventListener('click', () => this.setSimulationMode('nexora', true));
    if (btnModeTrad) btnModeTrad.addEventListener('click', () => this.setSimulationMode('traditional', true));
    if (btnModeDual) btnModeDual.addEventListener('click', () => this.setSimulationMode('dual', true));

    // Initialize with dual simultaneous mode by default on page load (without auto-scrolling)
    this.setSimulationMode('dual', false);
  },

  setSimulationMode(newMode, shouldScroll = false) {
    if (this.isRunning) return;
    this.mode = newMode;

    // Update Tab UI
    ['btnModeNexora', 'btnModeTraditional', 'btnModeDual'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.classList.remove('active');
    });

    if (newMode === 'nexora' && document.getElementById('btnModeNexora')) {
      document.getElementById('btnModeNexora').classList.add('active');
    } else if (newMode === 'traditional' && document.getElementById('btnModeTraditional')) {
      document.getElementById('btnModeTraditional').classList.add('active');
    } else if (newMode === 'dual' && document.getElementById('btnModeDual')) {
      document.getElementById('btnModeDual').classList.add('active');
    }

    const viewport = document.getElementById('simViewport');
    const roadSingle = document.getElementById('simRoadSingle');
    const barrierNexora = document.getElementById('simBarrierLineNexora');
    const barrierTrad = document.getElementById('simBarrierLineTrad');
    const vehicleSingle = document.getElementById('simVehicle');
    const dualContainer = document.getElementById('simDualContainer');
    const gateway = document.getElementById('simGatewayTower');
    const scoreboard = document.getElementById('simComparisonScoreboard');
    const btnSimulate = document.getElementById('btnSimulateAccident');

    if (newMode === 'dual') {
      if (viewport) viewport.classList.add('dual-view');
      if (roadSingle) roadSingle.style.display = 'none';
      if (barrierNexora) barrierNexora.style.display = 'none';
      if (barrierTrad) barrierTrad.classList.remove('active');
      if (vehicleSingle) vehicleSingle.style.display = 'none';
      if (dualContainer) dualContainer.classList.add('active');
      if (gateway) gateway.style.display = 'none';
      if (btnSimulate) btnSimulate.innerHTML = '<span>💥 SIMULATE ACCIDENT (RUN BOTH SIMULTANEOUSLY)</span>';
    } else {
      if (viewport) viewport.classList.remove('dual-view');
      if (dualContainer) dualContainer.classList.remove('active');
      if (roadSingle) roadSingle.style.display = 'block';
      if (vehicleSingle) vehicleSingle.style.display = 'flex';
      if (gateway) gateway.style.display = 'flex';

      if (newMode === 'traditional') {
        if (barrierNexora) barrierNexora.style.display = 'none';
        if (barrierTrad) barrierTrad.classList.add('active');
        if (gateway) gateway.style.opacity = '0.25';
        if (btnSimulate) btnSimulate.innerHTML = '<span>💥 SIMULATE CONCRETE COLLISION</span>';
      } else {
        if (barrierNexora) barrierNexora.style.display = 'flex';
        if (barrierTrad) barrierTrad.classList.remove('active');
        if (gateway) gateway.style.opacity = '1';
        if (btnSimulate) btnSimulate.innerHTML = '<span>💥 SIMULATE NEXORA BARRIER COLLISION</span>';
      }
    }

    this.renderStepTrackers();
    this.resetSimulation();
  },

  renderStepTrackers() {
    const stepsContainer = document.getElementById('simStepsContainer');
    if (!stepsContainer) return;

    let stepTitles = [];
    if (this.mode === 'traditional') {
      stepTitles = [
        '01 Approach 82km/h',
        '02 Slams Concrete',
        '03 0km/h Dead Stop',
        '04 142.5kN Crush',
        '05 18.4g Trauma',
        '06 Deformed Body',
        '07 No Sensor Alert',
        '08 Remote Blindspot',
        '09 0 Dispatches',
        '10 Passerby Delay',
        '11 +35min Ambulance',
        '12 Golden Hour Lost'
      ];
    } else if (this.mode === 'dual') {
      stepTitles = [
        '01 Dual Launch',
        '02 Simultaneous Hit',
        '03 Concrete Dead Stop',
        '04 Rollers Spin',
        '05 142kN vs 38kN',
        '06 18.4g vs 4.8g',
        '07 Nexora Slows Down',
        '08 LoRa Uplink Sent',
        '09 Cloud Mapping',
        '10 0 Alert vs 3 Alert',
        '11 Auto GPS Lock',
        '12 Life Saved in 2.4s'
      ];
    } else {
      stepTitles = [
        '01 Vehicle Approach',
        '02 Collision Impact',
        '03 Rollers Rotate',
        '04 Accel Spike 4.8g',
        '05 Load Cell 38.5kN',
        '06 Tilt Deflection',
        '07 Sensor Fusion',
        '08 Map GIS Locked',
        '09 LoRa Uplink 10km',
        '10 Cloud Validation',
        '11 Alert Engine 2.4s',
        '12 Emergency Notify'
      ];
    }

    stepsContainer.innerHTML = stepTitles.map((title, i) => `
      <div class="sim-step-dot" id="simStepDot_${i + 1}">
        <span class="num">${String(i + 1).padStart(2, '0')}</span>
        <span class="txt">${title.split(' ').slice(1).join(' ')}</span>
      </div>
    `).join('');

    const label = document.getElementById('currentStepStatusLabel');
    if (label) {
      if (this.mode === 'traditional') label.textContent = 'TRADITIONAL CONCRETE DIVIDER READY — CLICK SIMULATE';
      else if (this.mode === 'dual') label.textContent = 'DUAL SIDE-BY-SIDE BENCHMARK READY — CLICK SIMULATE';
      else label.textContent = 'NEXORA SMART ROLLING BARRIER READY — CLICK SIMULATE';
    }
  },

  setStepActive(stepNum) {
    for (let i = 1; i <= 12; i++) {
      const dot = document.getElementById(`simStepDot_${i}`);
      if (!dot) continue;
      if (i < stepNum) {
        dot.className = 'sim-step-dot completed';
      } else if (i === stepNum) {
        dot.className = 'sim-step-dot active';
      } else {
        dot.className = 'sim-step-dot';
      }
    }
    const label = document.getElementById('currentStepStatusLabel');
    if (label) label.textContent = `STEP ${stepNum} of 12 ACTIVE`;
  },

  async runSimulation() {
    if (this.isRunning) return;

    if (this.mode === 'traditional') {
      await this.runTraditionalSimulation();
    } else if (this.mode === 'dual') {
      await this.runDualSimulation();
    } else {
      await this.runNexoraSimulation();
    }
  },

  // =========================================================================
  // 1. NEXORA SMART ROLLING BARRIER SIMULATION
  // =========================================================================
  async runNexoraSimulation() {
    this.isRunning = true;
    this.isAccidentSimulated = true;

    const vehicle = document.getElementById('simVehicle');
    const speedTag = document.getElementById('simVehicleSpeedTag');
    const burst = document.getElementById('collisionBurst');
    const energyBadge = document.getElementById('energyConversionBadge');
    const cylinders = document.querySelectorAll('.barrier-cylinder:not(.dual-cyl)');
    const targetCylinder = document.getElementById('barrierTarget');
    const viewport = document.getElementById('simViewport');
    const packet = document.getElementById('loraPacketNode');
    const pillBarrier = document.getElementById('simPillBarrier');
    const pillAccident = document.getElementById('simPillAccident');
    const btnSimulate = document.getElementById('btnSimulateAccident');

    if (btnSimulate) {
      btnSimulate.disabled = true;
      btnSimulate.textContent = 'Simulating Nexora Collision...';
    }

    // Measure target cylinder coordinates dynamically
    let hitX = 480;
    let barrierTop = 205;
    if (targetCylinder && viewport) {
      const vpRect = viewport.getBoundingClientRect();
      const cylRect = targetCylinder.getBoundingClientRect();
      hitX = Math.round(cylRect.left - vpRect.left + (cylRect.width / 2));
      barrierTop = Math.round(cylRect.top - vpRect.top);
    }

    const vehicleWidth = 86;
    const vehicleHeight = 40;
    const contactLeft = hitX - vehicleWidth + 4;
    const contactTop = barrierTop - vehicleHeight - 1;

    // Step 1: Approach at 82 km/h
    this.setStepActive(1);
    if (speedTag) {
      speedTag.textContent = '82 km/h';
      speedTag.className = 'sim-vehicle-speed-tag';
    }
    if (vehicle) {
      vehicle.style.transition = 'left 1.05s cubic-bezier(0.25, 1, 0.5, 1), top 1.05s ease-in, transform 1.05s ease-out';
      vehicle.style.left = `${contactLeft}px`;
      vehicle.style.top = `${contactTop}px`;
      vehicle.style.transform = 'rotate(11deg)';
    }

    await new Promise(r => setTimeout(r, 1050));

    // Step 2 & 3: Impact & Roller spin
    this.setStepActive(2);
    this.playAudioTone('impact');

    if (burst) {
      burst.style.left = `${hitX}px`;
      burst.style.top = `${barrierTop}px`;
      burst.classList.add('active');
    }

    this.setStepActive(3);
    cylinders.forEach(cyl => cyl.classList.add('rotating'));
    if (energyBadge) {
      energyBadge.innerHTML = '<span>🔄 IMPACT ENERGY ➔ ROTATIONAL ENERGY (CYLINDERS ROTATING)</span>';
      energyBadge.classList.add('active');
    }

    // Deceleration Stage 1 (82 -> 44 km/h)
    if (speedTag) {
      speedTag.textContent = '44 km/h ↓ (Absorbing)';
      speedTag.className = 'sim-vehicle-speed-tag slowing';
    }

    const deflectLeft = hitX + 18;
    const deflectTop = barrierTop - vehicleHeight - 3;
    if (vehicle) {
      vehicle.style.transition = 'left 0.75s cubic-bezier(0.12, 0.8, 0.28, 1), top 0.75s ease-out, transform 0.75s ease-out';
      vehicle.style.left = `${deflectLeft}px`;
      vehicle.style.top = `${deflectTop}px`;
      vehicle.style.transform = 'rotate(3deg)';
    }

    await new Promise(r => setTimeout(r, 450));

    // Step 4, 5, 6: Sensors spike & Deceleration Stage 2 (44 -> 16 km/h)
    this.setStepActive(4);
    if (window.TelemetryChartsManager) {
      window.TelemetryChartsManager.triggerAccidentSpike(4.80, 38.5, 18.2, 'nexora');
    }
    this.setStepActive(5);
    await new Promise(r => setTimeout(r, 200));
    this.setStepActive(6);

    if (speedTag) speedTag.textContent = '16 km/h ↓ (Slowing)';

    const restLeft = hitX + 85;
    const restTop = barrierTop - vehicleHeight - 4;
    if (vehicle) {
      vehicle.style.transition = 'left 0.85s cubic-bezier(0.15, 0.9, 0.35, 1), top 0.85s ease-out, transform 0.85s ease-out';
      vehicle.style.left = `${restLeft}px`;
      vehicle.style.top = `${restTop}px`;
      vehicle.style.transform = 'rotate(0deg)';
    }

    if (pillBarrier) {
      pillBarrier.textContent = 'IMPACT DETECTED (ABSORBED)';
      pillBarrier.className = 'pill impact';
    }
    if (pillAccident) {
      pillAccident.textContent = '1 ACTIVE';
      pillAccident.className = 'pill impact';
    }

    // Safe stop
    setTimeout(() => {
      if (speedTag) {
        speedTag.textContent = '0 km/h (CONTROLLED STOP)';
        speedTag.className = 'sim-vehicle-speed-tag stopped';
      }
    }, 700);

    // Step 7: Sensor Fusion
    this.setStepActive(7);
    this.playAudioTone('chirp');

    const apiResult = await window.API.simulateAccident({
      barrier_id: 'RB-023',
      acceleration: 4.80,
      force: 38.50,
      tilt: 18.20,
      speed_kmh: 82
    });

    await new Promise(r => setTimeout(r, 300));

    // Step 8: GIS map lock
    this.setStepActive(8);
    if (window.HighwayMapManager) {
      window.HighwayMapManager.showAccidentMarker({
        impact_force: '38.5',
        timeFormatted: new Date().toLocaleTimeString('en-US', { hour12: false })
      });
    }

    // Step 9: LoRa packet flight
    this.setStepActive(9);
    if (packet) {
      packet.style.display = 'block';
      packet.style.left = `${hitX}px`;
      packet.style.top = `${barrierTop}px`;
      packet.style.transition = 'left 0.7s ease-in-out, top 0.7s ease-in-out';
      await new Promise(r => setTimeout(r, 50));
      packet.style.left = 'calc(100% - 60px)';
      packet.style.top = '32px';
    }

    await new Promise(r => setTimeout(r, 700));

    // Step 10: Cloud validation
    this.setStepActive(10);
    this.playAudioTone('chirp');
    if (packet) packet.style.display = 'none';

    await new Promise(r => setTimeout(r, 400));

    // Step 11 & 12: Emergency alerts in 2.4s
    this.setStepActive(11);
    this.playAudioTone('alert');
    this.setStepActive(12);

    this.showEmergencyAlertPanel(apiResult.simulation);
    this.updateCommandCenterUI(apiResult.simulation);

    setTimeout(() => {
      cylinders.forEach(cyl => cyl.classList.remove('rotating'));
    }, 2500);

    this.isRunning = false;
    if (btnSimulate) {
      btnSimulate.disabled = false;
      btnSimulate.textContent = 'Accident Simulated (Active)';
    }
  },

  // =========================================================================
  // 2. TRADITIONAL RIGID CONCRETE DIVIDER SIMULATION (FATAL DEAD STOP)
  // =========================================================================
  async runTraditionalSimulation() {
    this.isRunning = true;
    this.isAccidentSimulated = true;

    const vehicle = document.getElementById('simVehicle');
    const speedTag = document.getElementById('simVehicleSpeedTag');
    const burst = document.getElementById('collisionBurst');
    const energyBadge = document.getElementById('energyConversionBadge');
    const crackMark = document.getElementById('concreteCrackMark');
    const pillBarrier = document.getElementById('simPillBarrier');
    const pillAccident = document.getElementById('simPillAccident');
    const btnSimulate = document.getElementById('btnSimulateAccident');

    if (btnSimulate) {
      btnSimulate.disabled = true;
      btnSimulate.textContent = 'Simulating Concrete Crash...';
    }

    const hitX = 470;
    const barrierTop = 205;
    const vehicleWidth = 86;
    const vehicleHeight = 40;

    // Step 1: Vehicle approaches at high speed (82 km/h)
    this.setStepActive(1);
    if (speedTag) {
      speedTag.textContent = '82 km/h';
      speedTag.className = 'sim-vehicle-speed-tag';
    }
    if (vehicle) {
      vehicle.style.transition = 'left 1.05s cubic-bezier(0.25, 1, 0.5, 1), top 1.05s ease-in, transform 1.05s ease-out';
      vehicle.style.left = `${hitX - vehicleWidth + 10}px`;
      vehicle.style.top = `${barrierTop - vehicleHeight - 1}px`;
      vehicle.style.transform = 'rotate(18deg)';
    }

    await new Promise(r => setTimeout(r, 1050));

    // Step 2 & 3: DEAD-STOP CRASH! Vehicle slams into concrete
    this.setStepActive(2);
    this.playAudioTone('heavy_crash');

    if (burst) {
      burst.style.left = `${hitX}px`;
      burst.style.top = `${barrierTop}px`;
      burst.classList.add('active');
    }
    if (crackMark) crackMark.classList.add('active');

    // Instant catastrophic stop: 82 km/h -> 0 km/h in 0.05 seconds!
    this.setStepActive(3);
    if (speedTag) {
      speedTag.textContent = '0 km/h (FATAL DEAD STOP)';
      speedTag.className = 'sim-vehicle-speed-tag fatal';
    }

    // Vehicle crumples violently
    if (vehicle) {
      vehicle.classList.add('crumpled');
      vehicle.style.transition = 'none';
      vehicle.style.transform = 'rotate(26deg)';
    }

    if (energyBadge) {
      energyBadge.innerHTML = '<span>⚠️ 100% IMPACT FORCE TRANSMITTED TO OCCUPANTS (NO DISSIPATION)</span>';
      energyBadge.classList.add('active');
    }

    // Step 4 & 5: Extreme shockwave (142.5 kN / 18.4 g trauma)
    this.setStepActive(4);
    if (window.TelemetryChartsManager) {
      window.TelemetryChartsManager.triggerAccidentSpike(18.4, 142.5, 0.0, 'traditional');
    }
    this.setStepActive(5);
    await new Promise(r => setTimeout(r, 400));

    // Step 6, 7, 8: NO SENSORS - Remote Highway Blindspot!
    this.setStepActive(6);
    this.setStepActive(7);
    this.setStepActive(8);

    if (pillBarrier) {
      pillBarrier.textContent = 'CRITICAL CRASH (UNMONITORED)';
      pillBarrier.className = 'pill impact';
    }
    if (pillAccident) {
      pillAccident.textContent = '1 UNNOTICED';
      pillAccident.className = 'pill impact';
    }

    // Step 9-12: Passerby Delay & Golden Hour Lost
    for (let s = 9; s <= 12; s++) {
      await new Promise(r => setTimeout(r, 300));
      this.setStepActive(s);
    }

    // Show warning banner
    const banner = document.getElementById('emergencyAlertBanner');
    if (banner) {
      banner.classList.add('active');
      const timeStr = new Date().toLocaleTimeString();
      banner.innerHTML = `
        <div class="alert-banner-header" style="border-color: rgba(239, 68, 68, 0.4);">
          <div class="alert-headline-box">
            <span style="font-size: 28px;">⚠️</span>
            <div>
              <h3 style="color:#fecaca;">TRADITIONAL RIGID BARRIER FAILURE — NO SENSOR DETECTION</h3>
              <p style="color: #fca5a5; font-size: 13px; margin: 0;">
                High-speed collision (142.5 kN • 18.4g) against rigid divider at KM 126.4. Infrastructure has <strong>NO edge sensors</strong> and <strong>NO IoT gateway</strong>.
              </p>
            </div>
          </div>
          <div class="alert-latency-badge" style="background: rgba(127, 29, 29, 0.8); color: #fca5a5; border-color: #ef4444;">
            ⏳ Response Delay: 35+ Minutes (Passerby Phone Call)
          </div>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 14px; border-radius: 6px; font-size: 13px; line-height: 1.6; color: #e2e8f0;">
          <strong>Consequences of Rigid Dividers:</strong><br>
          • Severe kinetic shockwave transmitted directly into cabin: High fatality/trauma probability.<br>
          • Golden Hour response window severely compromised due to absence of automated GIS crash alerts.<br>
          • <em>Contrast with NEXORA: absorbs 73% of collision force and notifies Police, Hospital, and EMS in 2.4 seconds!</em>
        </div>
      `;
    }

    this.isRunning = false;
    if (btnSimulate) {
      btnSimulate.disabled = false;
      btnSimulate.textContent = 'Crash Simulated (Rigid Failure)';
    }
  },

  // =========================================================================
  // 3. SIDE-BY-SIDE DUAL SYNCHRONIZED COMPARISON SIMULATION
  // =========================================================================
  async runDualSimulation() {
    this.isRunning = true;
    this.isAccidentSimulated = true;

    const vTrad = document.getElementById('simVehicleDualTrad');
    const vNex = document.getElementById('simVehicleDualNex');
    const speedTrad = document.getElementById('simSpeedTagDualTrad');
    const speedNex = document.getElementById('simSpeedTagDualNex');
    const resTrad = document.getElementById('dualResultBadgeTrad');
    const resNex = document.getElementById('dualResultBadgeNex');
    const burstTrad = document.getElementById('dualBurstTrad');
    const burstNex = document.getElementById('dualBurstNex');
    const crackMark = document.getElementById('dualCrackMark');
    const dualEnergyBadge = document.getElementById('dualEnergyBadge');
    const dualPacket = document.getElementById('dualLoraPacket');
    const cylinders = document.querySelectorAll('.barrier-cylinder.dual-cyl');
    const pillBarrier = document.getElementById('simPillBarrier');
    const pillAccident = document.getElementById('simPillAccident');
    const btnSimulate = document.getElementById('btnSimulateAccident');

    if (btnSimulate) {
      btnSimulate.disabled = true;
      btnSimulate.innerHTML = '<span>💥 Simulating Both Crashes Simultaneously...</span>';
    }

    // Step 1: Dual Simultaneous Approach at 82 km/h
    this.setStepActive(1);
    if (speedTrad) {
      speedTrad.textContent = '82 km/h';
      speedTrad.className = 'sim-vehicle-speed-tag';
    }
    if (speedNex) {
      speedNex.textContent = '82 km/h';
      speedNex.className = 'sim-vehicle-speed-tag';
    }
    if (resTrad) {
      resTrad.textContent = 'APPROACHING AT 82 KM/H';
      resTrad.className = 'sim-track-result-badge';
    }
    if (resNex) {
      resNex.textContent = 'APPROACHING AT 82 KM/H';
      resNex.className = 'sim-track-result-badge';
    }

    // Measure target cylinder coordinate dynamically relative to dualTrackNex
    const targetDualCyl = document.getElementById('barrierTargetDual') || document.querySelector('#dualTrackNex .barrier-cylinder.target');
    const trackNex = document.getElementById('dualTrackNex');
    let hitX = 220;
    let barrierTop = 215;
    if (targetDualCyl && trackNex) {
      const trackRect = trackNex.getBoundingClientRect();
      const cylRect = targetDualCyl.getBoundingClientRect();
      hitX = Math.round(cylRect.left - trackRect.left + (cylRect.width / 2));
      barrierTop = Math.round(cylRect.top - trackRect.top);
    }

    const vWidth = 80;
    const vHeight = 38;
    const contactLeft = hitX - 58;
    const contactTop = barrierTop - vHeight;

    // Both cars drive forward simultaneously at identical velocity (1.05s)
    if (vTrad) {
      vTrad.style.transition = 'left 1.05s cubic-bezier(0.25, 1, 0.5, 1), top 1.05s ease-in, transform 1.05s ease-out';
      vTrad.style.left = `${contactLeft}px`;
      vTrad.style.top = `${contactTop}px`;
      vTrad.style.transform = 'rotate(14deg)';
    }
    if (vNex) {
      vNex.style.transition = 'left 1.05s cubic-bezier(0.25, 1, 0.5, 1), top 1.05s ease-in, transform 1.05s ease-out';
      vNex.style.left = `${contactLeft}px`;
      vNex.style.top = `${contactTop}px`;
      vNex.style.transform = 'rotate(14deg)';
    }

    await new Promise(r => setTimeout(r, 1050));

    // SIMULTANEOUS COLLISION MOMENT (t = 1.05s)!
    this.setStepActive(2);
    this.playAudioTone('heavy_crash');

    // 1. TRACK 1 (TRADITIONAL RIGID CONCRETE): Fatal sudden dead stop, violent crumple, 142.5 kN / 18.4g trauma, NO SENSORS!
    if (burstTrad) {
      burstTrad.style.left = `${hitX - 10}px`;
      burstTrad.style.top = `${barrierTop}px`;
      burstTrad.classList.add('active');
    }
    if (crackMark) {
      crackMark.style.left = `${hitX - 18}px`;
      crackMark.style.top = `${barrierTop}px`;
      crackMark.classList.add('active');
    }
    if (vTrad) {
      vTrad.classList.add('crumpled');
      vTrad.style.transition = 'none';
      vTrad.style.transform = 'rotate(22deg)';
    }
    if (speedTrad) {
      speedTrad.textContent = '0 km/h (FATAL STOP)';
      speedTrad.className = 'sim-vehicle-speed-tag fatal';
    }
    if (resTrad) {
      resTrad.innerHTML = '❌ <strong>DEAD STOP: 142.5 kN • 18.4g TRAUMA • NO SENSORS</strong>';
      resTrad.className = 'sim-track-result-badge danger';
    }

    // 2. TRACK 2 (NEXORA SMART ROLLING BARRIER): Absorbs kinetic energy, cylinders rotate vigorously, smooth deflection!
    if (burstNex) {
      burstNex.style.left = `${hitX - 10}px`;
      burstNex.style.top = `${barrierTop}px`;
      burstNex.classList.add('active');
    }
    cylinders.forEach(cyl => cyl.classList.add('rotating'));
    if (dualEnergyBadge) dualEnergyBadge.classList.add('active');
    if (speedNex) {
      speedNex.textContent = '44 km/h ↓ (Absorbing)';
      speedNex.className = 'sim-vehicle-speed-tag slowing';
    }
    if (resNex) {
      resNex.innerHTML = '✓ <strong>ABSORBED: 38.5 kN • 73% LESS FORCE • DISPATCH IN 2.4s</strong>';
      resNex.className = 'sim-track-result-badge success';
    }

    // Vehicle 2 rides smoothly along the outer roller contour (zero barrier penetration)
    if (vNex) {
      vNex.style.transition = 'left 0.8s cubic-bezier(0.12, 0.8, 0.28, 1), top 0.8s ease-out, transform 0.8s ease-out';
      vNex.style.left = `${hitX + 32}px`;
      vNex.style.top = `${contactTop - 2}px`;
      vNex.style.transform = 'rotate(4deg)';
    }

    // Step 3 & 4: Energy dissipation in action
    this.setStepActive(3);
    await new Promise(r => setTimeout(r, 450));
    this.setStepActive(4);

    // Nexora vehicle decelerates further to 16 km/h
    if (speedNex) speedNex.textContent = '16 km/h ↓ (Slowing)';
    if (vNex) {
      vNex.style.transition = 'left 0.85s cubic-bezier(0.15, 0.9, 0.35, 1), top 0.85s ease-out, transform 0.85s ease-out';
      vNex.style.left = `${hitX + 92}px`;
      vNex.style.top = `${contactTop - 3}px`;
      vNex.style.transform = 'rotate(0deg)';
    }

    // Step 5 & 6: Trigger live comparative telemetry charts spike
    this.setStepActive(5);
    if (window.TelemetryChartsManager) {
      window.TelemetryChartsManager.triggerAccidentSpike(4.8, 38.5, 18.2, 'nexora');
    }
    this.setStepActive(6);

    // Controlled safe stop for Nexora vehicle
    setTimeout(() => {
      if (speedNex) {
        speedNex.textContent = '0 km/h (CONTROLLED STOP)';
        speedNex.className = 'sim-vehicle-speed-tag stopped';
      }
    }, 700);

    // Step 7: Nexora Autonomous Sensor Fusion (LoRa edge node processes crash event)
    this.setStepActive(7);
    this.playAudioTone('chirp');

    // Call backend API to record event in database and get real dispatch package
    const apiResult = await window.API.simulateAccident({
      barrier_id: 'RB-023',
      acceleration: 4.80,
      force: 38.50,
      tilt: 18.20,
      speed_kmh: 82
    });

    await new Promise(r => setTimeout(r, 300));

    // Step 8: GIS Map GPS Auto-Lock
    this.setStepActive(8);
    if (window.HighwayMapManager) {
      window.HighwayMapManager.showAccidentMarker({
        impact_force: '38.5',
        timeFormatted: new Date().toLocaleTimeString('en-US', { hour12: false })
      });
    }

    // Step 9: 10km LoRa Packet Uplink Flight to Gateway 03
    this.setStepActive(9);
    if (dualPacket) {
      dualPacket.style.display = 'block';
      dualPacket.style.left = `${hitX}px`;
      dualPacket.style.top = `${barrierTop}px`;
      dualPacket.style.transition = 'left 0.7s ease-in-out, top 0.7s ease-in-out';
      await new Promise(r => setTimeout(r, 50));
      dualPacket.style.left = 'calc(100% - 38px)';
      dualPacket.style.top = '54px';
    }

    await new Promise(r => setTimeout(r, 700));

    // Step 10: Cloud validation & Multi-Agency Dispatch Trigger
    this.setStepActive(10);
    this.playAudioTone('chirp');
    if (dualPacket) dualPacket.style.display = 'none';

    await new Promise(r => setTimeout(r, 300));

    // Step 11 & 12: Emergency Alerts Dispatched in 2.4s!
    this.setStepActive(11);
    this.playAudioTone('alert');
    this.setStepActive(12);

    if (pillBarrier) {
      pillBarrier.textContent = 'RB-023 DISSIPATED';
      pillBarrier.className = 'pill impact';
    }
    if (pillAccident) {
      pillAccident.textContent = '1 LOGGED';
      pillAccident.className = 'pill impact';
    }

    // Update Command Center UI Table & KPIs
    this.updateCommandCenterUI(apiResult ? apiResult.simulation : { accident: { timeFormatted: new Date().toLocaleTimeString() } });

    // Show Comparison Emergency Alert Banner with side-by-side benchmark
    const banner = document.getElementById('emergencyAlertBanner');
    if (banner) {
      const timeStr = (apiResult && apiResult.simulation && apiResult.simulation.accident && apiResult.simulation.accident.timeFormatted) 
        ? apiResult.simulation.accident.timeFormatted 
        : new Date().toLocaleTimeString();

      banner.classList.add('active');
      banner.innerHTML = `
        <div class="alert-banner-header">
          <div class="alert-headline-box">
            <span style="font-size: 28px;">⚖️</span>
            <div>
              <h3>SIMULTANEOUS CRASH COMPARISON: NEXORA REDUCES IMPACT FORCE BY 73%</h3>
              <p style="color: #fca5a5; font-size: 13px; margin: 0;">
                Barrier ID: <strong>RB-023</strong> | Location: <strong>Highway KM 126.4 (Zone 03)</strong> | Severity: <strong>HIGH (ABSORBED)</strong> | Time: <span>${timeStr}</span>
              </p>
              <p style="color: #cbd5e1; font-size: 12px; margin: 4px 0 0 0;">
                Traditional Divider: <strong>142.5 kN crush force</strong>, 18.4g lethal trauma, 0 sensors, <strong>35+ min blindspot delay</strong>.<br>
                NEXORA Solution: <strong>38.5 kN cushioned force</strong>, 4.8g survivable, <strong>2.4s multi-agency dispatch</strong>.
              </p>
            </div>
          </div>
          <div class="alert-latency-badge">
            ⚡ 2.4s Auto Alert vs 35m Blindspot Delay
          </div>
        </div>
        <div class="emergency-dispatch-grid">
          <div class="dispatch-card">
            <div class="dispatch-card-header">
              <h5>🚓 POLICE ALERT</h5>
              <span class="dispatch-status-pill">✓ SENT</span>
            </div>
            <p class="agency-name">Highway Patrol Post #4 (KM 121)</p>
            <p>✓ GIS Location &amp; Crash Vector Shared</p>
            <p>✓ Fast Lane Traffic Diversion Requested</p>
            <p style="color: #93c5fd; font-weight: bold; margin-top: 6px;">ETA: 4 Minutes</p>
          </div>
          <div class="dispatch-card">
            <div class="dispatch-card-header">
              <h5>🏥 HOSPITAL ALERT</h5>
              <span class="dispatch-status-pill">✓ SENT</span>
            </div>
            <p class="agency-name">Apex Trauma Center &amp; Hospital</p>
            <p>✓ Accident Severity Level HIGH Transmitted</p>
            <p>✓ Emergency Trauma Triage Room Alerted</p>
            <p style="color: #93c5fd; font-weight: bold; margin-top: 6px;">ETA: 8 Minutes</p>
          </div>
          <div class="dispatch-card">
            <div class="dispatch-card-header">
              <h5>🚑 AMBULANCE ALERT</h5>
              <span class="dispatch-status-pill">✓ DISPATCHED</span>
            </div>
            <p class="agency-name">EMS Unit 108-Alpha (Station 3)</p>
            <p>✓ Turn-by-Turn GPS Navigation Vector Pushed</p>
            <p>✓ Advanced Life Support Paramedic En Route</p>
            <p style="color: #93c5fd; font-weight: bold; margin-top: 6px;">ETA: 5 Minutes</p>
          </div>
        </div>
      `;
    }

    setTimeout(() => {
      cylinders.forEach(cyl => cyl.classList.remove('rotating'));
    }, 2500);

    this.isRunning = false;
    if (btnSimulate) {
      btnSimulate.disabled = false;
      btnSimulate.innerHTML = '<span>💥 SIMULATE ACCIDENT (RUN BOTH SIMULTANEOUSLY)</span>';
    }
  },

  // =========================================================================
  // RESET SIMULATION (CLEANS UP ALL MODES)
  // =========================================================================
  resetSimulation() {
    this.isRunning = false;
    this.isAccidentSimulated = false;

    // Reset Single Vehicle
    const vehicle = document.getElementById('simVehicle');
    const speedTag = document.getElementById('simVehicleSpeedTag');
    if (vehicle) {
      vehicle.classList.remove('crumpled');
      vehicle.style.transition = 'none';
      vehicle.style.left = '-130px';
      vehicle.style.top = '80px';
      vehicle.style.transform = 'rotate(0deg)';
    }
    if (speedTag) {
      speedTag.textContent = '82 km/h';
      speedTag.className = 'sim-vehicle-speed-tag';
    }

    // Reset Dual Track Vehicles
    const vTrad = document.getElementById('simVehicleDualTrad');
    const vNex = document.getElementById('simVehicleDualNex');
    const speedTrad = document.getElementById('simSpeedTagDualTrad');
    const speedNex = document.getElementById('simSpeedTagDualNex');
    const resTrad = document.getElementById('dualResultBadgeTrad');
    const resNex = document.getElementById('dualResultBadgeNex');
    const burstTrad = document.getElementById('dualBurstTrad');
    const burstNex = document.getElementById('dualBurstNex');
    const dualCrack = document.getElementById('dualCrackMark');
    const dualEnergyBadge = document.getElementById('dualEnergyBadge');
    const dualPacket = document.getElementById('dualLoraPacket');

    if (vTrad) {
      vTrad.classList.remove('crumpled');
      vTrad.style.transition = 'none';
      vTrad.style.left = '-100px';
      vTrad.style.top = '90px';
      vTrad.style.transform = 'rotate(0deg)';
    }
    if (vNex) {
      vNex.classList.remove('crumpled');
      vNex.style.transition = 'none';
      vNex.style.left = '-100px';
      vNex.style.top = '90px';
      vNex.style.transform = 'rotate(0deg)';
    }
    if (speedTrad) {
      speedTrad.textContent = '82 km/h';
      speedTrad.className = 'sim-vehicle-speed-tag';
    }
    if (speedNex) {
      speedNex.textContent = '82 km/h';
      speedNex.className = 'sim-vehicle-speed-tag';
    }
    if (resTrad) {
      resTrad.textContent = 'WAITING FOR SIMULATION';
      resTrad.className = 'sim-track-result-badge';
    }
    if (resNex) {
      resNex.textContent = 'WAITING FOR SIMULATION';
      resNex.className = 'sim-track-result-badge';
    }
    if (burstTrad) burstTrad.classList.remove('active');
    if (burstNex) burstNex.classList.remove('active');
    if (dualCrack) dualCrack.classList.remove('active');
    if (dualEnergyBadge) dualEnergyBadge.classList.remove('active');
    if (dualPacket) dualPacket.style.display = 'none';

    // Reset Effects
    const burst = document.getElementById('collisionBurst');
    if (burst) burst.classList.remove('active');

    const crackMark = document.getElementById('concreteCrackMark');
    if (crackMark) crackMark.classList.remove('active');

    const energyBadge = document.getElementById('energyConversionBadge');
    if (energyBadge) energyBadge.classList.remove('active');

    const cylinders = document.querySelectorAll('.barrier-cylinder');
    cylinders.forEach(cyl => cyl.classList.remove('rotating'));

    const packet = document.getElementById('loraPacketNode');
    if (packet) packet.style.display = 'none';

    // Reset Status Indicators
    const pillBarrier = document.getElementById('simPillBarrier');
    const pillAccident = document.getElementById('simPillAccident');
    if (pillBarrier) {
      pillBarrier.textContent = 'HEALTHY';
      pillBarrier.className = 'pill normal';
    }
    if (pillAccident) {
      pillAccident.textContent = '0';
      pillAccident.className = 'pill normal';
    }

    // Reset Stepper
    for (let i = 1; i <= 12; i++) {
      const dot = document.getElementById(`simStepDot_${i}`);
      if (dot) dot.className = 'sim-step-dot';
    }
    const label = document.getElementById('currentStepStatusLabel');
    if (label) {
      if (this.mode === 'traditional') label.textContent = 'TRADITIONAL CONCRETE DIVIDER READY — CLICK SIMULATE';
      else if (this.mode === 'dual') label.textContent = 'DUAL SIDE-BY-SIDE BENCHMARK READY — CLICK SIMULATE';
      else label.textContent = 'NEXORA SMART ROLLING BARRIER READY — CLICK SIMULATE';
    }

    // Reset Charts & Map
    if (window.TelemetryChartsManager) window.TelemetryChartsManager.reset();
    if (window.HighwayMapManager) window.HighwayMapManager.reset();

    // Reset Emergency Banner
    const banner = document.getElementById('emergencyAlertBanner');
    if (banner) banner.classList.remove('active');

    // Reset Button
    const btnSimulate = document.getElementById('btnSimulateAccident');
    if (btnSimulate) {
      btnSimulate.disabled = false;
      if (this.mode === 'dual') {
        btnSimulate.innerHTML = '<span>💥 SIMULATE ACCIDENT (RUN BOTH SIMULTANEOUSLY)</span>';
      } else if (this.mode === 'traditional') {
        btnSimulate.innerHTML = '<span>💥 SIMULATE CONCRETE COLLISION</span>';
      } else {
        btnSimulate.innerHTML = '<span>💥 SIMULATE NEXORA BARRIER COLLISION</span>';
      }
    }

    window.API.resetSimulation();
  },

  showEmergencyAlertPanel(simData) {
    const banner = document.getElementById('emergencyAlertBanner');
    if (!banner) return;

    const timeStr = simData.accident?.timeFormatted || new Date().toLocaleTimeString();
    banner.classList.add('active');
    banner.innerHTML = `
      <div class="alert-banner-header">
        <div class="alert-headline-box">
          <span style="font-size: 28px;">🚨</span>
          <div>
            <h3>ACCIDENT DETECTED — EMERGENCY PROTOCOL ACTIVE</h3>
            <p style="color: #fca5a5; font-size: 13px; margin: 0;">
              Barrier ID: <strong>RB-023</strong> | Location: <strong>Highway KM 126.4 (Zone 03)</strong> | Severity: <strong>HIGH</strong> | Time: <span>${timeStr}</span>
            </p>
          </div>
        </div>
        <div class="alert-latency-badge">
          ⚡ Alert generated in 2.4 seconds <span style="font-size: 10px; opacity: 0.8;">(DEMO SIMULATION)</span>
        </div>
      </div>
      <div class="emergency-dispatch-grid">
        <div class="dispatch-card">
          <div class="dispatch-card-header">
            <h5>🚓 POLICE ALERT</h5>
            <span class="dispatch-status-pill">✓ SENT</span>
          </div>
          <p class="agency-name">Highway Patrol Post #4 (KM 121)</p>
          <p>✓ GIS Location & Crash Vector Shared</p>
          <p>✓ Fast Lane Traffic Diversion Requested</p>
          <p style="color: #93c5fd; font-weight: bold; margin-top: 6px;">ETA: 4 Minutes</p>
        </div>
        <div class="dispatch-card">
          <div class="dispatch-card-header">
            <h5>🏥 HOSPITAL ALERT</h5>
            <span class="dispatch-status-pill">✓ SENT</span>
          </div>
          <p class="agency-name">Apex Trauma Center & Hospital</p>
          <p>✓ Accident Severity Level HIGH Transmitted</p>
          <p>✓ Emergency Trauma Triage Room Alerted</p>
          <p style="color: #93c5fd; font-weight: bold; margin-top: 6px;">ETA: 8 Minutes</p>
        </div>
        <div class="dispatch-card">
          <div class="dispatch-card-header">
            <h5>🚑 AMBULANCE ALERT</h5>
            <span class="dispatch-status-pill">✓ DISPATCHED</span>
          </div>
          <p class="agency-name">EMS Unit 108-Alpha (Station 3)</p>
          <p>✓ Turn-by-Turn GPS Navigation Vector Pushed</p>
          <p>✓ Advanced Life Support Paramedic En Route</p>
          <p style="color: #93c5fd; font-weight: bold; margin-top: 6px;">ETA: 5 Minutes</p>
        </div>
      </div>
    `;
  },

  updateCommandCenterUI(simData) {
    const kpiAccidents = document.getElementById('kpiActiveAccidents');
    const kpiDamaged = document.getElementById('kpiDamagedBarriers');
    const kpiAlerts = document.getElementById('kpiAlertsSent');

    if (kpiAccidents) kpiAccidents.textContent = '01';
    if (kpiDamaged) kpiDamaged.textContent = '02';
    if (kpiAlerts) kpiAlerts.textContent = '01';

    const tableBody = document.getElementById('commandCenterTableBody');
    if (tableBody) {
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const newRow = `
        <tr style="background-color: rgba(220, 38, 38, 0.15); animation: pulse-ring 1s 1;">
          <td><span style="color:#ef4444;font-weight:bold;">${timeStr}</span></td>
          <td><strong style="color:#f59e0b;">RB-023</strong></td>
          <td>KM 126.4 (Zone 03)</td>
          <td><span class="badge badge-red">HIGH (38.5 kN)</span></td>
          <td><span style="color:#34d399;font-weight:bold;">✓ POLICE + HOSPITAL + EMS DISPATCHED</span></td>
        </tr>
      `;
      tableBody.innerHTML = newRow + tableBody.innerHTML;
    }
  }
};

window.SimulationEngine = SimulationEngine;
