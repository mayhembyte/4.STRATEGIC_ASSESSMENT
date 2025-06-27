///sketch.js - strategic assessment



/// 4. STRATEGIC ASSESSMENT

let phase = 0;
let t = 0;
let finalContraction = false;
let finalContractionProgress = 0;
let finalContractionDuration = 60; // Contração final ajustada

// Mira animada
let miraStart, miraEnd, mira, miraProgress = 0;
let miraDuration = 120; // ~2s
let contractionDuration = 48; // ~0.8s
let contractionProgress = 0;

// Círculo pulsante
let pulseSize = 300;
let pulseSpeed = 0.05;

// Partículas
let particles = [];
let numParticles = 225;
let baseRadius;

// Grupos internos
let groupPhase = 0;
let groupTime = 0;
let totalGroups = 3;
let innerParticles = [];
let maxInnerRadius;
let groupProcessing = false;
let finishedGroups = [];

// Distribuição de tempo para 15 segundos (900 frames)
let orbitDuration = 180;  // Fase 2 (3s)
let orbitDelay = 60;      // Fase 3 (1s)
let groupStartDelay = 30; // Fase 5 - início
let groupMoveDuration = 60;
let groupContractDuration = 60;
let delayBeforeFinal = 30;

function setup() {
  createCanvas(500, 500);
  angleMode(RADIANS);
  miraStart = createVector(width / 2, height / 2);
  miraEnd = createVector(width / 2, height / 2);
  mira = miraStart.copy();
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  if (phase === 0) {
    if (t < miraDuration) {
      updateMiraMovement();
      drawMira(1);
      t++;
    } else {
      phase = 1;
      t = 0;
    }

  } else if (phase === 1) {
    if (t < contractionDuration) {
      contractionProgress = t / contractionDuration;
      drawMira(1 - contractionProgress);
      drawPulsingCircle(contractionProgress);
      t++;
    } else {
      phase = 2;
      t = 0;
      initParticles();
    }

  } else if (phase === 2) {
    drawPulsingCircle(1);
    updateParticles();
    drawParticles();
    if (t > orbitDuration) {
      phase = 3;
      t = 0;
    }
    t++;

  } else if (phase === 3) {
    drawPulsingCircle(1);
    updateParticles();
    drawParticles();
    if (t > orbitDelay) {
      phase = 5;
      groupTime = 0;
      maxInnerRadius = pulseSize / 2;
    }
    t++;

  } else if (phase === 5) {
    drawPulsingCircle(1);
    if (groupProcessing) {
      updateRemainingParticles();
      drawRemainingParticles();
    }
    drawFinishedGroups();
    handleGroupEntrance();
    groupTime++;

  } else if (phase === 6) {
    if (!finalContraction) {
      drawPulsingCircle(1);
      drawFinishedGroups();
      groupTime++;
      if (groupTime > delayBeforeFinal) {
        finalContraction = true;
        finalContractionProgress = 0;
      }
    } else {
      finalContractionProgress++;
      let contractionFactor = 1 - (finalContractionProgress / finalContractionDuration);
      contractionFactor = constrain(contractionFactor, 0, 1);
      drawPulsingCircle(contractionFactor);
      drawFinishedGroups();
      if (finalContractionProgress >= finalContractionDuration) {
        resetAnimation();
      }
    }
  }
}

// --- MIRA
function updateMiraMovement() {
  miraProgress = constrain(miraProgress + 1 / miraDuration, 0, 1);
  let basePos = miraEnd.copy();
  let amplitude = 120 * (1 - miraProgress);
  let frequency = 1;
  let oscillationX = sin(miraProgress * TWO_PI * frequency) * amplitude;
  let oscillationY = sin(miraProgress * TWO_PI * frequency + PI / 6) * amplitude;
  mira = createVector(basePos.x + oscillationX - width / 2, basePos.y + oscillationY - height / 2);
}

function drawMira(scaleFactor) {
  push();
  translate(mira.x, mira.y);
  stroke(255, 180);
  noFill();
  strokeWeight(1.5 * scaleFactor);
  ellipse(0, 0, 81 * scaleFactor);
  strokeWeight(2 * scaleFactor);
  let gap = 27 * scaleFactor;
  let len = 54 * scaleFactor;
  line(-len, 0, -gap, 0);
  line(gap, 0, len, 0);
  line(0, -len, 0, -gap);
  line(0, gap, 0, len);
  noStroke();
  fill(255);
  ellipse(0, 0, 18 * scaleFactor);
  pop();
}

// --- CÍRCULO
function drawPulsingCircle(scaleFactor) {
  let pulse = pulseSize + sin(frameCount * pulseSpeed) * 8;
  let scaledPulse = pulse * scaleFactor;
  stroke(255, 255 * scaleFactor);
  noFill();
  strokeWeight(1.5 * scaleFactor);
  ellipse(0, 0, scaledPulse);
}

// --- PARTÍCULAS
function initParticles() {
  particles = [];
  baseRadius = pulseSize / 2 + 20;
  for (let i = 0; i < numParticles; i++) {
    let angle = random(TWO_PI);
    let radius = baseRadius + random(20, 40);
    let rotationSpeed = random(0.002, 0.006);
    particles.push({
      angle: angle,
      radius: radius,
      rotationSpeed: rotationSpeed,
      size: random(3, 6),
      phase: random(TWO_PI),
      x: 0,
      y: 0
    });
  }
}

function updateParticles() {
  for (let p of particles) {
    p.angle += p.rotationSpeed;
    p.x = cos(p.angle + p.phase) * p.radius;
    p.y = sin(p.angle + p.phase) * p.radius;
  }
}

function drawParticles() {
  noStroke();
  fill(255, 180);
  for (let p of particles) {
    ellipse(p.x, p.y, p.size);
  }
}

// --- ENTRADA DE GRUPOS
function updateRemainingParticles() {
  let startIndex = groupPhase * 100;
  for (let i = startIndex; i < particles.length; i++) {
    let p = particles[i];
    p.angle += p.rotationSpeed;
    p.x = cos(p.angle + p.phase) * p.radius;
    p.y = sin(p.angle + p.phase) * p.radius;
  }
}

function drawRemainingParticles() {
  noStroke();
  fill(255, 180);
  let startIndex = groupPhase * 100;
  for (let i = startIndex; i < particles.length; i++) {
    let p = particles[i];
    ellipse(p.x, p.y, p.size);
  }
}

function handleGroupEntrance() {
  if (groupPhase >= totalGroups) return;

  const groupSize = 100;
  let currentGroup = particles.slice(groupPhase * groupSize, (groupPhase + 1) * groupSize);

  if (!groupProcessing) {
    innerParticles = currentGroup.map(p => ({
      x: p.x,
      y: p.y,
      targetAngle: random(TWO_PI),
      targetRadius: random(0, maxInnerRadius),
      targetX: 0,
      targetY: 0,
      progress: 0
    }));

    for (let p of innerParticles) {
      p.targetX = cos(p.targetAngle) * p.targetRadius;
      p.targetY = sin(p.targetAngle) * p.targetRadius;
    }

    groupProcessing = true;
    groupTime = 0;
  }

  if (groupTime < groupMoveDuration) {
    for (let p of innerParticles) {
      p.progress = groupTime / groupMoveDuration;
      p.currentX = lerp(p.x, p.targetX, easeOutQuad(p.progress));
      p.currentY = lerp(p.y, p.targetY, easeOutQuad(p.progress));
    }

  } else if (groupTime < groupMoveDuration + groupContractDuration) {
    let c = groupTime - groupMoveDuration;
    for (let p of innerParticles) {
      p.currentX = lerp(p.targetX, 0, easeInOutQuad(c / groupContractDuration));
      p.currentY = lerp(p.targetY, 0, easeInOutQuad(c / groupContractDuration));
    }

  } else {
    finishedGroups.push(innerParticles);
    groupPhase++;
    groupProcessing = false;
    groupTime = 0;

    if (groupPhase >= totalGroups) {
      phase = 6;
    }
    return;
  }

  noStroke();
  fill(255, 200);
  for (let p of innerParticles) {
    ellipse(p.currentX, p.currentY, 4);
  }
}

function drawFinishedGroups() {
  noStroke();
  fill(255, 200);
  for (let group of finishedGroups) {
    for (let p of group) {
      ellipse(0, 0, 4);
    }
  }
}

// EASING
function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x);
}

function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2;
}

// REINÍCIO
function resetAnimation() {
  phase = 0;
  t = 0;
  miraProgress = 0;
  contractionProgress = 0;
  particles = [];
  innerParticles = [];
  finishedGroups = [];
  groupPhase = 0;
  groupTime = 0;
  groupProcessing = false;
  finalContraction = false;
  finalContractionProgress = 0;
}

//// TEMPO TOTAL DA ANIMAÇÃO: 15s