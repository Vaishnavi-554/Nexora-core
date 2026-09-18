/**
 * NEXORA Guided Jury Demo Tour (60-90 Seconds)
 * Section 16: Automated presentation sequence tailored specifically for SIH evaluators.
 */

const JuryDemoMode = {
  isActive: false,
  currentStep: 0,
  timerId: null,

  steps: [
    {
      title: 'Step 1: Monitored Highway Infrastructure',
      targetId: 'simulationSection',
      text: 'Our AIoT system continuously monitors highway barriers along 10km LoRa zones. Each section houses an Accelerometer, Load Cell, and Tilt sensor operating at nominal baseline levels.',
      duration: 6000
    },
    {
      title: 'Step 2: High-Speed Vehicle Collision',
      targetId: 'simulationSection',
      text: 'Simulating a vehicle collision at 82 km/h against Barrier RB-023. Notice the rolling cylinders rotate immediately to absorb kinetic impact and deflect the vehicle safely.',
      duration: 5000,
      action: () => {
        if (window.SimulationEngine) window.SimulationEngine.runSimulation();
      }
    },
    {
      title: 'Step 3: Multi-Sensor Shockwave Response',
      targetId: 'sensorDashboardSection',
      text: 'Sensors detect the crash in milliseconds. Accelerometer spikes from 0.98g to 4.8g, Load cell measures 38.5 kN collision force, and Tilt sensor flags structural deflection.',
      duration: 6000
    },
    {
      title: 'Step 4: Real-Time GIS Location Mapping',
      targetId: 'mapSection',
      text: 'GPS coordinates and Barrier ID are locked automatically. The 10km LoRa Gateway relays the distress telemetry packet directly to our Cloud backend.',
      duration: 6000
    },
    {
      title: 'Step 5: Automated Emergency Dispatch',
      targetId: 'emergencyAlertsSection',
      text: 'Within 2.4 seconds, triage alerts with precise GIS vectors are transmitted simultaneously to Highway Police, Trauma Hospital, and Ambulance rescue units.',
      duration: 7000
    },
    {
      title: 'Step 6: Unified Command Center Synchronization',
      targetId: 'commandCenterSection',
      text: 'The Command Center immediately registers the incident into the audit log, tracks ambulance dispatch ETA, and monitors downstream barrier network integrity.',
      duration: 7000
    },
    {
      title: 'Summary: Life-Saving Impact',
      targetId: 'heroSection',
      text: '“One connected barrier can become the first point of accident detection.”\n\nSMARTER BARRIERS. FASTER RESPONSE. SAFER HIGHWAYS.',
      duration: 6000
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
    this.isActive = true;
    this.currentStep = 0;

    const overlay = document.getElementById('juryTourOverlay');
    if (overlay) overlay.classList.add('active');

    // Reset simulation cleanly before running tour
    if (window.SimulationEngine) window.SimulationEngine.resetSimulation();

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

    // Smooth scroll to target section
    const target = document.getElementById(step.targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Execute step action (e.g. simulate crash)
    if (step.action) {
      setTimeout(() => step.action(), 500);
    }

    // Schedule auto-advance if user doesn't click
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
