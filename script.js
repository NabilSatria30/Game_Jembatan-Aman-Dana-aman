const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  hud: document.getElementById("hud"),
  score: document.getElementById("scoreText"),
  level: document.getElementById("levelText"),
  budget: document.getElementById("budgetText"),
  time: document.getElementById("timeText"),
  integrity: document.getElementById("integrityText"),
  strengthFill: document.getElementById("strengthFill"),
  missionPanel: document.getElementById("choicePanel"),
  missionText: document.getElementById("roundText"),
  levelGoal: document.getElementById("levelGoalText"),
  start: document.getElementById("startScreen"),
  story: document.getElementById("storyScreen"),
  pause: document.getElementById("pauseScreen"),
  over: document.getElementById("gameOverScreen"),
  how: document.getElementById("howScreen"),
  resultLabel: document.getElementById("resultLabel"),
  resultTitle: document.getElementById("resultTitle"),
  resultMessage: document.getElementById("resultMessage"),
  finalScore: document.getElementById("finalScore"),
  finalHighScore: document.getElementById("finalHighScore"),
  startHighScore: document.getElementById("startHighScore")
};

const buttons = {
  start: document.getElementById("startButton"),
  storyStart: document.getElementById("storyStartButton"),
  closeStory: document.getElementById("closeStoryButton"),
  how: document.getElementById("howButton"),
  closeHow: document.getElementById("closeHowButton"),
  pause: document.getElementById("pauseButton"),
  music: document.getElementById("musicButton"),
  resume: document.getElementById("resumeButton"),
  restart: document.getElementById("restartButton"),
  restartPause: document.getElementById("restartFromPauseButton"),
  backToStart: document.getElementById("backToStartButton")
};

const itemTypes = {
  material: {
    label: "Baja Legal",
    color: "#1cad6f",
    icon: "beam",
    image: "material",
    score: 90,
    progress: 8,
    integrity: 1,
    budget: 2,
    message: "Baja legal memperkuat jembatan."
  },
  fund: {
    label: "Semen Standar",
    color: "#2675ff",
    icon: "bag",
    image: "fund",
    score: 80,
    progress: 7,
    integrity: 2,
    budget: 1,
    message: "Semen standar menambah progres konstruksi."
  },
  bribe: {
    label: "Suap Dana",
    color: "#f5b642",
    icon: "envelope",
    image: "bribe",
    score: -70,
    progress: -7,
    integrity: -18,
    budget: -5,
    message: "Suap dana membuat progres proyek mundur."
  },
  fake: {
    label: "Material Palsu",
    color: "#c53d4a",
    icon: "crack",
    image: "fake",
    score: -85,
    progress: -9,
    integrity: -12,
    budget: -2,
    message: "Material palsu membuat jembatan rapuh."
  }
};

const levels = [
  {
    name: "Level 1: Pondasi Bersih",
    goal: "Kumpulkan material legal untuk pondasi awal",
    spawnInterval: 0.94,
    duration: 60,
    fallSpeed: 118,
    badChance: 0.13,
    fundChance: 0.28,
    rewardBudget: 26,
    message: "Level 1: ambil baja legal dan semen standar.",
    theme: {
      sky: ["#bfefff", "#e9f8e7", "#ffe0a7"],
      river: ["#37b9d6", "#126eac"],
      ground: "#78bf6a",
      bank: "#5aa153",
      bridge: "#8b5a36",
      houses: ["#f5b642", "#18a999", "#e84d5b"]
    }
  },
  {
    name: "Level 2: Arus Dana",
    goal: "Pilih material aman saat godaan suap meningkat",
    spawnInterval: 0.82,
    duration: 58,
    fallSpeed: 146,
    badChance: 0.21,
    fundChance: 0.29,
    rewardBudget: 22,
    message: "Level 2: item buruk makin sering. Hindari kuning dan merah.",
    theme: {
      sky: ["#d6f7ff", "#e7f1ff", "#ffd9a1"],
      river: ["#4aa5e8", "#254fba"],
      ground: "#8ac45f",
      bank: "#6aa34b",
      bridge: "#7a6540",
      houses: ["#ffcc4d", "#2b83ff", "#ff6b6b"]
    }
  },
  {
    name: "Level 3: Uji Kelayakan",
    goal: "Selesaikan jembatan tanpa integritas habis",
    spawnInterval: 0.72,
    duration: 56,
    fallSpeed: 170,
    badChance: 0.28,
    fundChance: 0.27,
    rewardBudget: 18,
    message: "Level 3: tuntaskan jembatan tanpa mengambil material buruk.",
    theme: {
      sky: ["#ffd7b5", "#ffe8c7", "#ccebd2"],
      river: ["#23b8c7", "#0b7f92"],
      ground: "#74b86d",
      bank: "#4d965f",
      bridge: "#665f4b",
      houses: ["#f08a4b", "#30b8a6", "#d95780"]
    }
  },
  {
    name: "Level 4: Musim Hujan",
    goal: "Bangun cepat saat aliran sungai makin deras",
    spawnInterval: 0.62,
    duration: 54,
    fallSpeed: 198,
    badChance: 0.34,
    fundChance: 0.24,
    rewardBudget: 14,
    message: "Level 4: sungai deras, item jatuh lebih cepat.",
    theme: {
      sky: ["#97c7d8", "#b8ced4", "#d8d5bd"],
      river: ["#2d94ba", "#185a8c"],
      ground: "#5fa866",
      bank: "#3e8350",
      bridge: "#705244",
      houses: ["#e0a33c", "#158f87", "#cf4e58"]
    }
  },
  {
    name: "Level 5: Audit Publik",
    goal: "Tuntaskan proyek tersulit tanpa tergoda korupsi",
    spawnInterval: 0.54,
    duration: 52,
    fallSpeed: 226,
    badChance: 0.40,
    fundChance: 0.22,
    rewardBudget: 0,
    message: "Level 5: ujian akhir. Jaga integritas sampai jembatan selesai.",
    theme: {
      sky: ["#f5c8b0", "#d8c6df", "#b7d7d9"],
      river: ["#1e89b4", "#123d74"],
      ground: "#689b58",
      bank: "#416f41",
      bridge: "#5f4b45",
      houses: ["#d88f32", "#0f7f9a", "#b9425a"]
    }
  }
];

const input = {
  left: false,
  right: false
};

let width = 0;
let height = 0;
let dpr = 1;
let lastTime = 0;
let scene = "start";
let highScore = Number(localStorage.getItem("bridgeSafeHighScore") || 0);
let musicEnabled = localStorage.getItem("bridgeSafeMusicEnabled") !== "false";

const game = createInitialState();
const assets = createAssetLibrary();
const audio = createGameAudio();

function createInitialState() {
  return {
    score: 0,
    budget: 40,
    integrity: 100,
    progress: 0,
    levelIndex: 0,
    difficulty: 1,
    elapsed: 0,
    timeLeft: levels[0].duration,
    spawnTimer: 0.35,
    message: "Ambil item bersih. Hindari korupsi.",
    messageTimer: 2.6,
    hintTimer: 5,
    player: { x: 0, y: 0, width: 94, height: 28, speed: 520 },
    items: [],
    particles: [],
    clouds: [],
    villagers: [],
    celebration: {
      active: false,
      timer: 0,
      nextLevelIndex: 0,
      final: false
    },
    quake: 0,
    ended: false
  };
}

function createAssetLibrary() {
  const paths = {
    background: "assets/background/village-map.svg",
    bridge: "assets/bridge/wooden-bridge.svg",
    worker: "assets/animation/worker-run.svg",
    villager: "assets/characters/villager-walk.svg",
    villagerMale: "assets/characters/villager-male.svg",
    villagerFemale: "assets/characters/villager-female.svg",
    vfx: "assets/vfx/clean-burst.svg",
    material: "assets/items/steel-beam.svg",
    fund: "assets/items/cement-bag.svg",
    bribe: "assets/items/bribe-envelope.svg",
    fake: "assets/items/fake-material.svg",
    houseYellow: "assets/houses/yellow-house.svg",
    houseTeal: "assets/houses/teal-house.svg",
    houseRed: "assets/houses/red-house.svg",
    houseBlueStilt: "assets/houses/blue-stilt-house.svg"
  };
  const images = {};

  for (const [key, path] of Object.entries(paths)) {
    const image = new Image();
    image.src = path;
    images[key] = image;
  }

  return { images, paths };
}

function createGameAudio() {
  const sfxPaths = {
    click: "assets/sfx/click.wav",
    good: "assets/sfx/good.wav",
    bad: "assets/sfx/bad.wav",
    win: "assets/sfx/win.wav",
    lose: "assets/sfx/lose.wav"
  };
  const sfx = Object.fromEntries(
    Object.entries(sfxPaths).map(([name, path]) => {
      const sound = new Audio(path);
      sound.preload = "auto";
      sound.volume = name === "bad" || name === "lose" ? 0.36 : 0.42;
      return [name, sound];
    })
  );
  const bgm = new Audio("assets/bgm/clean-project-loop.wav");
  bgm.loop = true;
  bgm.volume = 0.18;

  function play(name) {
    const base = sfx[name];
    if (!base) return;
    const sound = base.cloneNode();
    sound.volume = base.volume;
    sound.play().catch(() => {});
  }

  return {
    click: () => play("click"),
    good: () => play("good"),
    bad: () => play("bad"),
    win: () => play("win"),
    lose: () => play("lose"),
    startBgm: () => {
      if (musicEnabled) bgm.play().catch(() => {});
    },
    pauseBgm: () => bgm.pause(),
    stopBgm: () => {
      bgm.pause();
      bgm.currentTime = 0;
    }
  };
}

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  game.player.x = clamp(game.player.x || width * 0.5, 56, width - 56);
  seedClouds();
}

function seedClouds() {
  game.clouds = Array.from({ length: Math.max(7, Math.floor(width / 150)) }, () => ({
    x: Math.random() * width,
    y: 58 + Math.random() * height * 0.25,
    speed: 8 + Math.random() * 22,
    size: 42 + Math.random() * 58,
    alpha: 0.2 + Math.random() * 0.22
  }));
}

function resetGame() {
  Object.assign(game, createInitialState());
  game.player.x = width * 0.5;
  game.player.y = playerY();
  resetVillagers();
  seedClouds();
  updateHud();
  setMessage(levels[0].message, 2.6);
}

function setScene(nextScene) {
  scene = nextScene;
  ui.start.classList.toggle("active", scene === "start");
  ui.story.classList.toggle("active", scene === "story");
  ui.pause.classList.toggle("active", scene === "paused");
  ui.over.classList.toggle("active", scene === "gameover");
  ui.how.classList.toggle("active", scene === "how");

  const inGame = scene === "playing" || scene === "paused";
  ui.hud.style.opacity = inGame ? "1" : "0";
  ui.hud.style.pointerEvents = inGame ? "auto" : "none";
  ui.missionPanel.classList.toggle("hidden", !inGame);
}

function startGame() {
  audio.click();
  resetGame();
  lastTime = performance.now();
  setScene("playing");
  audio.startBgm();
}

function pauseGame() {
  if (scene !== "playing") return;
  audio.click();
  setScene("paused");
  audio.pauseBgm();
}

function resumeGame() {
  audio.click();
  lastTime = performance.now();
  setScene("playing");
  audio.startBgm();
}

function update(dt) {
  updateBackground(dt);
  updateParticles(dt);

  if (scene !== "playing" || game.ended) return;

  if (game.celebration.active) {
    updateLevelCelebration(dt);
    updateHud();
    return;
  }

  game.elapsed += dt;
  game.difficulty = 1 + game.levelIndex * 0.62 + game.elapsed / 34 + game.progress / 160;
  game.messageTimer = Math.max(0, game.messageTimer - dt);
  game.hintTimer = Math.max(0, game.hintTimer - dt);
  game.quake *= Math.pow(0.0008, dt);
  game.timeLeft = Math.max(0, game.timeLeft - dt);

  updatePlayer(dt);
  spawnItems(dt);
  updateItems(dt);
  updateVillagers(dt);
  updateHud();

  if (game.integrity <= 0) {
    endGame(false, "Integritas proyek habis karena terlalu banyak korupsi.");
  }

  if (game.progress >= 100) {
    game.progress = 100;
    completeLevel();
  }

  if (game.timeLeft <= 0 && game.progress < 100) {
    game.quake = 9;
    endGame(false, "Waktu habis. Warga harus menyeberang, tetapi jembatan belum selesai dibangun.");
  }
}

function updatePlayer(dt) {
  const axis = Number(input.right) - Number(input.left);
  game.player.x += axis * game.player.speed * dt;
  game.player.x = clamp(game.player.x, 54, width - 54);
  game.player.y = playerY();
}

function spawnItems(dt) {
  game.spawnTimer -= dt;
  const level = levels[game.levelIndex];
  const interval = Math.max(0.32, level.spawnInterval - game.difficulty * 0.035);
  if (game.spawnTimer > 0) return;

  game.spawnTimer = interval;
  const roll = Math.random();
  const badLine = level.badChance;
  const fundLine = badLine + level.fundChance;
  let type = "material";
  if (roll < badLine) type = Math.random() > 0.5 ? "bribe" : "fake";
  else if (roll < fundLine) type = "fund";

  game.items.push({
    type,
    x: 42 + Math.random() * (width - 84),
    y: -36,
    size: 31,
    vy: level.fallSpeed + game.difficulty * 22 + Math.random() * 66,
    spin: Math.random() * Math.PI,
    spinSpeed: -3 + Math.random() * 6
  });
}

function updateItems(dt) {
  for (const item of game.items) {
    item.y += item.vy * dt;
    item.spin += item.spinSpeed * dt;

    if (collidesWithPlayer(item)) {
      collectItem(item);
      item.collected = true;
    } else if (item.y > height + 60) {
      item.missed = true;
      if (item.type === "material" || item.type === "fund") {
        game.score = Math.max(0, game.score - 15);
      }
    }
  }

  game.items = game.items.filter((item) => !item.collected && !item.missed);
}

function collectItem(item) {
  const config = itemTypes[item.type];
  const progressMultiplier = 1 - game.levelIndex * 0.08;
  game.score = Math.max(0, game.score + config.score);
  game.progress = clamp(game.progress + config.progress * progressMultiplier, 0, 100);
  game.integrity = clamp(game.integrity + config.integrity, 0, 100);
  game.budget = Math.max(0, game.budget + config.budget);
  setMessage(config.message, 1.2);

  const good = config.score > 0;
  burst(item.x, item.y, config.color, good ? 16 : 22);
  audio[good ? "good" : "bad"]();

  if (!good) {
    game.quake = 7;
  }
}

function completeLevel() {
  const current = levels[game.levelIndex];
  game.score += Math.round(350 + game.integrity * 2 + game.budget * 2);
  burst(width * 0.5, bridgeY() - 70, "#f5b642", 34);

  game.items = [];
  game.celebration.active = true;
  game.celebration.timer = 0;
  game.celebration.nextLevelIndex = game.levelIndex + 1;
  game.celebration.final = game.levelIndex >= levels.length - 1;
  game.budget += current.rewardBudget;
  prepareCelebrationVillagers();
  setMessage("Jembatan selesai! Warga menyeberang dengan aman.", 3);
  audio.win();
}

function updateLevelCelebration(dt) {
  game.celebration.timer += dt;
  game.messageTimer = Math.max(0, game.messageTimer - dt);
  updateVillagers(dt, { safeMode: true });

  if (Math.random() < dt * 18) {
    const x = bridgeRight() - 40 + Math.random() * 110;
    const y = bridgeY() - 26 - Math.random() * 70;
    burst(x, y, Math.random() > 0.5 ? "#f5b642" : "#1cad6f", 3);
  }

  const allCrossed = game.villagers.every((person) => person.x > bridgeRight() + 24);
  if (!allCrossed && game.celebration.timer < 5.2) return;

  if (game.celebration.final) {
    endGame(true, "Lima level selesai. Warga berhasil menyeberang, jembatan kuat, dan dana publik dipakai dengan benar.");
    return;
  }

  game.levelIndex = game.celebration.nextLevelIndex;
  game.progress = 0;
  game.elapsed = 0;
  game.timeLeft = levels[game.levelIndex].duration;
  game.spawnTimer = 1.15;
  game.celebration.active = false;
  resetVillagers();
  game.hintTimer = 5;
  setMessage(levels[game.levelIndex].message, 3);
}

function collidesWithPlayer(item) {
  const px = game.player.x - game.player.width * 0.5;
  const py = game.player.y - game.player.height * 0.5;
  return (
    item.x + item.size * 0.5 > px &&
    item.x - item.size * 0.5 < px + game.player.width &&
    item.y + item.size * 0.5 > py &&
    item.y - item.size * 0.5 < py + game.player.height
  );
}

function updateBackground(dt) {
  for (const cloud of game.clouds) {
    cloud.x += cloud.speed * dt;
    if (cloud.x - cloud.size > width + 30) {
      cloud.x = -cloud.size - Math.random() * 160;
      cloud.y = 56 + Math.random() * height * 0.25;
    }
  }
}

function resetVillagers() {
  const left = bridgeLeft();
  const level = levels[game.levelIndex];
  const spacing = Math.max(38, bridgeWidth() / (9 + game.levelIndex));
  const speed = bridgeWidth() / level.duration;
  const count = 7 + game.levelIndex;
  game.villagers = Array.from({ length: count }, (_, index) => ({
    x: left - 80 - index * spacing,
    y: bridgeY() + Math.random() * 18 - 9,
    speed,
    bob: Math.random() * Math.PI * 2,
    variant: index % 2,
    lead: index === 0
  }));
}

function prepareCelebrationVillagers() {
  const left = bridgeLeft();
  const spacing = Math.max(34, bridgeWidth() / 11);
  game.villagers = Array.from({ length: 9 }, (_, index) => ({
    x: left - 35 - index * spacing,
    y: bridgeY() + Math.random() * 18 - 9,
    speed: 92 + Math.random() * 24,
    bob: Math.random() * Math.PI * 2,
    variant: index % 2,
    lead: index === 0,
    cheering: false
  }));
}

function updateVillagers(dt, options = {}) {
  const left = bridgeLeft();
  const right = bridgeRight();
  const builtEdge = left + bridgeWidth() * (game.progress / 100);

  for (const person of game.villagers) {
    person.x += person.speed * dt;
    person.y = bridgeY() + (person.lead ? 0 : Math.sin(person.bob * 0.5) * 8);
    person.bob += dt * 8;

    if (!options.safeMode && person.x > left + 12 && person.x > builtEdge - 6 && game.progress < 100) {
      game.quake = 9;
      endGame(false, "Warga sudah sampai ke bagian jembatan yang belum dibangun. Proyek gagal karena jembatan belum aman dilalui.");
      return;
    }

    if (person.x > right + 44) {
      if (options.safeMode) {
        person.cheering = true;
        person.speed = 0;
        person.x = right + 48 + Math.random() * 72;
        person.y = bridgeY() + 50 + Math.random() * 22;
      } else {
        person.x = left - 220 - Math.random() * 90;
        person.lead = false;
      }
    }
  }
}

function endGame(won, reason) {
  if (game.ended) return;
  game.ended = true;
  game.score += won ? Math.round(game.integrity * 7 + game.budget * 4) : 0;
  highScore = Math.max(highScore, game.score);
  localStorage.setItem("bridgeSafeHighScore", String(highScore));

  audio[won ? "win" : "lose"]();
  ui.resultLabel.textContent = won ? "Proyek Bersih" : "Proyek Bermasalah";
  ui.resultTitle.textContent = won ? "Jembatan Aman!" : "Korupsi Merugikan";
  ui.resultMessage.textContent = reason;
  ui.finalScore.textContent = Math.round(game.score);
  ui.finalHighScore.textContent = highScore;
  ui.startHighScore.textContent = highScore;
  audio.stopBgm();

  setTimeout(() => setScene("gameover"), won ? 700 : 250);
}

function setMessage(text, duration) {
  game.message = text;
  game.messageTimer = duration;
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  localStorage.setItem("bridgeSafeMusicEnabled", String(musicEnabled));
  updateMusicButton();
  if (musicEnabled && scene === "playing") audio.startBgm();
  else audio.pauseBgm();
  audio.click();
}

function updateMusicButton() {
  buttons.music.classList.toggle("is-off", !musicEnabled);
  buttons.music.setAttribute("aria-pressed", String(musicEnabled));
  buttons.music.setAttribute("aria-label", musicEnabled ? "Musik aktif" : "Musik mati");
}

function updateParticles(dt) {
  for (const particle of game.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 60 * dt;
    particle.life -= dt;
  }
  game.particles = game.particles.filter((particle) => particle.life > 0);
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 34 + Math.random() * 115;
    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 3,
      color,
      spark: Math.random() < 0.16,
      life: 0.35 + Math.random() * 0.6
    });
  }
}

function draw() {
  const shakeX = (Math.random() - 0.5) * game.quake;
  const shakeY = (Math.random() - 0.5) * game.quake;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawSky();
  drawRiver();
  drawVillage();
  drawBridge();
  drawVillagers();
  drawItems();
  drawPlayer();
  drawParticles();
  drawMessage();
  ctx.restore();
}

function drawSky() {
  const theme = levels[game.levelIndex].theme;
  const map = assets.images.background;
  if (map.complete && map.naturalWidth) {
    ctx.drawImage(map, 0, 0, width, height);
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = theme.sky[0];
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, theme.sky[0]);
    gradient.addColorStop(0.46, theme.sky[1]);
    gradient.addColorStop(1, theme.sky[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  for (const cloud of game.clouds) {
    ctx.globalAlpha = cloud.alpha;
    ctx.fillStyle = "#ffffff";
    pill(cloud.x, cloud.y, cloud.size, cloud.size * 0.34, cloud.size * 0.18);
    circle(cloud.x + cloud.size * 0.22, cloud.y - cloud.size * 0.08, cloud.size * 0.2);
    circle(cloud.x + cloud.size * 0.46, cloud.y, cloud.size * 0.16);
    ctx.globalAlpha = 1;
  }
}

function drawRiver() {
  const theme = levels[game.levelIndex].theme;
  const riverTop = height * 0.45;
  const riverGradient = ctx.createLinearGradient(0, riverTop, 0, height);
  riverGradient.addColorStop(0, theme.river[0]);
  riverGradient.addColorStop(1, theme.river[1]);
  ctx.fillStyle = riverGradient;
  ctx.beginPath();
  ctx.moveTo(0, riverTop);
  ctx.bezierCurveTo(width * 0.24, riverTop + 40, width * 0.6, riverTop - 30, width, riverTop + 28);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i += 1) {
    const y = riverTop + 32 + i * 36 + Math.sin(performance.now() * 0.001 + i) * 8;
    ctx.beginPath();
    ctx.moveTo(-40, y);
    ctx.bezierCurveTo(width * 0.25, y - 18, width * 0.55, y + 18, width + 40, y - 5);
    ctx.stroke();
  }
}

function drawVillage() {
  const theme = levels[game.levelIndex].theme;
  const groundY = bridgeY() + 48;
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, groundY, width, height - groundY);
  ctx.fillStyle = theme.bank;
  ctx.fillRect(0, groundY, bridgeLeft() - 28, 22);
  ctx.fillRect(bridgeRight() + 28, groundY, width - bridgeRight(), 22);

  drawLandHouses(groundY, theme);
}

function drawHouse(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 24, 70, 46);
  ctx.fillStyle = "#9c4f36";
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 28);
  ctx.lineTo(x + 35, y);
  ctx.lineTo(x + 78, y + 28);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillRect(x + 12, y + 38, 14, 14);
  ctx.fillRect(x + 44, y + 38, 14, 14);
}

function drawHouseAsset(key, x, y, w, h, fallbackColor) {
  const image = assets.images[key];
  if (image?.complete && image.naturalWidth) {
    ctx.drawImage(image, x, y, w, h);
    return;
  }
  drawHouse(x + w * 0.12, y + h * 0.22, fallbackColor);
}

function drawLandHouses(groundY, theme) {
  const leftLimit = bridgeLeft() - 44;
  const rightStart = bridgeRight() + 44;
  const baseline = groundY + 4;
  const leftHouses = [
    { key: "houseYellow", x: 34, w: 126, h: 99, color: theme.houses[0] },
    { key: "houseBlueStilt", x: 178, w: 118, h: 101, color: theme.houses[1] },
    { key: "houseRed", x: 314, w: 106, h: 85, color: theme.houses[2] }
  ];
  const rightHouses = [
    { key: "houseYellow", offset: 34, w: 118, h: 93, color: theme.houses[0] },
    { key: "houseRed", offset: 176, w: 112, h: 90, color: theme.houses[2] },
    { key: "houseTeal", offset: 316, w: 132, h: 101, color: theme.houses[1] },
    { key: "houseBlueStilt", offset: 474, w: 112, h: 96, color: theme.houses[1] }
  ];

  for (const house of leftHouses) {
    if (house.x + house.w <= leftLimit) {
      drawHouseAsset(house.key, house.x, baseline - house.h, house.w, house.h, house.color);
    }
  }

  for (const house of rightHouses) {
    const x = rightStart + house.offset;
    if (x + house.w <= width - 16) {
      drawHouseAsset(house.key, x, baseline - house.h, house.w, house.h, house.color);
    }
  }
}

function drawBridge() {
  const left = bridgeLeft();
  const right = bridgeRight();
  const y = bridgeY();
  const progress = game.progress / 100;
  const builtRight = left + bridgeWidth() * progress;
  const levelTint = levels[game.levelIndex].theme.bridge;

  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(62, 39, 25, 0.24)";
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.moveTo(left - 18, y + 28);
  ctx.lineTo(right + 18, y + 28);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.52)";
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.quadraticCurveTo(width * 0.5, y - 28, right, y);
  ctx.stroke();

  const bridgeImage = assets.images.bridge;
  if (bridgeImage.complete && bridgeImage.naturalWidth) {
    const assetX = left - 58;
    const assetY = y - 82;
    const assetWidth = bridgeWidth() + 116;
    const assetHeight = 132;
    ctx.save();
    ctx.beginPath();
    ctx.rect(assetX, assetY, assetWidth * progress, assetHeight);
    ctx.clip();
    ctx.globalAlpha = game.integrity > 40 ? 1 : 0.78;
    ctx.drawImage(bridgeImage, assetX, assetY, assetWidth, assetHeight);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  ctx.strokeStyle = "rgba(232,77,91,0.8)";
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 7]);
  ctx.beginPath();
  ctx.moveTo(builtRight, y - 42);
  ctx.lineTo(builtRight, y + 44);
  ctx.stroke();
  ctx.setLineDash([]);

  if (!bridgeImage.complete || !bridgeImage.naturalWidth) {
    ctx.strokeStyle = game.integrity > 40 ? levelTint : "#7d3d37";
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.quadraticCurveTo(width * 0.5, y - 28, builtRight, y - Math.sin(progress * Math.PI) * 28);
    ctx.stroke();

    ctx.strokeStyle = "#58351f";
    ctx.lineWidth = 5;
    for (let x = left + 18; x < builtRight; x += 34) {
      ctx.beginPath();
      ctx.moveTo(x, y - 12);
      ctx.lineTo(x, y + 16);
      ctx.stroke();
    }
  }

  ctx.fillStyle = "rgba(16,32,45,0.72)";
  pill(width * 0.5 - 56, y - 86, 112, 34, 17);
  ctx.fillStyle = "#fff";
  ctx.font = "900 15px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`L${game.levelIndex + 1} ${Math.round(game.progress)}%`, width * 0.5, y - 69);
}

function drawVillagers() {
  for (const person of game.villagers) {
    const bob = Math.sin(person.bob) * 2;
    if (person.cheering) {
      if (drawVillagerImage(person, 0.62, bob)) {
        ctx.strokeStyle = "#10202d";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(person.x - 5, person.y - 30);
        ctx.lineTo(person.x - 17, person.y - 44 - bob);
        ctx.moveTo(person.x + 5, person.y - 30);
        ctx.lineTo(person.x + 17, person.y - 44 + bob);
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(16,32,45,0.14)";
        pill(person.x - 13, person.y + 8, 26, 8, 4);
        ctx.strokeStyle = "#10202d";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(person.x - 5, person.y - 6);
        ctx.lineTo(person.x - 16, person.y - 20 - bob);
        ctx.moveTo(person.x + 5, person.y - 6);
        ctx.lineTo(person.x + 16, person.y - 20 + bob);
        ctx.stroke();
        ctx.fillStyle = "#10202d";
        circle(person.x, person.y - 17 + bob, 6);
        ctx.fillStyle = "#f5b642";
        pill(person.x - 6, person.y - 12 + bob, 12, 19, 7);
      }
      continue;
    }

    if (person.lead) {
      ctx.fillStyle = "rgba(16,32,45,0.68)";
      pill(person.x - 48, person.y - 58, 96, 25, 13);
      ctx.fillStyle = "#fff";
      ctx.font = "800 12px Inter, system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Warga lewat", person.x, person.y - 45);
    }
    if (drawVillagerImage(person, 0.58, bob)) {
      if (person.speed > 0) {
        ctx.strokeStyle = "rgba(16,32,45,0.75)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(person.x - 11, person.y - 1 + bob);
        ctx.lineTo(person.x - 18, person.y + 7 - bob);
        ctx.moveTo(person.x + 11, person.y - 1 - bob);
        ctx.lineTo(person.x + 18, person.y + 7 + bob);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = "#10202d";
      circle(person.x, person.y - 17 + bob, 6);
      ctx.fillStyle = "#18a999";
      pill(person.x - 6, person.y - 12 + bob, 12, 19, 7);
    }
  }

  if (game.celebration.active) {
    const alpha = Math.min(1, game.celebration.timer * 1.8);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(16,32,45,0.74)";
    pill(width / 2 - 92, bridgeY() - 136, 184, 44, 22);
    ctx.fillStyle = "#fff";
    ctx.font = "950 22px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("HORE!", width / 2, bridgeY() - 114);
    ctx.globalAlpha = 1;
  }
}

function drawVillagerImage(person, scale, bob) {
  const image = person.variant === 1 ? assets.images.villagerFemale : assets.images.villagerMale;
  if (!image?.complete || !image.naturalWidth) return false;
  const drawWidth = 96 * scale;
  const drawHeight = 112 * scale;
  ctx.drawImage(
    image,
    person.x - drawWidth * 0.5,
    person.y - drawHeight + 13 + bob,
    drawWidth,
    drawHeight
  );
  return true;
}

function drawVillagerSprite(image, person, frame, scale, bob) {
  const drawWidth = 96 * scale;
  const drawHeight = 112 * scale;
  const sourceY = (person.variant || 0) * 112;
  ctx.drawImage(
    image,
    frame * 96,
    sourceY,
    96,
    112,
    person.x - drawWidth * 0.5,
    person.y - drawHeight + 13 + bob,
    drawWidth,
    drawHeight
  );
}

function drawItems() {
  for (const item of game.items) {
    const config = itemTypes[item.type];
    const image = assets.images[config.image];
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.spin * 0.15);
    if (image?.complete && image.naturalWidth) {
      const drawSize = item.size * 2.08;
      ctx.drawImage(image, -drawSize * 0.5, -drawSize * 0.5, drawSize, drawSize);
    } else {
      ctx.fillStyle = "rgba(16,32,45,0.16)";
      circle(3, 5, item.size * 0.56);
      ctx.fillStyle = config.color;
      drawItemIcon(config.icon, item.size);
    }
    ctx.restore();
  }
}

function drawItemIcon(icon, size) {
  if (icon === "coin" || icon === "bag") {
    circle(0, 0, size * 0.5);
    ctx.fillStyle = "#fff";
    pill(-size * 0.22, -size * 0.22, size * 0.44, size * 0.5, 5);
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    pill(-size * 0.34, -size * 0.05, size * 0.68, size * 0.16, 3);
    return;
  }

  if (icon === "envelope") {
    pill(-size * 0.55, -size * 0.38, size * 1.1, size * 0.76, 6);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-size * 0.48, -size * 0.26);
    ctx.lineTo(0, 3);
    ctx.lineTo(size * 0.48, -size * 0.26);
    ctx.stroke();
    return;
  }

  if (icon === "crack") {
    pill(-size * 0.52, -size * 0.32, size * 1.04, size * 0.64, 6);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-6, -10);
    ctx.lineTo(1, -2);
    ctx.lineTo(-4, 3);
    ctx.lineTo(8, 11);
    ctx.stroke();
    return;
  }

  pill(-size * 0.58, -size * 0.25, size * 1.16, size * 0.5, 6);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  pill(-size * 0.4, -size * 0.09, size * 0.8, size * 0.18, 3);
}

function drawPlayer() {
  const p = game.player;
  const moving = input.left || input.right;
  const wheelBob = moving ? Math.sin(performance.now() / 90) * 2 : 0;
  const cabinBob = moving ? Math.sin(performance.now() / 130) * 1.4 : 0;

  ctx.fillStyle = "rgba(16,32,45,0.16)";
  pill(p.x - 58, p.y + 17, 116, 16, 8);

  ctx.fillStyle = "#10202d";
  pill(p.x - p.width * 0.5, p.y - p.height * 0.5, p.width, p.height, 9);
  ctx.fillStyle = "#2675ff";
  pill(p.x - 34, p.y - 26 + cabinBob, 68, 27, 8);
  ctx.fillStyle = "#fff";
  ctx.font = "900 12px Inter, system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ANTI SUAP", p.x, p.y - 12 + cabinBob);

  ctx.fillStyle = "#f5b642";
  circle(p.x - 34, p.y + 15 + wheelBob, 9);
  circle(p.x + 34, p.y + 15 - wheelBob, 9);

  if (moving) {
    ctx.strokeStyle = "rgba(255,255,255,0.72)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x - 18, p.y + 15 + wheelBob);
    ctx.lineTo(p.x - 50, p.y + 15 - wheelBob);
    ctx.moveTo(p.x + 18, p.y + 15 - wheelBob);
    ctx.lineTo(p.x + 50, p.y + 15 + wheelBob);
    ctx.stroke();
  }
}

function drawParticles() {
  const spark = assets.images.vfx;
  for (const particle of game.particles) {
    ctx.globalAlpha = Math.max(0, particle.life * 1.8);
    if (particle.spark && spark.complete && spark.naturalWidth) {
      const size = particle.radius * 7;
      ctx.drawImage(spark, particle.x - size * 0.5, particle.y - size * 0.5, size, size);
    } else {
      ctx.fillStyle = particle.color;
      circle(particle.x, particle.y, particle.radius);
    }
    ctx.globalAlpha = 1;
  }
}

function drawMessage() {
  if (scene !== "playing" || game.messageTimer <= 0) return;
  const alpha = Math.min(1, game.messageTimer);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(16, 32, 45, 0.74)";
  pill(width / 2 - 220, height * 0.22, 440, 42, 21);
  ctx.fillStyle = "#fff";
  ctx.font = "800 15px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(game.message, width / 2, height * 0.22 + 21, 400);
  ctx.globalAlpha = 1;
}

function updateHud() {
  ui.score.textContent = Math.max(0, Math.round(game.score));
  ui.level.textContent = `${game.levelIndex + 1}/${levels.length}`;
  ui.budget.textContent = Math.max(0, Math.round(game.budget));
  ui.time.textContent = Math.ceil(game.timeLeft);
  ui.integrity.textContent = `${Math.round(game.integrity)}%`;
  ui.missionText.textContent = levels[game.levelIndex].name;
  ui.levelGoal.textContent = levels[game.levelIndex].goal;
  ui.missionPanel.classList.toggle("level-hint-hidden", scene === "playing" && game.hintTimer <= 0 && !game.celebration.active);
  ui.strengthFill.style.transform = `scaleX(${game.progress / 100})`;
  ui.strengthFill.style.filter = game.integrity < 35 ? "saturate(1.8)" : "none";
  ui.startHighScore.textContent = highScore;
}

function circle(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function pill(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function playerY() {
  return Math.min(height - 92, bridgeY() + 158);
}

function bridgeY() {
  return Math.max(288, height * 0.52);
}

function bridgeWidth() {
  return Math.min(560, width * 0.62);
}

function bridgeLeft() {
  return width * 0.5 - bridgeWidth() * 0.5;
}

function bridgeRight() {
  return width * 0.5 + bridgeWidth() * 0.5;
}

function gameLoop(time) {
  const dt = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

buttons.start.addEventListener("click", () => {
  audio.click();
  setScene("story");
});
buttons.storyStart.addEventListener("click", startGame);
buttons.closeStory.addEventListener("click", () => {
  audio.click();
  setScene("start");
});
buttons.pause.addEventListener("click", pauseGame);
buttons.music.addEventListener("click", toggleMusic);
buttons.resume.addEventListener("click", resumeGame);
buttons.restart.addEventListener("click", startGame);
buttons.restartPause.addEventListener("click", startGame);
buttons.backToStart.addEventListener("click", () => {
  audio.click();
  setScene("start");
});
buttons.how.addEventListener("click", () => {
  audio.click();
  setScene("how");
});
buttons.closeHow.addEventListener("click", () => {
  audio.click();
  setScene("start");
});

document.querySelectorAll("[data-action]").forEach((button) => {
  const action = button.dataset.action;
  button.addEventListener("pointerdown", () => { input[action] = true; });
  button.addEventListener("pointerup", () => { input[action] = false; });
  button.addEventListener("pointercancel", () => { input[action] = false; });
  button.addEventListener("pointerleave", () => { input[action] = false; });
});

window.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft" || event.code === "KeyA") input.left = true;
  if (event.code === "ArrowRight" || event.code === "KeyD") input.right = true;
  if (event.code === "Escape") {
    if (scene === "playing") pauseGame();
    else if (scene === "paused") resumeGame();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ArrowLeft" || event.code === "KeyA") input.left = false;
  if (event.code === "ArrowRight" || event.code === "KeyD") input.right = false;
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
updateHud();
updateMusicButton();
setScene("start");
requestAnimationFrame(gameLoop);
