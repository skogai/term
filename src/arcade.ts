type CabinetId = 'sudo' | 'wifi' | 'honkers';
type GameStatus = 'idle' | 'playing' | 'won' | 'failed';

type Cabinet = {
  id: CabinetId;
  title: string;
  subtitle: string;
  summary: string;
  accent: string;
  swatches: string[];
};

type Vec = {
  x: number;
  y: number;
};

type Hazard = Vec & {
  w: number;
  h: number;
  speed: number;
  axis: 'x' | 'y';
  min: number;
  max: number;
  dir: number;
};

type Fragment = Vec & {
  collected: boolean;
};

type GameState = {
  status: GameStatus;
  player: Vec;
  hp: number;
  score: number;
  alarms: number;
  startedAt: number;
  elapsed: number;
  fragments: Fragment[];
  hazards: Hazard[];
  antenna: Vec;
  keys: Set<string>;
};

const cabinets: Cabinet[] = [
  {
    id: 'sudo',
    title: 'SUDO HERO',
    subtitle: 'Solo rooftop contract',
    summary: 'Collect passkeys, dodge alarm sweeps, and patch the antenna.',
    accent: '#a75cff',
    swatches: ['#a75cff', '#7e3ff2', '#ffd84a'],
  },
  {
    id: 'wifi',
    title: 'WI-FI WIZARDS',
    subtitle: 'Network ritual preview',
    summary: 'Channel routing and co-op spell casting unlock next.',
    accent: '#50d7f0',
    swatches: ['#50d7f0', '#ff3ea5', '#4f80f0'],
  },
  {
    id: 'honkers',
    title: 'HONKERS & HACKERS',
    subtitle: 'Rooftop scramble preview',
    summary: 'Time-attack chaos with squad scoring unlocks later.',
    accent: '#ff3ea5',
    swatches: ['#ff3ea5', '#ffd84a', '#ff9445'],
  },
];

const canvasSize = { width: 760, height: 420 };
const playerSize = 18;
const arena = { x: 32, y: 138, width: 696, height: 212 };
const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing app root');
}

let activeCabinet: Cabinet = cabinets[0]!;
let lastFrame = 0;

const state: GameState = {
  status: 'idle',
  player: { x: 82, y: 306 },
  hp: 5,
  score: 0,
  alarms: 0,
  startedAt: 0,
  elapsed: 0,
  fragments: [],
  hazards: [],
  antenna: { x: 668, y: 84 },
  keys: new Set(),
};

app.innerHTML = `
  <header class="hud">
    <div class="avatar" aria-hidden="true"></div>
    <div>
      <div class="kicker">SKOGAI GAME STUDIOS</div>
      <div class="brand" id="cabinet-title"></div>
      <div class="kicker" id="cabinet-subtitle"></div>
    </div>
    <div class="hud-stats" aria-live="polite">
      <div><span class="label">HP</span><strong id="hp-readout">5/5</strong></div>
      <div><span class="label">Score</span><strong id="score-readout">0</strong></div>
      <div><span class="label">Time</span><strong id="time-readout">00:00</strong></div>
    </div>
  </header>

  <section class="cabinet-row" aria-label="Cabinet selector"></section>

  <section class="hero">
    <div class="stage-wrap">
      <div class="stage-title">
        <div class="cabinet-id">CABINET 01</div>
        <h1 id="stage-heading"></h1>
        <p id="stage-copy"></p>
      </div>
      <canvas id="game-canvas" width="${canvasSize.width}" height="${canvasSize.height}" aria-label="Sudo Hero rooftop playfield"></canvas>
    </div>
    <aside class="mission-panel">
      <div>
        <div class="label">Mission Brief</div>
        <h2 id="mission-title"></h2>
        <p id="mission-copy"></p>
      </div>
      <div class="controls">
        <button class="btn btn-primary" id="start-button" type="button">START RUN</button>
        <button class="btn" id="reset-button" type="button">RESET</button>
      </div>
    </aside>
  </section>

  <section class="quest-strip" aria-label="Mission quests">
    <div class="quest" id="quest-fragments">
      <div><strong>Recover passkeys</strong><span id="fragment-readout">0 of 3 fragments found</span></div>
      <div class="quest-state"></div>
    </div>
    <div class="quest" id="quest-antenna">
      <div><strong>Patch antenna</strong><span id="antenna-readout">Needs passkeys</span></div>
      <div class="quest-state"></div>
    </div>
    <div class="quest" id="quest-alarms">
      <div><strong>Keep signal clean</strong><span id="alarm-readout">0 alarms triggered</span></div>
      <div class="quest-state"></div>
    </div>
  </section>

  <section class="footer-grid">
    <div class="panel summary">
      <div>
        <div class="label">Mission Summary</div>
        <ul id="summary-list"></ul>
      </div>
      <div class="plaque"><span class="label">Rank</span><strong id="rank-readout">--</strong></div>
      <div class="plaque"><span class="label">Signal</span><strong id="signal-readout">87%</strong></div>
    </div>
    <pre class="terminal-panel" id="terminal-output"></pre>
  </section>
`;

const canvasNode = document.querySelector<HTMLCanvasElement>('#game-canvas');
const ctxNode = canvasNode?.getContext('2d');
const cabinetRowNode = document.querySelector<HTMLElement>('.cabinet-row');
const startButtonNode =
  document.querySelector<HTMLButtonElement>('#start-button');
const resetButtonNode =
  document.querySelector<HTMLButtonElement>('#reset-button');

if (
  !canvasNode ||
  !ctxNode ||
  !cabinetRowNode ||
  !startButtonNode ||
  !resetButtonNode
) {
  throw new Error('Arcade UI failed to mount');
}

const ctx = ctxNode;
const cabinetRow = cabinetRowNode;
const startButton = startButtonNode;
const resetButton = resetButtonNode;

const byId = <T extends HTMLElement>(id: string): T => {
  const el = document.querySelector<T>(id);
  if (!el) {
    throw new Error(`Missing element ${id}`);
  }
  return el;
};

const els = {
  title: byId<HTMLElement>('#cabinet-title'),
  subtitle: byId<HTMLElement>('#cabinet-subtitle'),
  stageHeading: byId<HTMLElement>('#stage-heading'),
  stageCopy: byId<HTMLElement>('#stage-copy'),
  missionTitle: byId<HTMLElement>('#mission-title'),
  missionCopy: byId<HTMLElement>('#mission-copy'),
  hp: byId<HTMLElement>('#hp-readout'),
  score: byId<HTMLElement>('#score-readout'),
  time: byId<HTMLElement>('#time-readout'),
  fragments: byId<HTMLElement>('#fragment-readout'),
  antenna: byId<HTMLElement>('#antenna-readout'),
  alarms: byId<HTMLElement>('#alarm-readout'),
  questFragments: byId<HTMLElement>('#quest-fragments'),
  questAntenna: byId<HTMLElement>('#quest-antenna'),
  questAlarms: byId<HTMLElement>('#quest-alarms'),
  summary: byId<HTMLUListElement>('#summary-list'),
  rank: byId<HTMLElement>('#rank-readout'),
  signal: byId<HTMLElement>('#signal-readout'),
  terminal: byId<HTMLElement>('#terminal-output'),
};

function makeCabinetButtons(): void {
  cabinetRow.replaceChildren(
    ...cabinets.map(cabinet => {
      const button = document.createElement('button');
      button.className = 'cabinet';
      button.type = 'button';
      button.style.setProperty('--cabinet-card-accent', cabinet.accent);
      button.setAttribute(
        'aria-pressed',
        String(cabinet.id === activeCabinet.id)
      );
      button.innerHTML = `
        <div class="cabinet-id">${cabinet.subtitle}</div>
        <h2>${cabinet.title}</h2>
        <p>${cabinet.summary}</p>
        <div class="swatches">${cabinet.swatches.map(color => `<span style="background:${color}"></span>`).join('')}</div>
      `;
      button.addEventListener('click', () => selectCabinet(cabinet.id));
      return button;
    })
  );
}

function selectCabinet(id: CabinetId): void {
  activeCabinet = cabinets.find(cabinet => cabinet.id === id) ?? cabinets[0]!;
  applyCabinet();
  if (id === 'sudo') {
    resetGame();
    return;
  }
  state.status = 'idle';
  state.hp = 5;
  state.score = 0;
  state.elapsed = 0;
  state.alarms = 0;
  state.fragments = [];
  state.hazards = [];
  startButton.textContent = 'PREVIEW';
  render();
  writeTerminal([
    '$ skogai inspect --cabinet=' + id,
    '[locked] cabinet preview installed',
    '[note] first playable mission: sudo-hero',
  ]);
}

function applyCabinet(): void {
  document.body.style.setProperty('--cabinet-accent', activeCabinet.accent);
  els.title.textContent = activeCabinet.title;
  els.subtitle.textContent = activeCabinet.subtitle;
  els.stageHeading.textContent = activeCabinet.title;
  els.stageCopy.textContent =
    activeCabinet.id === 'sudo'
      ? 'A new contract just hit the wire.'
      : activeCabinet.summary;
  els.missionTitle.textContent =
    activeCabinet.id === 'sudo'
      ? 'Patch the rooftop antenna'
      : 'Cabinet locked';
  els.missionCopy.textContent =
    activeCabinet.id === 'sudo'
      ? 'Move with WASD or arrows. Gather three passkey fragments, avoid alarm sweeps, then reach the antenna.'
      : 'This cabinet is staged as a visual preview for a later milestone.';
  makeCabinetButtons();
}

function resetGame(): void {
  state.status = 'idle';
  state.player = { x: 82, y: 306 };
  state.hp = 5;
  state.score = 0;
  state.alarms = 0;
  state.elapsed = 0;
  state.startedAt = 0;
  state.fragments = [
    { x: 226, y: 184, collected: false },
    { x: 372, y: 306, collected: false },
    { x: 548, y: 214, collected: false },
  ];
  state.hazards = [
    {
      x: 160,
      y: 226,
      w: 98,
      h: 18,
      speed: 82,
      axis: 'x',
      min: 120,
      max: 420,
      dir: 1,
    },
    {
      x: 486,
      y: 178,
      w: 18,
      h: 118,
      speed: 58,
      axis: 'y',
      min: 158,
      max: 288,
      dir: 1,
    },
    {
      x: 312,
      y: 154,
      w: 112,
      h: 18,
      speed: 70,
      axis: 'x',
      min: 230,
      max: 586,
      dir: -1,
    },
  ];
  state.antenna = { x: 668, y: 162 };
  startButton.textContent = 'START RUN';
  els.rank.textContent = '--';
  writeTerminal([
    '$ skogai run --cabinet=sudo-hero',
    '[ready] rooftop signal at 87%',
    '[input] arrows / wasd to move',
  ]);
  render();
}

function startGame(): void {
  if (activeCabinet.id !== 'sudo') {
    selectCabinet('sudo');
    return;
  }
  if (state.status === 'playing') {
    return;
  }
  if (state.status === 'won' || state.status === 'failed') {
    resetGame();
  }
  state.status = 'playing';
  state.startedAt = performance.now() - state.elapsed * 1000;
  startButton.textContent = 'RUNNING';
  writeTerminal([
    '$ skogai run --cabinet=sudo-hero',
    '[ok] connected to night-city.sktx',
    '[warn] alarm sweeps active',
  ]);
}

function completeGame(won: boolean): void {
  state.status = won ? 'won' : 'failed';
  const cleanBonus = Math.max(0, 500 - state.alarms * 100);
  const timeBonus = Math.max(0, 600 - Math.floor(state.elapsed * 10));
  if (won) {
    state.score += 1000 + cleanBonus + timeBonus;
  }
  startButton.textContent = won ? 'CONTINUE RUN' : 'RETRY RUN';
  els.rank.textContent = rank();
  writeTerminal(
    won
      ? [
          '$ skogai finish --mission=antenna',
          '[ok] antenna patched',
          `[score] ${state.score.toLocaleString()} pts · rank ${rank()}`,
        ]
      : [
          '$ skogai recover --mission=antenna',
          '[fail] hp depleted',
          '[hint] wait for sweeps to cross before dashing',
        ]
  );
}

function rank(): string {
  if (state.status === 'failed') {
    return 'C';
  }
  if (state.hp >= 4 && state.alarms === 0 && state.elapsed < 35) {
    return 'S+';
  }
  if (state.hp >= 3 && state.alarms <= 1) {
    return 'A';
  }
  return 'B';
}

function writeTerminal(lines: string[]): void {
  els.terminal.innerHTML = `${lines.join('\n')}\n<span class="cursor"></span>`;
}

function update(dt: number): void {
  if (state.status !== 'playing') {
    return;
  }
  state.elapsed = (performance.now() - state.startedAt) / 1000;

  const speed = 170;
  const next = { ...state.player };
  const left = state.keys.has('arrowleft') || state.keys.has('a');
  const right = state.keys.has('arrowright') || state.keys.has('d');
  const up = state.keys.has('arrowup') || state.keys.has('w');
  const down = state.keys.has('arrowdown') || state.keys.has('s');

  if (left) {
    next.x -= speed * dt;
  }
  if (right) {
    next.x += speed * dt;
  }
  if (up) {
    next.y -= speed * dt;
  }
  if (down) {
    next.y += speed * dt;
  }

  state.player.x = clamp(next.x, arena.x + 2, arena.x + arena.width - 28);
  state.player.y = clamp(next.y, arena.y + 2, arena.y + arena.height - 28);

  for (const hazard of state.hazards) {
    hazard[hazard.axis] += hazard.speed * hazard.dir * dt;
    if (hazard[hazard.axis] < hazard.min || hazard[hazard.axis] > hazard.max) {
      hazard.dir *= -1;
      hazard[hazard.axis] = clamp(hazard[hazard.axis], hazard.min, hazard.max);
    }
    if (
      rectsTouch(
        state.player.x,
        state.player.y,
        playerSize,
        playerSize,
        hazard.x,
        hazard.y,
        hazard.w,
        hazard.h
      )
    ) {
      state.hp -= 1;
      state.alarms += 1;
      state.score = Math.max(0, state.score - 75);
      state.player.x = 82;
      state.player.y = 306;
      if (state.hp <= 0) {
        completeGame(false);
      }
      break;
    }
  }

  for (const fragment of state.fragments) {
    if (!fragment.collected && distance(state.player, fragment) < 28) {
      fragment.collected = true;
      state.score += 250;
      writeTerminal([
        '$ skogai collect passkey.fragment',
        `[ok] recovered ${collectedCount()} of 3 fragments`,
        '[trace] antenna lock weakening',
      ]);
    }
  }

  if (collectedCount() === 3 && distance(state.player, state.antenna) < 34) {
    completeGame(true);
  }
}

function render(): void {
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
  drawBackdrop();

  if (activeCabinet.id !== 'sudo') {
    drawPreview();
  } else {
    drawMission();
  }

  syncHud();
}

function drawBackdrop(): void {
  ctx.fillStyle = '#12071e';
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  ctx.fillStyle = '#0a0612';
  ctx.fillRect(0, 326, canvasSize.width, 94);

  for (let x = 0; x < canvasSize.width; x += 42) {
    const h = 38 + ((x * 7) % 54);
    ctx.fillStyle = x % 84 === 0 ? '#241448' : '#361752';
    ctx.fillRect(x, 326 - h, 26, h);
  }

  ctx.fillStyle = '#f3eaff';
  for (let i = 0; i < 22; i += 1) {
    const x = (i * 97) % canvasSize.width;
    const y = 34 + ((i * 43) % 120);
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawPreview(): void {
  ctx.strokeStyle = activeCabinet.accent;
  ctx.lineWidth = 1;
  for (let y = 244; y < 382; y += 26) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasSize.width, y);
    ctx.stroke();
  }
  for (let x = -220; x < canvasSize.width + 220; x += 62) {
    ctx.beginPath();
    ctx.moveTo(x, 382);
    ctx.lineTo(x + 220, 244);
    ctx.stroke();
  }
}

function drawMission(): void {
  ctx.fillStyle = '#211038';
  ctx.fillRect(arena.x, arena.y, arena.width, arena.height);
  ctx.strokeStyle = '#6541a8';
  ctx.lineWidth = 2;
  ctx.strokeRect(arena.x, arena.y, arena.width, arena.height);

  ctx.fillStyle = '#362052';
  for (let x = 52; x < canvasSize.width - 70; x += 46) {
    ctx.fillRect(x, 248, 28, 78);
  }

  ctx.fillStyle = '#ffd84a';
  ctx.fillRect(state.antenna.x, state.antenna.y, 10, 58);
  ctx.fillRect(state.antenna.x - 20, state.antenna.y, 50, 8);
  ctx.strokeStyle = collectedCount() === 3 ? '#55ff8a' : '#aa92cf';
  ctx.strokeRect(state.antenna.x - 24, state.antenna.y - 4, 58, 66);

  for (const fragment of state.fragments) {
    if (fragment.collected) {
      continue;
    }
    ctx.fillStyle = '#50d7f0';
    ctx.fillRect(fragment.x - 9, fragment.y - 9, 18, 18);
    ctx.strokeStyle = '#f3eaff';
    ctx.strokeRect(fragment.x - 13, fragment.y - 13, 26, 26);
  }

  ctx.fillStyle = 'rgba(255, 79, 122, 0.76)';
  for (const hazard of state.hazards) {
    ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h);
  }

  ctx.fillStyle = '#a75cff';
  ctx.fillRect(state.player.x, state.player.y, playerSize, playerSize);
  ctx.fillStyle = '#f3eaff';
  ctx.fillRect(state.player.x + 5, state.player.y + 5, 8, 8);
}

function syncHud(): void {
  const collected = collectedCount();
  const signal = Math.max(0, 87 - state.alarms * 12);
  els.hp.textContent = `${state.hp}/5`;
  els.score.textContent = state.score.toLocaleString();
  els.time.textContent = formatTime(state.elapsed);
  els.fragments.textContent = `${collected} of 3 fragments found`;
  els.antenna.textContent =
    collected === 3 ? 'Ready to patch' : 'Needs passkeys';
  els.alarms.textContent = `${state.alarms} alarms triggered`;
  els.signal.textContent = `${signal}%`;

  els.questFragments.classList.toggle('done', collected === 3);
  els.questAntenna.classList.toggle('done', state.status === 'won');
  els.questAlarms.classList.toggle(
    'done',
    state.alarms === 0 && state.status === 'won'
  );

  const statusLine =
    state.status === 'won'
      ? 'Antenna patched'
      : state.status === 'failed'
        ? 'Mission failed'
        : state.status === 'playing'
          ? 'Run active'
          : 'Awaiting start';
  els.summary.innerHTML = `
    <li>${statusLine}</li>
    <li>${collected} of 3 passkey fragments recovered</li>
    <li>${state.alarms} alarm sweeps triggered</li>
  `;
}

function loop(now: number): void {
  const dt = Math.min(0.032, (now - lastFrame) / 1000 || 0);
  lastFrame = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

function collectedCount(): number {
  return state.fragments.filter(fragment => fragment.collected).length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function distance(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function rectsTouch(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (
    [
      'arrowup',
      'arrowdown',
      'arrowleft',
      'arrowright',
      'w',
      'a',
      's',
      'd',
    ].includes(key)
  ) {
    event.preventDefault();
    state.keys.add(key);
  }
  if (key === 'enter' || key === ' ') {
    event.preventDefault();
    startGame();
  }
});

window.addEventListener('keyup', event => {
  state.keys.delete(event.key.toLowerCase());
});

startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);

applyCabinet();
resetGame();
requestAnimationFrame(loop);
