/**
 * NEXORA AI Multi-Sensor Fusion Engine & False-Alarm Rejection Sandbox
 * Section 15: Demonstrates engineering-grade sensor fusion logic to the jury.
 */

const SensorFusionDemo = {
  init() {
    const sliderAccel = document.getElementById('fusionSliderAccel');
    const sliderForce = document.getElementById('fusionSliderForce');
    const sliderTilt = document.getElementById('fusionSliderTilt');

    if (!sliderAccel || !sliderForce || !sliderTilt) return;

    [sliderAccel, sliderForce, sliderTilt].forEach(slider => {
      slider.addEventListener('input', () => this.recalculate());
    });

    // Preset buttons (Speed bump, Wind gust, Minor graze, High-speed collision)
    const btnPresetBump = document.getElementById('presetSpeedBump');
    const btnPresetWind = document.getElementById('presetWindGust');
    const btnPresetGraze = document.getElementById('presetMinorGraze');
    const btnPresetCrash = document.getElementById('presetMajorCrash');

    if (btnPresetBump) btnPresetBump.addEventListener('click', () => this.applyPreset(1.8, 0.4, 2.2));
    if (btnPresetWind) btnPresetWind.addEventListener('click', () => this.applyPreset(1.05, 0.1, 4.5));
    if (btnPresetGraze) btnPresetGraze.addEventListener('click', () => this.applyPreset(2.6, 12.0, 5.8));
    if (btnPresetCrash) btnPresetCrash.addEventListener('click', () => this.applyPreset(4.8, 38.5, 18.2));

    this.recalculate();
  },

  applyPreset(accel, force, tilt) {
    const sliderAccel = document.getElementById('fusionSliderAccel');
    const sliderForce = document.getElementById('fusionSliderForce');
    const sliderTilt = document.getElementById('fusionSliderTilt');

    if (sliderAccel) sliderAccel.value = accel;
    if (sliderForce) sliderForce.value = force;
    if (sliderTilt) sliderTilt.value = tilt;

    this.recalculate();
  },

  recalculate() {
    const sliderAccel = document.getElementById('fusionSliderAccel');
    const sliderForce = document.getElementById('fusionSliderForce');
    const sliderTilt = document.getElementById('fusionSliderTilt');

    const valAccel = parseFloat(sliderAccel.value);
    const valForce = parseFloat(sliderForce.value);
    const valTilt = parseFloat(sliderTilt.value);

    // Update label displays
    const lblAccel = document.getElementById('fusionValAccel');
    const lblForce = document.getElementById('fusionValForce');
    const lblTilt = document.getElementById('fusionValTilt');

    if (lblAccel) lblAccel.textContent = `${valAccel.toFixed(2)} g`;
    if (lblForce) lblForce.textContent = `${valForce.toFixed(1)} kN`;
    if (lblTilt) lblTilt.textContent = `${valTilt.toFixed(1)}°`;

    // Sensor Fusion Decision Matrix Algorithm
    let score = 0;
    let falseAlarmNotes = [];

    // Accelerometer check (ADXL345)
    if (valAccel >= 4.0) score += 40;
    else if (valAccel >= 2.5) score += 25;
    else if (valAccel >= 1.5) score += 10;

    // Load Cell check (HX711)
    if (valForce >= 30.0) score += 40;
    else if (valForce >= 15.0) score += 25;
    else if (valForce >= 5.0) score += 10;

    // Tilt Sensor check (MPU6050)
    if (valTilt >= 15.0) score += 20;
    else if (valTilt >= 8.0) score += 15;
    else if (valTilt >= 4.0) score += 5;

    // False Alarm Filter Logic
    let severityClass = 'normal';
    let severityText = 'NORMAL (NO HAZARD)';
    let actionText = 'Nominal highway operations. No alert transmitted.';

    if (valAccel >= 2.0 && valForce < 2.0 && valTilt < 4.0) {
      // High vibration but zero structural collision force -> Pothole or heavy truck rumble
      severityClass = 'normal';
      severityText = 'FILTERED: ROAD VIBRATION';
      actionText = 'False Alarm Rejected. Vibration detected without collision force. Status nominal.';
    } else if (valTilt >= 4.0 && valForce < 2.0 && valAccel < 1.5) {
      // Tilt without impact force or accel -> Heavy crosswind or maintenance worker lean
      severityClass = 'normal';
      severityText = 'FILTERED: CROSSWIND / DEFLECTION';
      actionText = 'False Alarm Rejected. Angular flexure without dynamic impact shockwave.';
    } else if (score >= 70) {
      severityClass = valForce > 45 || valAccel > 5.0 ? 'critical' : 'high';
      severityText = valForce > 45 || valAccel > 5.0 ? 'CRITICAL ACCIDENT' : 'MAJOR ACCIDENT';
      actionText = 'VERIFIED ACCIDENT: Immediate automated dispatch to Police, Hospital, and EMS.';
    } else if (score >= 35) {
      severityClass = 'minor';
      severityText = 'MINOR IMPACT';
      actionText = 'Low-severity vehicle graze. Highway patrol notified for precautionary inspection.';
    }

    // Update DOM
    const meter = document.getElementById('fusionSeverityMeter');
    const decisionNotes = document.getElementById('fusionDecisionNotes');
    const scoreVal = document.getElementById('fusionScoreVal');

    if (meter) {
      meter.className = `severity-meter ${severityClass}`;
      meter.textContent = severityText;
    }

    if (decisionNotes) {
      decisionNotes.textContent = actionText;
    }

    if (scoreVal) {
      scoreVal.textContent = `Confidence Score: ${score}/100`;
    }
  }
};

window.SensorFusionDemo = SensorFusionDemo;
