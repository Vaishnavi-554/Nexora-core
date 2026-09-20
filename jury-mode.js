/**
 * NEXORA Guided Jury Demo Tour (Optimized for SIH Evaluators)
 * Instant startup, side-by-side crash comparison first, and concise 60s walkthrough.
 */

const JuryDemoMode = {
  isActive: false,
  currentStep: 0,
  timerId: null,

  steps: [
    {
      title: '⚡ Step 1: Live Crash Comparison (Traditional vs Rolling Barrier)',
      targetId: 'simViewport',
      text: 'Simultaneous 82 km/h Crash Benchmark: Traditional Rigid Concrete (Track 1) causes an unmonitored 142.5 kN dead-stop with 18.4g lethal trauma. NEXORA Smart Rolling Barrier (Track 2) converts kinetic impact into rotational energy, dissipating 73% of collision force (38.5 kN) and alerting emergency services in 2.4s.',
      duration: 7500,
      action: () => {
        if (window.SimulationEngine) {
          window.SimulationEngine.setSimulationMode('dual', false);
          window.SimulationEngine.runSimulation();
        }
      }
    },
    {
      title: 'Step 2: Safety Benchmark & Effectiveness Scoreboard',
      targetId: 'simComparisonScoreboard',
      text: 'Measurable SIH Effectiveness: 73% impact force reduction (38.5 kN vs 142.5 kN), 74% lower deceleration trauma (4.8g vs 18.4g), zero remote blindspots, and automated multi-agency dispatch in 2.4 seconds vs 35+ min passerby delay.',
      duration: 6000
    },
    {
      title: 'Step 3: Tri-Sensor Edge Shockwave Telemetry',
      targetId: 'sensorDashboardSection',
      text: 'Millisecond Crash Detection: Accelerometer (4.8g), Load Cell (38.5 kN), and Tilt Sensor (18.2°) stream real-time waveforms. Edge microcontrollers validate genuine impacts and reject minor road vibration in under 50ms.',
      duration: 5500
    },
    {
      title: 'Step 4: Sub-GHz LoRa Highway Gateway & GIS Map',
      targetId: 'mapSection',
      text: 'Sub-GHz 868MHz Telemetry & GPS Auto-Lock: Barrier RB-023 location (KM 126.4) is locked on the GIS highway map, transmitting over 10km remote zones without cellular network dependence.',
      duration: 5500
    },
    {
      title: 'Step 5: Autonomous Multi-Agency Dispatch (2.4s)',
      targetId: 'alertSectionAnchor',
      text: 'Golden Hour Protocol Activated: Automated triage packets pushed to Highway Police Post #4 (ETA 4m), Apex Trauma Hospital (ETA 8m), and EMS Ambulance 108 (ETA 5m) with exact turn-by-turn route vectors.',
      duration: 6000
    },
    {
      title: 'Step 6: Central Command Operations & State Network',
      targetId: 'commandCenterSection',
      text: 'Statewide Highway Operations Console: Logs real-time incident audit trails, tracks emergency unit ETAs, and monitors preventive maintenance across all connected barrier nodes.',
      duration: 5500
    },
    {
      title: 'Summary: Why NEXORA Wins SIH',
      targetId: 'heroSection',
      text: '“One connected barrier can become the first point of accident detection.”\n\nSMARTER BARRIERS • FASTER RESPONSE • SAFER HIGHWAYS.',
      duration: 5000
    }
  ],

  init() {
    const btnJuryNav = document.getElementById('btnLaunchJuryMode');
    const btnJuryHero = document.getElementById('btnHeroJuryDemo');
    const btnClose = document.getElementById('btnJuryTourClose');
    const btnNext = document.getElementById('btnJuryTourNext');

    if (btnJuryNav) btnJuryNav.addEventListener('click', () => this.startTour());
    if (btnJuryHero) btnJuryHero.addEventListener('click', () => this.startTour());
    if (btnClose) btnClose.addEventListener('click', () => this.stopTour());
    if (btnNext) btnNext.addEventListener('click', () => this.nextStep());
  },

  startTour() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.isActive = true;
    this.currentStep = 0;

    const overlay = document.getElementById('juryTourOverlay');
    if (overlay) overlay.classList.add('active');

    // 1. Immediately ensure dual comparison mode & clean reset
    if (window.SimulationEngine) {
      window.SimulationEngine.setSimulationMode('dual', false);
      window.SimulationEngine.resetSimulation();
    }

    // 2. Start tour immediately without long initialization
    this.renderCurrentStep();
  },

  renderCurrentStep() {
    if (this.currentStep >= this.steps.length) {
      this.finishTour();
      return;
    }

    const step = this.steps[this.currentStep];
    const elTitle = document.getElementById('juryTourTitle');
    const elText = document.getElementById('juryTourText');
    const elProgress = document.getElementById('juryTourProgressBar');
    const btnNext = document.getElementById('btnJuryTourNext');

    if (elTitle) elTitle.textContent = step.title;
    if (elText) elText.textContent = step.text;

    const progressPct = ((this.currentStep + 1) / this.steps.length) * 100;
    if (elProgress) elProgress.style.width = `${progressPct}%`;

    if (btnNext) {
      btnNext.textContent = (this.currentStep === this.steps.length - 1) ? 'Finish Tour' : 'Next Step →';
    }

    // Instant smooth scroll to target section with sticky navbar offset
    const target = document.getElementById(step.targetId);
    if (target) {
      if (step.targetId === 'simViewport') {
        const navHeight = 72;
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        // Position viewport and its top controls cleanly in view below the sticky navbar
        const targetY = scrollTop + rect.top - navHeight - 65;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Execute step action almost instantly (150ms after scroll initiates)
    if (step.action) {
      setTimeout(() => {
        if (this.isActive) step.action();
      }, 150);
    }

    // Schedule auto-advance if user doesn't click next
    if (this.timerId) clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      this.nextStep();
    }, step.duration);
  },

  nextStep() {
    if (this.timerId) clearTimeout(this.timerId);
    this.currentStep++;
    this.renderCurrentStep();
  },

  stopTour() {
    if (this.timerId) clearTimeout(this.timerId);
    this.isActive = false;
    const overlay = document.getElementById('juryTourOverlay');
    if (overlay) overlay.classList.remove('active');
  },

  finishTour() {
    this.stopTour();
    const hero = document.getElementById('heroSection');
    if (hero) hero.scrollIntoView({ behavior: 'smooth' });
  }
};

window.JuryDemoMode = JuryDemoMode;
