/**
 * Desi Mela 3D - 180° Aiming, Flying Bullet Tracers & Universal Attempt Scorecards
 */

class DesiMelaGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Game Mode State: 'ring' | 'balloon' | 'hathoda' | 'can' | 'gulel' | 'kuan' | 'dhanush' | 'train'
    this.mode = 'ring';
    this.score = 0;
    this.attemptsLeft = 5;
    this.prizesWon = 0;

    // Progression System
    this.balloonLevel = parseInt(localStorage.getItem('mela_balloon_level') || '1');
    this.maxLevels = 20;
    this.poppedThisRound = 0;
    this.targetToPass = 3;

    // Hathoda Tod State (3 Attempts)
    this.hathodaSwinging = false;
    this.hathodaProgress = 0;
    this.puckY = 0;
    this.puckTargetY = 0;
    this.puckMoving = false;
    this.bellRingsCount = 0;

    // Score Tracking Arrays per Attempt (Attempt 1 to 5)
    this.attemptScores = [];

    // Can Pyramid Smash State
    this.cans = [];
    this.activeBall = null;
    this.cansKnocked = 0;

    // Gulel & Matkas State
    this.matkas = [];
    this.activePebble = null;
    this.matkasShattered = 0;

    // Kuan Khel State
    this.glasses = [];
    this.activeCoin = null;
    this.coinsLandedInGlass = 0;
    this.waterRippleTime = 0;

    // Teer Dhanush State
    this.bowTension = 0;
    this.windSpeed = 1.5;
    this.activeArrow = null;
    this.targetAngle = 0;
    this.arrowsHit = 0;

    // Mela Toy Train State
    this.trainX = 0;
    this.trainSpeed = 3.5;
    this.trainTargets = [];
    this.trainHits = 0;
    this.activeBullet = null;

    // Coins Economy (Welcome Bonus: 100 Coins)
    this.coins = parseInt(localStorage.getItem('mela_coins') || '100');

    // Daily Energy System (5 Games per Day)
    this.maxEnergy = 5;
    this.energy = this.loadEnergy();
    this.nextRechargeTime = parseInt(localStorage.getItem('mela_next_recharge') || '0');

    // Dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Audio Context
    this.audioCtx = null;

    // Aim & Power Meter State
    this.isHolding = false;
    this.pointerPos = { x: this.width / 2, y: this.height * 0.4 };
    this.power = 0;
    this.powerDirection = 1;
    this.powerSpeed = 2.4;
    this.aimAngle = -Math.PI / 2;

    // Animated Hand State
    this.handThrowing = false;
    this.handAnimProgress = 0;

    // Scope Aiming State
    this.isScoping = false;
    this.scopePos = { x: this.width / 2, y: this.height / 2 };
    this.scopeSwayTime = 0;
    this.rifleZoomProgress = 0;

    // Active Flying Ring & Landed Rings Array
    this.activeRing = null;
    this.landedRings = [];

    // Ferris Wheel Animation Angle
    this.ferrisAngle = 0;

    // Real Mela Items Array
    this.items = [
      { id: 1, type: 'thumsup', name: 'Thums Up Bottle', color: '#1a0000', label: 'ThumsUp', x: 0.20, y: 0.35, radius: 24, value: 200, coinReward: 15 },
      { id: 2, type: 'mangojuice', name: 'Mango Juice Box', color: '#ff9e00', label: 'Mango', x: 0.38, y: 0.35, radius: 26, value: 150, coinReward: 15 },
      { id: 3, type: 'fanta', name: 'Fanta Bottle', color: '#ff5400', label: 'Fanta', x: 0.56, y: 0.35, radius: 24, value: 180, coinReward: 15 },
      { id: 4, type: 'parleg', name: 'Parle-G Packet', color: '#ffb703', label: 'Parle-G', x: 0.74, y: 0.35, radius: 28, value: 100, coinReward: 15 },

      { id: 5, type: 'cadbury', name: 'Cadbury Dairy Milk', color: '#3c096c', label: 'DairyMilk', x: 0.22, y: 0.48, radius: 28, value: 150, coinReward: 15 },
      { id: 6, type: 'soap', name: 'Fresh Up Soap Box', color: '#ff0055', label: 'FreshUp', x: 0.40, y: 0.48, radius: 25, value: 120, coinReward: 15 },
      { id: 7, type: 'sevenup', name: '7Up Green Bottle', color: '#38b000', label: '7UP', x: 0.58, y: 0.48, radius: 24, value: 180, coinReward: 15 },
      { id: 8, type: 'cash500', name: '₹500 Cash Note', color: '#52b788', label: '₹ 500', x: 0.76, y: 0.48, radius: 26, value: 300, coinReward: 15 },

      { id: 9, type: 'tiffin', name: 'Stainless Steel Tiffin', color: '#ced4da', label: 'Tiffin', x: 0.28, y: 0.60, radius: 32, value: 250, coinReward: 15 },
      { id: 10, type: 'auto', name: 'Toy Auto-Rickshaw', color: '#ffb703', label: 'AUTO', x: 0.50, y: 0.58, radius: 36, value: 300, coinReward: 15 },
      { id: 11, type: 'juicecarton', name: 'Orange Juice Box', color: '#f77f00', label: 'Juice', x: 0.72, y: 0.60, radius: 28, value: 150, coinReward: 15 }
    ];

    // Balloon Targets & Particles
    this.balloons = [];
    this.particles = [];

    this.init();
  }

  loadEnergy() {
    const saved = localStorage.getItem('mela_daily_energy');
    if (saved === null) {
      localStorage.setItem('mela_daily_energy', '5');
      return 5;
    }
    return parseInt(saved);
  }

  saveEnergy(val) {
    this.energy = Math.max(0, Math.min(this.maxEnergy, val));
    localStorage.setItem('mela_daily_energy', this.energy.toString());
    this.updateUI();
  }

  addCoins(amount) {
    this.coins += amount;
    localStorage.setItem('mela_coins', this.coins.toString());
    this.updateUI();
  }

  spendCoins(amount) {
    if (this.coins >= amount) {
      this.coins -= amount;
      localStorage.setItem('mela_coins', this.coins.toString());
      this.updateUI();
      return true;
    }
    return false;
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // User Touch & Mouse Interactions
    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e.clientX, e.clientY));
    this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e.clientX, e.clientY));
    this.canvas.addEventListener('mouseup', () => this.handlePointerUp());

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches[0]) this.handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches[0]) this.handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => this.handlePointerUp());

    // Top-Left Action Icons
    const btnBulb = document.getElementById('btn-help-bulb');
    if (btnBulb) {
      btnBulb.addEventListener('click', () => {
        const modal = document.getElementById('help-modal-overlay');
        if (modal) modal.classList.add('active');
      });
    }

    const closeHelp = document.getElementById('close-help-modal');
    if (closeHelp) {
      closeHelp.addEventListener('click', () => {
        const modal = document.getElementById('help-modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    }

    const btnCloseHelp = document.getElementById('btn-close-help');
    if (btnCloseHelp) {
      btnCloseHelp.addEventListener('click', () => {
        const modal = document.getElementById('help-modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    }

    const btnIconRestart = document.getElementById('btn-icon-restart');
    if (btnIconRestart) {
      btnIconRestart.addEventListener('click', () => this.startOverFromLevelOne());
    }

    // 2-Step Main Menu Event Handlers
    const btnStart = document.getElementById('btn-start-game');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        const stepLanding = document.getElementById('menu-step-landing');
        if (stepLanding) stepLanding.classList.add('hidden');

        const stepSelect = document.getElementById('menu-step-select');
        if (stepSelect) stepSelect.classList.remove('hidden');
      });
    }

    const btnQuit = document.getElementById('btn-quit-game');
    if (btnQuit) {
      btnQuit.addEventListener('click', () => {
        alert('Thank you for playing Desi Mela 3D!');
      });
    }

    const btnBackMenu = document.getElementById('btn-back-menu');
    if (btnBackMenu) {
      btnBackMenu.addEventListener('click', () => {
        const stepSelect = document.getElementById('menu-step-select');
        if (stepSelect) stepSelect.classList.add('hidden');

        const stepLanding = document.getElementById('menu-step-landing');
        if (stepLanding) stepLanding.classList.remove('hidden');
      });
    }

    // All Game Mode Card Listeners
    const bindModeCard = (id, modeKey) => {
      const card = document.getElementById(id);
      if (card) {
        card.addEventListener('click', () => {
          this.switchMode(modeKey);
          this.closeMainMenu();
        });
      }
    };

    bindModeCard('card-mode-ring', 'ring');
    bindModeCard('card-mode-balloon', 'balloon');
    bindModeCard('card-mode-hathoda', 'hathoda');
    bindModeCard('card-mode-can', 'can');
    bindModeCard('card-mode-gulel', 'gulel');
    bindModeCard('card-mode-kuan', 'kuan');
    bindModeCard('card-mode-dhanush', 'dhanush');
    bindModeCard('card-mode-train', 'train');

    // Header Navigation Buttons
    const btnOpenMainMenu = document.getElementById('btn-open-main-menu');
    if (btnOpenMainMenu) {
      btnOpenMainMenu.addEventListener('click', () => {
        this.openMainMenuLanding();
      });
    }

    const btnOpenChooseGame = document.getElementById('btn-open-choose-game');
    if (btnOpenChooseGame) {
      btnOpenChooseGame.addEventListener('click', () => {
        this.openMainMenuChoose();
      });
    }

    const modalClose = document.getElementById('modal-close-btn');
    if (modalClose) modalClose.addEventListener('click', () => this.closeModal());

    // Modal Close ✖ Icons
    const closeWin = document.getElementById('close-win-modal');
    if (closeWin) closeWin.addEventListener('click', () => this.closeModal());

    const closeShots = document.getElementById('close-shots-modal');
    if (closeShots) {
      closeShots.addEventListener('click', () => {
        const modal = document.getElementById('shots-modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    }

    const closePass = document.getElementById('close-pass-modal');
    if (closePass) {
      closePass.addEventListener('click', () => {
        const modal = document.getElementById('level-passed-modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    }

    const closeEnergy = document.getElementById('close-energy-modal');
    if (closeEnergy) {
      closeEnergy.addEventListener('click', () => {
        const modal = document.getElementById('energy-modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    }

    // Next Level Button
    const btnNextLevel = document.getElementById('btn-next-level');
    if (btnNextLevel) {
      btnNextLevel.addEventListener('click', () => {
        const modal = document.getElementById('level-passed-modal-overlay');
        if (modal) modal.classList.remove('active');

        this.balloonLevel = Math.min(this.maxLevels, this.balloonLevel + 1);
        localStorage.setItem('mela_balloon_level', this.balloonLevel.toString());

        this.attemptsLeft = 5;
        this.poppedThisRound = 0;
        this.resetBalloons();
        this.updateUI();
      });
    }

    // Start Over Button on Failure
    const btnModalRestart = document.getElementById('btn-modal-restart');
    if (btnModalRestart) {
      btnModalRestart.addEventListener('click', () => {
        const modal = document.getElementById('shots-modal-overlay');
        if (modal) modal.classList.remove('active');
        this.startOverFromLevelOne();
      });
    }

    // Out of Shots Modal Actions
    const btnBuyShotsCoin = document.getElementById('btn-buy-shots-coin');
    if (btnBuyShotsCoin) {
      btnBuyShotsCoin.addEventListener('click', () => {
        if (this.spendCoins(250)) {
          this.attemptsLeft += (this.mode === 'hathoda') ? 2 : 3;
          this.updateUI();
          const modal = document.getElementById('shots-modal-overlay');
          if (modal) modal.classList.remove('active');
        } else {
          alert('Not enough coins (Need 250 Coins)! Watch an ad to continue level.');
        }
      });
    }

    const btnBuyShotsAd = document.getElementById('btn-buy-shots-ad');
    if (btnBuyShotsAd) {
      btnBuyShotsAd.addEventListener('click', () => {
        this.watchAdForShots();
      });
    }

    // Energy Modal & Rewarded Ad Buttons
    const btnBuyEnergyCoin = document.getElementById('btn-buy-energy-coin');
    if (btnBuyEnergyCoin) {
      btnBuyEnergyCoin.addEventListener('click', () => {
        if (this.spendCoins(500)) {
          this.saveEnergy(this.energy + 1);
          const modal = document.getElementById('energy-modal-overlay');
          if (modal) modal.classList.remove('active');
        } else {
          alert('Not enough coins (Need 500 Coins)! Watch an ad or wait for recharge.');
        }
      });
    }

    const btnWatchAd = document.getElementById('btn-watch-ad');
    if (btnWatchAd) btnWatchAd.addEventListener('click', () => this.watchRewardedAdForEnergy());

    const btnCloseEnergy = document.getElementById('btn-close-energy');
    if (btnCloseEnergy) {
      btnCloseEnergy.addEventListener('click', () => {
        const modal = document.getElementById('energy-modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    }

    this.openMainMenuLanding();
    this.updateUI();
    this.startEnergyRechargeTimer();
    this.loop();
  }

  openMainMenuLanding() {
    const menu = document.getElementById('main-menu-overlay');
    if (menu) menu.classList.remove('hidden');

    const stepLanding = document.getElementById('menu-step-landing');
    if (stepLanding) stepLanding.classList.remove('hidden');

    const stepSelect = document.getElementById('menu-step-select');
    if (stepSelect) stepSelect.classList.add('hidden');
  }

  openMainMenuChoose() {
    const menu = document.getElementById('main-menu-overlay');
    if (menu) menu.classList.remove('hidden');

    const stepLanding = document.getElementById('menu-step-landing');
    if (stepLanding) stepLanding.classList.add('hidden');

    const stepSelect = document.getElementById('menu-step-select');
    if (stepSelect) stepSelect.classList.remove('hidden');
  }

  closeMainMenu() {
    const menu = document.getElementById('main-menu-overlay');
    if (menu) menu.classList.add('hidden');
  }

  startOverFromLevelOne() {
    const mShots = document.getElementById('shots-modal-overlay');
    if (mShots) mShots.classList.remove('active');

    const mPass = document.getElementById('level-passed-modal-overlay');
    if (mPass) mPass.classList.remove('active');

    const mWin = document.getElementById('modal-overlay');
    if (mWin) mWin.classList.remove('active');

    if (!this.checkEnergyBeforeGame()) return;

    this.saveEnergy(this.energy - 1);

    this.balloonLevel = 1;
    localStorage.setItem('mela_balloon_level', '1');

    this.attemptsLeft = (this.mode === 'hathoda') ? 3 : 5;
    this.poppedThisRound = 0;
    this.bellRingsCount = 0;
    this.cansKnocked = 0;
    this.matkasShattered = 0;
    this.coinsLandedInGlass = 0;
    this.arrowsHit = 0;
    this.trainHits = 0;
    this.attemptScores = [];
    this.landedRings = [];
    this.updateUI();

    if (this.mode === 'balloon') {
      this.resetBalloons();
    } else if (this.mode === 'can') {
      this.resetCans();
    } else if (this.mode === 'gulel') {
      this.resetMatkas();
    } else if (this.mode === 'kuan') {
      this.resetWaterGlasses();
    } else if (this.mode === 'train') {
      this.resetTrainTargets();
    }
  }

  startEnergyRechargeTimer() {
    setInterval(() => {
      const now = Date.now();
      if (this.nextRechargeTime > 0 && now >= this.nextRechargeTime) {
        this.saveEnergy(this.maxEnergy);
        this.nextRechargeTime = 0;
        localStorage.removeItem('mela_next_recharge');
      }

      if (this.energy <= 0 && this.nextRechargeTime > 0) {
        const remainingMs = Math.max(0, this.nextRechargeTime - now);
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        const formatTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        const btn = document.getElementById('btn-close-energy');
        if (btn) btn.innerText = `WAIT (${formatTime})`;
      }
    }, 1000);
  }

  watchAdForShots() {
    const btn = document.getElementById('btn-buy-shots-ad');
    if (btn) {
      btn.innerText = '🎬 LOADING AD...';
      btn.disabled = true;
    }

    setTimeout(() => {
      this.attemptsLeft += (this.mode === 'hathoda') ? 2 : 3;
      this.updateUI();
      const modal = document.getElementById('shots-modal-overlay');
      if (modal) modal.classList.remove('active');
      if (btn) {
        btn.innerText = '🎬 WATCH AD TO CONTINUE LEVEL';
        btn.disabled = false;
      }
    }, 2500);
  }

  watchRewardedAdForEnergy() {
    const btn = document.getElementById('btn-watch-ad');
    if (btn) {
      btn.innerText = '🎬 LOADING AD...';
      btn.disabled = true;
    }

    setTimeout(() => {
      this.saveEnergy(this.energy + 1);
      const modal = document.getElementById('energy-modal-overlay');
      if (modal) modal.classList.remove('active');
      if (btn) {
        btn.innerText = '🎬 WATCH AD (+1 ⚡)';
        btn.disabled = false;
      }
      this.showWinModal('ENERGY REFILLED!', '⚡ You received +1 bonus game play from watching the ad!', '🎉');
    }, 3000);
  }

  checkEnergyBeforeGame() {
    if (this.energy <= 0) {
      if (this.nextRechargeTime === 0) {
        this.nextRechargeTime = Date.now() + 3600000;
        localStorage.setItem('mela_next_recharge', this.nextRechargeTime.toString());
      }
      const modal = document.getElementById('energy-modal-overlay');
      if (modal) modal.classList.add('active');
      return false;
    }
    return true;
  }

  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playPopSound() {
    this.initAudio();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(1, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.08);
  }

  playBellSound() {
    this.initAudio();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + 0.4);

    gain.gain.setValueAtTime(1, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.4);
  }

  playBoomSound() {
    this.initAudio();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.25);

    gain.gain.setValueAtTime(1, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.25);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    if (this.mode === 'balloon') {
      this.resetBalloons();
    } else if (this.mode === 'can') {
      this.resetCans();
    } else if (this.mode === 'gulel') {
      this.resetMatkas();
    } else if (this.mode === 'kuan') {
      this.resetWaterGlasses();
    } else if (this.mode === 'train') {
      this.resetTrainTargets();
    }
  }

  switchMode(newMode) {
    this.mode = newMode;

    const levelPill = document.getElementById('level-pill');
    if (levelPill) {
      levelPill.style.display = (newMode === 'balloon') ? 'flex' : 'none';
    }

    this.attemptsLeft = (newMode === 'hathoda') ? 3 : 5;
    this.poppedThisRound = 0;
    this.bellRingsCount = 0;
    this.cansKnocked = 0;
    this.matkasShattered = 0;
    this.coinsLandedInGlass = 0;
    this.arrowsHit = 0;
    this.trainHits = 0;
    this.attemptScores = [];
    this.landedRings = [];
    this.updateUI();

    if (newMode === 'balloon') {
      this.resetBalloons();
    } else if (newMode === 'can') {
      this.resetCans();
    } else if (newMode === 'gulel') {
      this.resetMatkas();
    } else if (newMode === 'kuan') {
      this.resetWaterGlasses();
    } else if (newMode === 'train') {
      this.resetTrainTargets();
    }
  }

  // --- GAME 4: CAN PYRAMID SMASH ---
  resetCans() {
    this.cans = [];
    this.cansKnocked = 0;
    this.activeBall = null;

    const crateX = this.width * 0.5;
    const crateY = this.height * 0.52;
    const canW = 28;
    const canH = 42;

    let id = 1;
    for (let row = 0; row < 4; row++) {
      const count = 4 - row;
      const startX = crateX - ((count - 1) * (canW + 4)) / 2;
      const y = crateY - row * (canH + 2);

      for (let c = 0; c < count; c++) {
        this.cans.push({
          id: id++,
          x: startX + c * (canW + 4),
          y: y,
          vx: 0,
          vy: 0,
          standing: true,
          color: (id % 2 === 0) ? '#d90429' : '#ffb703',
          brand: (id % 2 === 0) ? 'THUMS' : 'PARLE'
        });
      }
    }
  }

  throwRubberBall() {
    this.attemptsLeft--;
    this.updateUI();

    const startX = this.width / 2;
    const startY = this.height - 60;

    const minDist = this.height * 0.22;
    const maxDist = this.height * 0.68;
    const dist = minDist + (this.power / 100) * (maxDist - minDist);

    const targetX = startX + Math.cos(this.aimAngle) * dist;
    const targetY = startY + Math.sin(this.aimAngle) * dist;

    this.activeBall = {
      x: startX,
      y: startY,
      targetX,
      targetY,
      progress: 0,
      radius: 18
    };
  }

  // --- GAME 5: GULEL & MATKAS ---
  resetMatkas() {
    this.matkas = [];
    this.matkasShattered = 0;
    this.activePebble = null;

    for (let m = 0; m < 5; m++) {
      this.matkas.push({
        id: m + 1,
        x: (this.width * 0.20) + m * (this.width * 0.15),
        y: (this.height * 0.32) + (m % 2) * 35,
        radius: 22,
        shattered: false,
        swingOffset: Math.random() * Math.PI * 2
      });
    }
  }

  shootGulelPebble() {
    this.attemptsLeft--;
    this.updateUI();

    const startX = this.width / 2;
    const startY = this.height - 80;

    const minDist = this.height * 0.3;
    const maxDist = this.height * 0.7;
    const dist = minDist + (this.power / 100) * (maxDist - minDist);

    const targetX = startX + Math.cos(this.aimAngle) * dist;
    const targetY = startY + Math.sin(this.aimAngle) * dist;

    this.activePebble = {
      x: startX,
      y: startY,
      targetX,
      targetY,
      progress: 0
    };
  }

  // --- GAME 6: KUAN KHEL (WATER COIN TOSS) ---
  resetWaterGlasses() {
    this.glasses = [
      { x: this.width * 0.5, y: this.height * 0.45, radius: 28, isCenter: true },
      { x: this.width * 0.35, y: this.height * 0.38, radius: 24, isCenter: false },
      { x: this.width * 0.65, y: this.height * 0.38, radius: 24, isCenter: false },
      { x: this.width * 0.42, y: this.height * 0.55, radius: 24, isCenter: false },
      { x: this.width * 0.58, y: this.height * 0.55, radius: 24, isCenter: false }
    ];
    this.coinsLandedInGlass = 0;
    this.activeCoin = null;
  }

  tossWaterCoin() {
    this.attemptsLeft--;
    this.updateUI();

    const startX = this.width / 2;
    const startY = this.height - 60;

    const minDist = this.height * 0.25;
    const maxDist = this.height * 0.65;
    const dist = minDist + (this.power / 100) * (maxDist - minDist);

    const devX = (Math.random() - 0.5) * 20;

    const targetX = startX + Math.cos(this.aimAngle) * dist + devX;
    const targetY = startY + Math.sin(this.aimAngle) * dist;

    this.activeCoin = {
      x: startX,
      y: startY,
      targetX,
      targetY,
      progress: 0
    };
  }

  // --- GAME 7: TEER DHANUSH ---
  shootTeerArrow() {
    this.attemptsLeft--;
    this.updateUI();

    const startX = this.width / 2;
    const startY = this.height - 70;

    const minDist = this.height * 0.3;
    const maxDist = this.height * 0.7;
    const dist = minDist + (this.power / 100) * (maxDist - minDist);

    const targetX = startX + Math.cos(this.aimAngle) * dist + (Math.random() - 0.5) * 15;
    const targetY = startY + Math.sin(this.aimAngle) * dist;

    this.activeArrow = {
      x: startX,
      y: startY,
      targetX,
      targetY,
      progress: 0
    };
  }

  // --- GAME 8: MELA TOY TRAIN ---
  resetTrainTargets() {
    this.trainX = 0;
    this.trainHits = 0;
    this.activeBullet = null;
    this.trainTargets = [
      { id: 1, offset: 0, hit: false },
      { id: 2, offset: 80, hit: false },
      { id: 3, offset: 160, hit: false },
      { id: 4, offset: 240, hit: false },
      { id: 5, offset: 320, hit: false }
    ];
  }

  resetBalloons() {
    this.balloons = [];
    this.poppedThisRound = 0;
    const colors = ['#ff2a6d', '#05d9e8', '#ffb703', '#38b000', '#ff007f', '#9d4edd'];
    const levelSpeed = (0.6 + this.balloonLevel * 0.4);

    const startMinX = this.width * 0.15;
    const spacingX = this.width * 0.11;

    for (let r = 0; r < 3; r++) {
      const rowDirection = (r % 2 === 0) ? -1 : 1;
      for (let c = 0; c < 6; c++) {
        this.balloons.push({
          x: startMinX + c * spacingX,
          y: (this.height * 0.30) + r * 68,
          radius: 18,
          color: colors[(r * 6 + c) % colors.length],
          popped: false,
          speed: levelSpeed * rowDirection
        });
      }
    }
  }

  handlePointerDown(x, y) {
    const mainMenu = document.getElementById('main-menu-overlay');
    if (mainMenu && !mainMenu.classList.contains('hidden')) return;

    if (this.attemptsLeft <= 0) {
      this.evaluateLevelResult();
      return;
    }

    if (this.mode === 'balloon' || this.mode === 'train') {
      this.isScoping = true;
      this.scopePos = { x, y };
      const scopeEl = document.getElementById('scope-overlay');
      if (scopeEl) scopeEl.classList.add('visible');

      if (navigator.vibrate) {
        navigator.vibrate([15, 30, 15]);
      }
      return;
    }

    this.isHolding = true;
    this.power = 0;
    this.powerDirection = 1;
    this.pointerPos = { x, y };
    const powerEl = document.getElementById('power-meter');
    if (powerEl) powerEl.classList.add('visible');
  }

  handlePointerMove(x, y) {
    if (this.isScoping) {
      this.scopePos = { x, y };
    }
    if (this.isHolding) {
      this.pointerPos = { x, y };
    }
  }

  handlePointerUp() {
    if (this.isScoping) {
      this.isScoping = false;
      const scopeEl = document.getElementById('scope-overlay');
      if (scopeEl) scopeEl.classList.remove('visible');

      if (this.attemptsLeft > 0) {
        const swayX = Math.sin(this.scopeSwayTime * 3.5) * 14;
        const swayY = Math.cos(this.scopeSwayTime * 2.8) * 14;

        if (this.mode === 'balloon') {
          this.shootBalloon(this.scopePos.x + swayX, this.scopePos.y + swayY);
        } else if (this.mode === 'train') {
          this.shootTrainTarget(this.scopePos.x + swayX, this.scopePos.y + swayY);
        }
      }
      return;
    }

    if (this.isHolding) {
      this.isHolding = false;
      const powerEl = document.getElementById('power-meter');
      if (powerEl) powerEl.classList.remove('visible');

      if (this.attemptsLeft > 0) {
        if (this.mode === 'ring') {
          this.startHandThrowAnimation();
        } else if (this.mode === 'hathoda') {
          this.swingHathoda();
        } else if (this.mode === 'can') {
          this.throwRubberBall();
        } else if (this.mode === 'gulel') {
          this.shootGulelPebble();
        } else if (this.mode === 'kuan') {
          this.tossWaterCoin();
        } else if (this.mode === 'dhanush') {
          this.shootTeerArrow();
        }
      }
    }
  }

  swingHathoda() {
    this.attemptsLeft--;
    this.updateUI();
    this.hathodaSwinging = true;
    this.hathodaProgress = 0;

    const baseAnvilY = this.height * 0.82;
    const topBellY = this.height * 0.22;
    const maxDist = baseAnvilY - topBellY;

    this.puckY = baseAnvilY;
    this.puckTargetY = baseAnvilY - (this.power / 100) * maxDist;
    this.puckMoving = false;
  }

  shootBalloon(clickX, clickY) {
    if (this.attemptsLeft <= 0) return;

    this.attemptsLeft--;
    this.updateUI();
    this.playPopSound();

    let hit = false;
    for (let b of this.balloons) {
      if (!b.popped) {
        const dist = Math.hypot(clickX - b.x, clickY - b.y);
        if (dist <= b.radius + 4) {
          b.popped = true;
          hit = true;
          this.poppedThisRound++;
          this.score += 100;
          this.attemptScores.push(100);
          this.spawnParticles(b.x, b.y, b.color);
          this.prizesWon++;
          break;
        }
      }
    }

    if (!hit) {
      this.attemptScores.push(0);
    }

    if (this.attemptsLeft === 0) {
      setTimeout(() => this.evaluateLevelResult(), 600);
    }
  }

  shootTrainTarget(clickX, clickY) {
    if (this.attemptsLeft <= 0) return;

    this.attemptsLeft--;
    this.updateUI();
    this.playPopSound();

    const startX = this.width / 2;
    const startY = this.height - 40;

    // Launch visible glowing BB bullet pellet tracer!
    this.activeBullet = {
      x: startX,
      y: startY,
      targetX: clickX,
      targetY: clickY,
      progress: 0
    };
  }

  evaluateLevelResult() {
    if (this.mode === 'balloon') {
      if (this.poppedThisRound >= this.targetToPass) {
        const coinEarned = (this.poppedThisRound === 5) ? 25 : 15;
        this.addCoins(coinEarned);

        const titleEl = document.getElementById('level-pass-title');
        if (titleEl) titleEl.innerText = `LEVEL ${this.balloonLevel} PASSED! 🎉`;

        const descEl = document.getElementById('level-pass-desc');
        if (descEl) descEl.innerText = `Great shooting! You popped ${this.poppedThisRound}/5 balloons and earned +${coinEarned} 🪙 Coins! Advance to Level ${Math.min(this.maxLevels, this.balloonLevel + 1)}.`;

        const modal = document.getElementById('level-passed-modal-overlay');
        if (modal) modal.classList.add('active');
      } else {
        const titleEl = document.getElementById('shots-title');
        if (titleEl) titleEl.innerText = `LEVEL ${this.balloonLevel} FAILED!`;

        const descEl = document.getElementById('shots-desc');
        if (descEl) descEl.innerText = `You popped ${this.poppedThisRound}/5 balloons (Needed ${this.targetToPass}). Watch an ad or spend 250 Coins to CONTINUE Level ${this.balloonLevel}!`;

        const modal = document.getElementById('shots-modal-overlay');
        if (modal) modal.classList.add('active');
      }
    } else if (this.mode === 'hathoda') {
      const totalScore = this.attemptScores.reduce((a, b) => a + b, 0);
      if (this.bellRingsCount >= 1 || totalScore >= 2400) {
        this.addCoins(25);
        this.showWinModal('HATHODA CHAMPION! 🔨', `🎉 Incredible Strength! Total Score: ${totalScore} pts (${this.bellRingsCount} Bell Rings)! Won +25 🪙 Coins!`, '🔔');
      } else {
        const modal = document.getElementById('shots-modal-overlay');
        if (modal) modal.classList.add('active');
      }
    } else if (this.mode === 'can') {
      if (this.cansKnocked >= 6) {
        this.addCoins(20);
        this.showWinModal('PYRAMID SMASHED! 🥫', `🎉 Awesome Throw! You knocked down ${this.cansKnocked}/10 Cans and won +20 🪙 Coins!`, '🥫');
      } else {
        const modal = document.getElementById('shots-modal-overlay');
        if (modal) modal.classList.add('active');
      }
    } else if (this.mode === 'gulel') {
      if (this.matkasShattered >= 3) {
        this.addCoins(20);
        this.showWinModal('GULEL MASTER! 🎯', `🎉 Perfect Aim! You shattered ${this.matkasShattered}/5 Clay Matkas and won +20 🪙 Coins!`, '🏺');
      } else {
        const modal = document.getElementById('shots-modal-overlay');
        if (modal) modal.classList.add('active');
      }
    } else if (this.mode === 'kuan') {
      if (this.coinsLandedInGlass >= 2) {
        this.addCoins(25);
        this.showWinModal('KUAN KHEL WINNER! 🪙', `🎉 Great Fluid Precision! You landed ${this.coinsLandedInGlass} coins in glass bowls and won +25 🪙 Coins!`, '🌊');
      } else {
        const modal = document.getElementById('shots-modal-overlay');
        if (modal) modal.classList.add('active');
      }
    } else if (this.mode === 'dhanush') {
      if (this.arrowsHit >= 3) {
        this.addCoins(25);
        this.showWinModal('TEER DHANUSH ARCHER! 🏹', `🎉 Master Archer! You hit ${this.arrowsHit}/5 Targets and won +25 🪙 Coins!`, '🏹');
      } else {
        const modal = document.getElementById('shots-modal-overlay');
        if (modal) modal.classList.add('active');
      }
    } else if (this.mode === 'train') {
      if (this.trainHits >= 3) {
        this.addCoins(25);
        this.showWinModal('TOY TRAIN MASTER! 🚂', `🎉 Sharp Shooting! You hit ${this.trainHits}/5 Train Targets and won +25 🪙 Coins!`, '🚂');
      } else {
        const modal = document.getElementById('shots-modal-overlay');
        if (modal) modal.classList.add('active');
      }
    } else {
      const modal = document.getElementById('shots-modal-overlay');
      if (modal) modal.classList.add('active');
    }
  }

  spawnParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 6 + 3,
        color: color,
        life: 1.0
      });
    }
  }

  showWinModal(title, desc, icon) {
    const iconEl = document.getElementById('modal-icon');
    if (iconEl) iconEl.innerText = icon;

    const titleEl = document.getElementById('modal-title');
    if (titleEl) titleEl.innerText = title;

    const descEl = document.getElementById('modal-desc');
    if (descEl) descEl.innerText = desc;

    const modal = document.getElementById('modal-overlay');
    if (modal) modal.classList.add('active');
  }

  closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.classList.remove('active');
  }

  updateUI() {
    const levelEl = document.getElementById('level-value');
    if (levelEl) levelEl.innerText = `Lvl ${this.balloonLevel}/${this.maxLevels}`;

    const scoreEl = document.getElementById('score-value');
    if (scoreEl) scoreEl.innerText = this.score;

    const attemptsEl = document.getElementById('attempts-value');
    if (attemptsEl) attemptsEl.innerText = this.attemptsLeft;

    const energyEl = document.getElementById('energy-value');
    if (energyEl) energyEl.innerText = `${this.energy}/${this.maxEnergy}`;

    const coinsEl = document.getElementById('coins-value');
    if (coinsEl) coinsEl.innerText = this.coins;
  }

  update() {
    this.ferrisAngle += 0.005;
    this.waterRippleTime += 0.05;
    this.targetAngle += 0.02;
    this.trainX += this.trainSpeed;

    if (this.isScoping) {
      this.rifleZoomProgress = Math.min(1, this.rifleZoomProgress + 0.15);
    } else {
      this.rifleZoomProgress = Math.max(0, this.rifleZoomProgress - 0.15);
    }

    if (this.handThrowing) {
      this.handAnimProgress += 0.08;
      if (this.handAnimProgress >= 0.4 && !this.activeRing) {
        this.tossRing();
      }
      if (this.handAnimProgress >= 1) {
        this.handThrowing = false;
        this.handAnimProgress = 0;
      }
    }

    if (this.hathodaSwinging) {
      this.hathodaProgress += 0.1;
      if (this.hathodaProgress >= 1) {
        this.hathodaSwinging = false;
        this.puckMoving = true;
        this.playBoomSound();

        if (navigator.vibrate) {
          navigator.vibrate([40, 60, 40]);
        }
      }
    }

    if (this.puckMoving) {
      this.puckY -= 14;
      if (this.puckY <= this.puckTargetY) {
        this.puckY = this.puckTargetY;
        this.puckMoving = false;

        const attemptPts = Math.round(this.power * 10);
        this.attemptScores.push(attemptPts);

        const topBellY = this.height * 0.22;
        if (this.puckTargetY <= topBellY + 10) {
          this.playBellSound();
          this.bellRingsCount++;
          this.score += 300;
          this.spawnParticles(this.width * 0.35, topBellY, '#ffd700');
        } else {
          this.score += attemptPts;
        }

        this.updateUI();

        if (this.attemptsLeft === 0) {
          setTimeout(() => this.evaluateLevelResult(), 800);
        }
      }
    }

    // Active Bullet Flight Physics (Mela Toy Train)
    if (this.activeBullet) {
      this.activeBullet.progress += 0.12; // Fast bullet tracer flight
      if (this.activeBullet.progress >= 1) {
        this.activeBullet.progress = 1;

        // Collision Check against train targets
        const trainY = this.height * 0.45;
        let hit = false;

        for (let t of this.trainTargets) {
          if (!t.hit) {
            const tx = (this.trainX + t.offset) % (this.width + 200) - 100;
            const dist = Math.hypot(this.activeBullet.targetX - tx, this.activeBullet.targetY - trainY);

            if (dist <= 26) {
              t.hit = true;
              hit = true;
              this.trainHits++;
              this.score += 150;
              this.attemptScores.push(150);
              this.spawnParticles(tx, trainY, '#ffd700');
              break;
            }
          }
        }

        if (!hit) {
          this.attemptScores.push(0);
        }

        this.activeBullet = null;
        this.updateUI();

        if (this.attemptsLeft === 0) {
          setTimeout(() => this.evaluateLevelResult(), 600);
        }
      }
    }

    // Active Rubber Ball Physics (Can Smash)
    if (this.activeBall) {
      this.activeBall.progress += 0.04;
      if (this.activeBall.progress >= 1) {
        this.activeBall.progress = 1;
        this.checkBallCanCollision(this.activeBall.targetX, this.activeBall.targetY);
        this.activeBall = null;
      }
    }

    // Active Pebble Physics (Gulel)
    if (this.activePebble) {
      this.activePebble.progress += 0.04;
      if (this.activePebble.progress >= 1) {
        this.activePebble.progress = 1;
        this.checkPebbleMatkaCollision(this.activePebble.targetX, this.activePebble.targetY);
        this.activePebble = null;
      }
    }

    // Active Coin Physics (Kuan Khel)
    if (this.activeCoin) {
      this.activeCoin.progress += 0.035;
      if (this.activeCoin.progress >= 1) {
        this.activeCoin.progress = 1;
        this.checkCoinWaterLanding(this.activeCoin.targetX, this.activeCoin.targetY);
        this.activeCoin = null;
      }
    }

    // Active Arrow Physics (Teer Dhanush)
    if (this.activeArrow) {
      this.activeArrow.progress += 0.05;
      if (this.activeArrow.progress >= 1) {
        this.activeArrow.progress = 1;
        this.checkArrowTargetCollision(this.activeArrow.targetX, this.activeArrow.targetY);
        this.activeArrow = null;
      }
    }

    // Cans Physics Tumble
    for (let c of this.cans) {
      if (!c.standing) {
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.8;
      }
    }

    if (this.mode === 'balloon') {
      const minX = this.width * 0.1;
      const maxX = this.width * 0.9;

      for (let b of this.balloons) {
        if (!b.popped) {
          b.x += b.speed;
          if (b.speed > 0 && b.x > maxX) {
            b.x = minX;
          } else if (b.speed < 0 && b.x < minX) {
            b.x = maxX;
          }
        }
      }
    }

    if (this.isScoping) {
      this.scopeSwayTime += 0.09;
      const swayX = Math.sin(this.scopeSwayTime * 3.5) * 14;
      const swayY = Math.cos(this.scopeSwayTime * 2.8) * 14;

      const scopeEl = document.getElementById('scope-overlay');
      if (scopeEl) {
        scopeEl.style.left = `${this.scopePos.x + swayX}px`;
        scopeEl.style.top = `${this.scopePos.y + swayY}px`;
      }
    }

    if (this.isHolding) {
      this.power += this.powerSpeed * this.powerDirection;
      if (this.power >= 100) {
        this.power = 100;
        this.powerDirection = -1;
      } else if (this.power <= 0) {
        this.power = 0;
        this.powerDirection = 1;
      }

      const powerFill = document.getElementById('power-fill');
      if (powerFill) powerFill.style.height = `${this.power}%`;

      const powerText = document.getElementById('power-text');
      if (powerText) powerText.innerText = `${Math.round(this.power * 10)} PTS`;

      const startX = this.width / 2;
      const startY = this.height - 70;
      this.aimAngle = Math.atan2(this.pointerPos.y - startY, this.pointerPos.x - startX);
    }

    if (this.activeRing) {
      this.activeRing.progress += this.activeRing.speed;
      if (this.activeRing.progress >= 1) {
        this.activeRing.progress = 1;
        this.checkRingLanding(this.activeRing.targetX, this.activeRing.targetY);
        this.activeRing = null;
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  checkBallCanCollision(bx, by) {
    this.playBoomSound();
    let hitCount = 0;

    for (let c of this.cans) {
      if (c.standing) {
        const dist = Math.hypot(bx - c.x, by - c.y);
        if (dist <= 45) {
          c.standing = false;
          c.vx = (Math.random() - 0.5) * 12;
          c.vy = -Math.random() * 10 - 4;
          hitCount++;
          this.cansKnocked++;
          this.score += 100;
          this.spawnParticles(c.x, c.y, c.color);
        }
      }
    }

    this.attemptScores.push(hitCount * 100);
    this.updateUI();

    if (this.attemptsLeft === 0) {
      setTimeout(() => this.evaluateLevelResult(), 1000);
    }
  }

  checkPebbleMatkaCollision(px, py) {
    this.playPopSound();
    let hit = false;

    for (let m of this.matkas) {
      if (!m.shattered) {
        const dist = Math.hypot(px - m.x, py - m.y);
        if (dist <= m.radius + 10) {
          m.shattered = true;
          hit = true;
          this.matkasShattered++;
          this.score += 150;
          this.attemptScores.push(150);
          this.spawnParticles(m.x, m.y, '#d48c6a');
          break;
        }
      }
    }

    if (!hit) {
      this.attemptScores.push(0);
    }

    this.updateUI();

    if (this.attemptsLeft === 0) {
      setTimeout(() => this.evaluateLevelResult(), 800);
    }
  }

  checkCoinWaterLanding(cx, cy) {
    this.playClackSound();
    let hit = false;

    for (let g of this.glasses) {
      const dist = Math.hypot(cx - g.x, cy - g.y);
      if (dist <= g.radius) {
        hit = true;
        this.coinsLandedInGlass++;
        const pts = g.isCenter ? 250 : 150;
        this.score += pts;
        this.attemptScores.push(pts);
        this.spawnParticles(g.x, g.y, '#00f5d4');
        break;
      }
    }

    if (!hit) {
      this.attemptScores.push(0);
    }

    this.updateUI();

    if (this.attemptsLeft === 0) {
      setTimeout(() => this.evaluateLevelResult(), 800);
    }
  }

  checkArrowTargetCollision(ax, ay) {
    this.playClackSound();

    const targetX = this.width * 0.5;
    const targetY = this.height * 0.38;
    const dist = Math.hypot(ax - targetX, ay - targetY);

    if (dist <= 65) {
      this.arrowsHit++;
      const pts = (dist <= 18) ? 300 : 150;
      this.score += pts;
      this.attemptScores.push(pts);
      this.spawnParticles(ax, ay, '#ffd700');
    } else {
      this.attemptScores.push(0);
    }

    this.updateUI();

    if (this.attemptsLeft === 0) {
      setTimeout(() => this.evaluateLevelResult(), 800);
    }
  }

  checkRingLanding(rx, ry) {
    this.playClackSound();
    let claimed = false;

    for (let item of this.items) {
      const itemPx = item.x * this.width;
      const itemPy = item.y * this.height;
      const dist = Math.hypot(rx - itemPx, ry - itemPy);

      if (dist <= item.radius) {
        claimed = true;
        this.score += item.value;
        this.addCoins(item.coinReward);
        this.attemptScores.push(item.value);
        this.prizesWon++;
        this.landedRings.push({ x: itemPx, y: itemPy, scale: 0.42 });
        this.updateUI();
        this.showWinModal('PRIZE CLAIMED!', `🎉 Perfect Aim! You landed on ${item.name} and earned +${item.coinReward} 🪙 Coins!`, '🎁');
        break;
      }
    }

    if (!claimed) {
      this.attemptScores.push(0);
      this.landedRings.push({ x: rx, y: ry, scale: 0.42 });
      if (this.attemptsLeft === 0) {
        setTimeout(() => {
          const modal = document.getElementById('shots-modal-overlay');
          if (modal) modal.classList.add('active');
        }, 1000);
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.mode === 'ring') {
      this.renderOutdoorMelaSky();
      this.renderRingStallRedTable();
    } else if (this.mode === 'balloon') {
      this.renderBalloonStallGallery();
    } else if (this.mode === 'hathoda') {
      this.renderHathodaHighStrikerGame();
    } else if (this.mode === 'can') {
      this.renderCanPyramidGame();
    } else if (this.mode === 'gulel') {
      this.renderGulelMatkaGame();
    } else if (this.mode === 'kuan') {
      this.renderKuanKhelWaterGame();
    } else if (this.mode === 'dhanush') {
      this.renderTeerDhanushGame();
    } else if (this.mode === 'train') {
      this.renderMelaToyTrainGame();
    } else {
      this.renderOutdoorMelaSky();
    }

    // Universal Attempt Scorecard for Middle-Right Side
    this.renderUniversalScoreCard();

    for (let p of this.particles) {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;
  }

  renderUniversalScoreCard() {
    const cardX = this.width * 0.70;
    const cardY = this.height * 0.28;
    const cardW = 190;
    const totalMaxAttempts = (this.mode === 'hathoda') ? 3 : 5;
    const cardH = 50 + totalMaxAttempts * 28 + 35;

    this.ctx.save();

    // Glassmorphism Box
    this.ctx.fillStyle = 'rgba(15, 5, 30, 0.85)';
    this.ctx.fillRect(cardX, cardY, cardW, cardH);
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeRect(cardX, cardY, cardW, cardH);

    // Title Header
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 12px Poppins';
    this.ctx.textAlign = 'center';

    const gameTitles = {
      ring: '⭕ RING TOSS',
      balloon: '🎈 BALLOON SHOOT',
      hathoda: '🔨 HATHODA SCORES',
      can: '🥫 CAN SMASH',
      gulel: '🎯 GULEL MATKAS',
      kuan: '🪙 KUAN KHEL',
      dhanush: '🏹 TEER DHANUSH',
      train: '🚂 TOY TRAIN'
    };

    this.ctx.fillText(gameTitles[this.mode] || 'SCORES', cardX + cardW / 2, cardY + 22);

    this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(cardX + 12, cardY + 30);
    this.ctx.lineTo(cardX + cardW - 12, cardY + 30);
    this.ctx.stroke();

    // Attempts Rows
    let totalScore = 0;
    for (let a = 1; a <= totalMaxAttempts; a++) {
      const rowY = cardY + 32 + a * 28;
      const pts = this.attemptScores[a - 1];

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '600 11px Poppins';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`Shot ${a}:`, cardX + 16, rowY);

      this.ctx.textAlign = 'right';
      if (pts !== undefined) {
        totalScore += pts;
        this.ctx.fillStyle = (pts > 0) ? '#00f5d4' : '#ff4d6d';
        this.ctx.fillText(`${pts} pts`, cardX + cardW - 16, rowY);
      } else {
        this.ctx.fillStyle = 'rgba(255,255,255,0.35)';
        this.ctx.fillText('---', cardX + cardW - 16, rowY);
      }
    }

    // Divider Line
    const dividerY = cardY + 32 + totalMaxAttempts * 28 + 8;
    this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    this.ctx.beginPath();
    this.ctx.moveTo(cardX + 12, dividerY);
    this.ctx.lineTo(cardX + cardW - 12, dividerY);
    this.ctx.stroke();

    // Total Score Row
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 12px Poppins';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('TOTAL:', cardX + 16, dividerY + 20);

    this.ctx.textAlign = 'right';
    this.ctx.fillText(`${totalScore} PTS`, cardX + cardW - 16, dividerY + 20);

    this.ctx.restore();
  }

  renderOutdoorMelaSky() {
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#120224');
    grad.addColorStop(0.4, '#2d0a42');
    grad.addColorStop(0.75, '#5c1d4a');
    grad.addColorStop(1, '#8c3d38');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.renderFerrisWheel(this.width * 0.15, this.height * 0.22, 60);

    this.ctx.fillStyle = 'rgba(20, 5, 30, 0.7)';
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height * 0.28);
    this.ctx.lineTo(this.width * 0.3, this.height * 0.20);
    this.ctx.lineTo(this.width * 0.5, this.height * 0.26);
    this.ctx.lineTo(this.width * 0.8, this.height * 0.22);
    this.ctx.lineTo(this.width, this.height * 0.28);
    this.ctx.lineTo(this.width, this.height * 0.32);
    this.ctx.lineTo(0, this.height * 0.32);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = '#0a0212';
    for (let c = 0; c < 12; c++) {
      const cx = (c * (this.width / 12)) + 20;
      this.ctx.beginPath();
      this.ctx.arc(cx, this.height * 0.32 - 12, 10, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillRect(cx - 8, this.height * 0.32 - 2, 16, 20);
    }
  }

  renderFerrisWheel(x, y, radius) {
    this.ctx.save();
    this.ctx.translate(x, y);

    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-30, radius + 30);
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(30, radius + 30);
    this.ctx.stroke();

    this.ctx.rotate(this.ferrisAngle);
    this.ctx.strokeStyle = '#00f5d4';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      this.ctx.stroke();

      const gx = Math.cos(angle) * radius;
      const gy = Math.sin(angle) * radius;
      this.ctx.fillStyle = (i % 2 === 0) ? '#ff0055' : '#ffb703';
      this.ctx.fillRect(gx - 5, gy - 5, 10, 10);
    }

    this.ctx.restore();
  }

  // --- RENDER GAME 4: CAN PYRAMID SMASH ---
  renderCanPyramidGame() {
    this.renderOutdoorMelaSky();

    const crateX = this.width * 0.5;
    const crateY = this.height * 0.52;

    this.ctx.fillStyle = '#5c2d12';
    this.ctx.fillRect(crateX - 110, crateY, 220, 120);
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(crateX - 110, crateY, 220, 120);

    for (let c of this.cans) {
      this.ctx.fillStyle = c.color;
      this.ctx.fillRect(c.x - 14, c.y - 20, 28, 40);
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(c.x - 14, c.y - 20, 28, 40);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 8px Poppins';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(c.brand, c.x, c.y + 3);
    }

    const startX = this.width / 2;
    const startY = this.height - 60;

    if (this.isHolding) {
      const minDist = this.height * 0.22;
      const maxDist = this.height * 0.68;
      const dist = minDist + (this.power / 100) * (maxDist - minDist);

      const endX = startX + Math.cos(this.aimAngle) * dist;
      const endY = startY + Math.sin(this.aimAngle) * dist;

      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
      this.ctx.lineWidth = 3.5;
      this.ctx.setLineDash([8, 6]);
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      this.ctx.strokeStyle = '#ff0055';
      this.ctx.lineWidth = 3.5;
      this.ctx.beginPath();
      this.ctx.arc(endX, endY, 20, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.fillStyle = 'rgba(255, 0, 85, 0.25)';
      this.ctx.fill();
    }

    if (this.activeBall) {
      const p = this.activeBall.progress;
      const bx = this.activeBall.x + (this.activeBall.targetX - this.activeBall.x) * p;
      const by = this.activeBall.y + (this.activeBall.targetY - this.activeBall.y) * p - Math.sin(p * Math.PI) * 80;
      const r = 22 * (1 - p * 0.4);

      this.ctx.fillStyle = '#ff0055';
      this.ctx.beginPath();
      this.ctx.arc(bx, by, r, 0, Math.PI * 2);
      this.ctx.fill();
    }

    if (!this.activeBall) {
      this.ctx.fillStyle = '#e0a996';
      this.ctx.beginPath();
      this.ctx.arc(startX, startY, 24, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ff0055';
      this.ctx.beginPath();
      this.ctx.arc(startX, startY - 10, 18, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  // --- RENDER GAME 5: GULEL & MATKAS WITH 180° AIMING & TRAJECTORY LINE ---
  renderGulelMatkaGame() {
    this.renderOutdoorMelaSky();

    for (let m of this.matkas) {
      if (!m.shattered) {
        const swingX = m.x + Math.sin(this.ferrisAngle * 2 + m.swingOffset) * 12;

        this.ctx.strokeStyle = '#d48c6a';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(swingX, 0);
        this.ctx.lineTo(swingX, m.y);
        this.ctx.stroke();

        this.ctx.fillStyle = '#a0522d';
        this.ctx.beginPath();
        this.ctx.arc(swingX, m.y, m.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(swingX - 12, m.y - m.radius - 4, 24, 6);
      }
    }

    const gx = this.width / 2;
    const gy = this.height - 40;

    if (this.isHolding) {
      const minDist = this.height * 0.25;
      const maxDist = this.height * 0.70;
      const dist = minDist + (this.power / 100) * (maxDist - minDist);

      const endX = gx + Math.cos(this.aimAngle) * dist;
      const endY = gy + Math.sin(this.aimAngle) * dist;

      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
      this.ctx.lineWidth = 3.5;
      this.ctx.setLineDash([8, 6]);
      this.ctx.beginPath();
      this.ctx.moveTo(gx, gy - 40);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    if (this.activePebble) {
      const p = this.activePebble.progress;
      const px = this.activePebble.x + (this.activePebble.targetX - this.activePebble.x) * p;
      const py = this.activePebble.y + (this.activePebble.targetY - this.activePebble.y) * p;

      this.ctx.fillStyle = '#6c757d';
      this.ctx.beginPath();
      this.ctx.arc(px, py, 10 * (1 - p * 0.5), 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.strokeStyle = '#5c2d12';
    this.ctx.lineWidth = 14;
    this.ctx.lineCap = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(gx, this.height);
    this.ctx.lineTo(gx, gy);
    this.ctx.lineTo(gx - 35, gy - 60);
    this.ctx.moveTo(gx, gy);
    this.ctx.lineTo(gx + 35, gy - 60);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#ff0055';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(gx - 35, gy - 60);
    this.ctx.lineTo(gx, gy + (this.isHolding ? 30 : -20));
    this.ctx.lineTo(gx + 35, gy - 60);
    this.ctx.stroke();
  }

  // --- RENDER GAME 6: KUAN KHEL WITH 180° AIMING & TRAJECTORY LINE ---
  renderKuanKhelWaterGame() {
    this.ctx.fillStyle = '#03045e';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const tubX = this.width * 0.5;
    const tubY = this.height * 0.45;
    const tubR = Math.min(this.width, this.height) * 0.38;

    this.ctx.fillStyle = '#ffd700';
    this.ctx.beginPath();
    this.ctx.arc(tubX, tubY, tubR + 12, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#0077b6';
    this.ctx.beginPath();
    this.ctx.arc(tubX, tubY, tubR, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    this.ctx.lineWidth = 2;
    for (let r = 1; r <= 3; r++) {
      const ripR = (tubR * 0.3 * r + Math.sin(this.waterRippleTime + r) * 10) % tubR;
      this.ctx.beginPath();
      this.ctx.arc(tubX, tubY, ripR, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    for (let g of this.glasses) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.beginPath();
      this.ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();

      if (g.isCenter) {
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = 'bold 9px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('BONUS', g.x, g.y + 3);
      }
    }

    const startX = this.width / 2;
    const startY = this.height - 60;

    if (this.isHolding) {
      const minDist = this.height * 0.22;
      const maxDist = this.height * 0.65;
      const dist = minDist + (this.power / 100) * (maxDist - minDist);

      const endX = startX + Math.cos(this.aimAngle) * dist;
      const endY = startY + Math.sin(this.aimAngle) * dist;

      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
      this.ctx.lineWidth = 3.5;
      this.ctx.setLineDash([8, 6]);
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      this.ctx.strokeStyle = '#ffd700';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(endX, endY, 16, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    if (this.activeCoin) {
      const p = this.activeCoin.progress;
      const cx = this.activeCoin.x + (this.activeCoin.targetX - this.activeCoin.x) * p;
      const cy = this.activeCoin.y + (this.activeCoin.targetY - this.activeCoin.y) * p;

      this.ctx.fillStyle = '#ffd700';
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 14 * (1 - p * 0.3), 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#ff8c00';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  // --- RENDER GAME 7: TEER DHANUSH WITH 180° AIMING & TRAJECTORY LINE ---
  renderTeerDhanushGame() {
    this.renderOutdoorMelaSky();

    const targetX = this.width * 0.5;
    const targetY = this.height * 0.38;

    this.ctx.save();
    this.ctx.translate(targetX, targetY);

    const rings = [65, 48, 32, 16];
    const colors = ['#d90429', '#ffffff', '#d90429', '#ffd700'];

    for (let i = 0; i < rings.length; i++) {
      this.ctx.fillStyle = colors[i];
      this.ctx.beginPath();
      this.ctx.arc(0, 0, rings[i], 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();

    const bx = this.width / 2;
    const by = this.height - 40;

    if (this.isHolding) {
      const minDist = this.height * 0.25;
      const maxDist = this.height * 0.70;
      const dist = minDist + (this.power / 100) * (maxDist - minDist);

      const endX = bx + Math.cos(this.aimAngle) * dist;
      const endY = by + Math.sin(this.aimAngle) * dist;

      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
      this.ctx.lineWidth = 3.5;
      this.ctx.setLineDash([8, 6]);
      this.ctx.beginPath();
      this.ctx.moveTo(bx, by - 40);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    this.ctx.strokeStyle = '#ffb703';
    this.ctx.lineWidth = 8;
    this.ctx.beginPath();
    this.ctx.arc(bx, by + 40, 70, Math.PI * 1.15, Math.PI * 1.85);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(bx - 60, by - 10);
    this.ctx.lineTo(bx, by + (this.isHolding ? 35 : 0));
    this.ctx.lineTo(bx + 60, by - 10);
    this.ctx.stroke();

    if (!this.activeArrow) {
      this.ctx.fillStyle = '#6c757d';
      this.ctx.fillRect(bx - 3, by - 60, 6, 80);
      this.ctx.fillStyle = '#ff0055';
      this.ctx.beginPath();
      this.ctx.moveTo(bx, by - 72);
      this.ctx.lineTo(bx - 8, by - 60);
      this.ctx.lineTo(bx + 8, by - 60);
      this.ctx.closePath();
      this.ctx.fill();
    }

    if (this.activeArrow) {
      const p = this.activeArrow.progress;
      const ax = this.activeArrow.x + (this.activeArrow.targetX - this.activeArrow.x) * p;
      const ay = this.activeArrow.y + (this.activeArrow.targetY - this.activeArrow.y) * p;

      this.ctx.fillStyle = '#6c757d';
      this.ctx.fillRect(ax - 2, ay - 30, 4, 40);
    }
  }

  // --- RENDER GAME 8: MELA TOY TRAIN TARGET WITH FLYING BULLET TRACER ---
  renderMelaToyTrainGame() {
    this.renderOutdoorMelaSky();

    const trainY = this.height * 0.45;

    this.ctx.strokeStyle = '#6c757d';
    this.ctx.lineWidth = 6;
    this.ctx.beginPath();
    this.ctx.moveTo(0, trainY + 20);
    this.ctx.lineTo(this.width, trainY + 20);
    this.ctx.stroke();

    for (let t of this.trainTargets) {
      const tx = (this.trainX + t.offset) % (this.width + 200) - 100;

      this.ctx.fillStyle = '#d90429';
      this.ctx.fillRect(tx - 30, trainY - 10, 60, 28);

      this.ctx.fillStyle = '#111111';
      this.ctx.beginPath();
      this.ctx.arc(tx - 18, trainY + 20, 8, 0, Math.PI * 2);
      this.ctx.arc(tx + 18, trainY + 20, 8, 0, Math.PI * 2);
      this.ctx.fill();

      if (!t.hit) {
        this.ctx.fillStyle = '#ffd700';
        this.ctx.beginPath();
        this.ctx.arc(tx, trainY - 30, 20, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ff0055';
        this.ctx.beginPath();
        this.ctx.arc(tx, trainY - 30, 10, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Active Flying BB Pellet Bullet Tracer for Toy Train!
    if (this.activeBullet) {
      const p = this.activeBullet.progress;
      const bx = this.activeBullet.x + (this.activeBullet.targetX - this.activeBullet.x) * p;
      const by = this.activeBullet.y + (this.activeBullet.targetY - this.activeBullet.y) * p;

      this.ctx.fillStyle = '#ffd700';
      this.ctx.beginPath();
      this.ctx.arc(bx, by, 8 * (1 - p * 0.4), 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    this.renderFirstPersonAirRifle();
  }

  renderHathodaHighStrikerGame() {
    this.renderOutdoorMelaSky();

    const towerX = this.width * 0.35;
    const baseAnvilY = this.height * 0.82;
    const topBellY = this.height * 0.22;

    this.ctx.fillStyle = '#1e2124';
    this.ctx.fillRect(towerX - 60, baseAnvilY, 120, 40);
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(towerX - 60, baseAnvilY, 120, 40);

    this.ctx.fillStyle = '#2b1055';
    this.ctx.fillRect(towerX - 18, topBellY, 36, baseAnvilY - topBellY);
    this.ctx.strokeStyle = '#ff0055';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(towerX - 18, topBellY, 36, baseAnvilY - topBellY);

    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 10px Poppins';
    this.ctx.textAlign = 'right';

    for (let m = 1; m <= 10; m++) {
      const my = baseAnvilY - (m / 10) * (baseAnvilY - topBellY);
      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(towerX - 18, my);
      this.ctx.lineTo(towerX + 18, my);
      this.ctx.stroke();

      this.ctx.fillText(`${m * 100} PTS`, towerX - 24, my + 4);
    }

    this.ctx.fillStyle = '#ffd700';
    this.ctx.beginPath();
    this.ctx.arc(towerX, topBellY, 22, Math.PI, 0);
    this.ctx.fill();
    this.ctx.fillRect(towerX - 26, topBellY, 52, 8);

    const puckYPos = this.puckY || baseAnvilY;
    this.ctx.fillStyle = '#00f5d4';
    this.ctx.fillRect(towerX - 14, puckYPos - 12, 28, 24);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(towerX - 14, puckYPos - 12, 28, 24);

    const hammerX = this.width * 0.60;
    const hammerY = this.height * 0.72;

    this.ctx.save();
    this.ctx.translate(hammerX, hammerY);

    if (this.hathodaSwinging) {
      const swingAngle = -Math.PI / 3 + (this.hathodaProgress * Math.PI * 0.7);
      this.ctx.rotate(swingAngle);
    } else {
      this.ctx.rotate(-Math.PI / 4);
    }

    this.ctx.fillStyle = '#6c3b1e';
    this.ctx.fillRect(-8, -120, 16, 140);

    this.ctx.fillStyle = '#495057';
    this.ctx.fillRect(-35, -140, 70, 32);
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(-35, -140, 70, 32);

    this.ctx.restore();
  }

  renderRingStallRedTable() {
    this.ctx.fillStyle = '#6b4d38';
    this.ctx.fillRect(0, this.height * 0.32, this.width, this.height * 0.68);

    this.ctx.fillStyle = '#1e110a';
    this.ctx.fillRect(this.width * 0.12, this.height * 0.68, 12, this.height * 0.2);
    this.ctx.fillRect(this.width * 0.88, this.height * 0.68, 12, this.height * 0.2);

    this.ctx.fillStyle = '#d90429';
    this.ctx.beginPath();
    this.ctx.moveTo(this.width * 0.12, this.height * 0.30);
    this.ctx.lineTo(this.width * 0.88, this.height * 0.30);
    this.ctx.lineTo(this.width * 0.96, this.height * 0.70);
    this.ctx.lineTo(this.width * 0.04, this.height * 0.70);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = '#ef233c';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    this.ctx.fillStyle = '#8d5b4c';
    this.ctx.fillRect(this.width * 0.04, this.height * 0.70, this.width * 0.92, 28);
    this.ctx.strokeStyle = '#ffb703';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.width * 0.04, this.height * 0.70, this.width * 0.92, 28);

    for (let r of this.landedRings) {
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.ellipse(r.x, r.y, 38 * r.scale, 19 * r.scale, 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    for (let item of this.items) {
      const px = item.x * this.width;
      const py = item.y * this.height;

      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.beginPath();
      this.ctx.ellipse(px, py + 16, item.radius, item.radius * 0.45, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.renderRealItemVisual(item, px, py);
    }

    const startX = this.width / 2;
    const startY = this.height - 70;

    if (this.isHolding) {
      const minThrowDist = this.height * 0.22;
      const maxThrowDist = this.height * 0.68;
      const throwDist = minThrowDist + (this.power / 100) * (maxThrowDist - minThrowDist);

      const endX = startX + Math.cos(this.aimAngle) * throwDist;
      const endY = startY + Math.sin(this.aimAngle) * throwDist;

      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
      this.ctx.lineWidth = 3.5;
      this.ctx.setLineDash([8, 6]);
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      this.ctx.strokeStyle = '#00f5d4';
      this.ctx.lineWidth = 3.5;
      this.ctx.beginPath();
      this.ctx.ellipse(endX, endY, 26, 13, 0, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.fillStyle = 'rgba(0, 245, 212, 0.25)';
      this.ctx.fill();
    }

    if (this.activeRing) {
      const p = this.activeRing.progress;
      const currentX = this.activeRing.x + (this.activeRing.targetX - this.activeRing.x) * p;
      const currentY = this.activeRing.y + (this.activeRing.targetY - this.activeRing.y) * p - Math.sin(p * Math.PI) * 150;
      const scale = this.activeRing.scale + (this.activeRing.targetScale - this.activeRing.scale) * p;

      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 9 * scale;
      this.ctx.beginPath();
      this.ctx.ellipse(currentX, currentY, 44 * scale, 22 * scale, 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.renderCenteredRealisticHand();
  }

  renderCenteredRealisticHand() {
    this.ctx.save();

    let throwOffset = 0;
    if (this.handThrowing) {
      throwOffset = Math.sin(this.handAnimProgress * Math.PI) * 60;
    }

    const rx = this.width / 2;
    const ry = this.height - 25 - throwOffset;

    const armGrad = this.ctx.createLinearGradient(0, this.height, 0, ry);
    armGrad.addColorStop(0, '#8d5b4c');
    armGrad.addColorStop(0.6, '#c68b79');
    armGrad.addColorStop(1, '#e0a996');

    this.ctx.fillStyle = armGrad;

    this.ctx.beginPath();
    this.ctx.moveTo(rx - 35, this.height);
    this.ctx.lineTo(rx - 25, ry + 15);
    this.ctx.lineTo(rx + 25, ry + 15);
    this.ctx.lineTo(rx + 35, this.height);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(rx, ry + 10, 26, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = '#c68b79';
    this.ctx.lineWidth = 9;
    this.ctx.lineCap = 'round';

    for (let f = 0; f < 4; f++) {
      const offsetX = (f - 1.5) * 12;
      const fingerLength = (f === 1 || f === 2) ? 28 : 22;
      const fingerY = ry - (this.handThrowing ? fingerLength * 0.5 : fingerLength);

      this.ctx.beginPath();
      this.ctx.moveTo(rx + offsetX, ry + 8);
      this.ctx.lineTo(rx + offsetX, fingerY);
      this.ctx.stroke();
    }

    this.ctx.lineWidth = 10;
    this.ctx.beginPath();
    this.ctx.moveTo(rx - 20, ry + 15);
    this.ctx.lineTo(rx - 30, ry - 5);
    this.ctx.stroke();

    if (!this.activeRing && !this.handThrowing) {
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 11;
      this.ctx.beginPath();
      this.ctx.ellipse(rx, ry - 18, 48, 24, 0, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  renderRealItemVisual(item, px, py) {
    this.ctx.save();
    this.ctx.translate(px, py);

    if (item.type === 'thumsup' || item.type === 'fanta' || item.type === 'sevenup') {
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(-10, -28, 20, 56);
      this.ctx.fillStyle = '#d90429';
      this.ctx.fillRect(-10, -5, 20, 16);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 8px Poppins';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(item.label, 0, 5);

      this.ctx.fillStyle = '#d90429';
      this.ctx.fillRect(-7, -32, 14, 6);
    }
    else if (item.type === 'mangojuice' || item.type === 'juicecarton') {
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(-22, -26, 44, 52);
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(-22, -26, 44, 52);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 9px Poppins';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(item.label, 0, 0);

      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(10, -26);
      this.ctx.lineTo(15, -36);
      this.ctx.stroke();
    }
    else if (item.type === 'cadbury' || item.type === 'parleg' || item.type === 'soap') {
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(-26, -16, 52, 32);
      this.ctx.strokeStyle = '#ffd700';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(-26, -16, 52, 32);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 9px Poppins';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(item.label, 0, 3);
    }
    else if (item.type === 'tiffin') {
      this.ctx.fillStyle = '#ced4da';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 24, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#6c757d';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      this.ctx.strokeStyle = '#495057';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.arc(0, -6, 10, 0, Math.PI, true);
      this.ctx.stroke();
    }
    else if (item.type === 'auto') {
      this.ctx.fillStyle = '#212529';
      this.ctx.fillRect(-28, -12, 56, 26);
      this.ctx.fillStyle = '#ffb703';
      this.ctx.fillRect(-28, -24, 56, 14);

      this.ctx.fillStyle = '#a2d2ff';
      this.ctx.fillRect(10, -20, 14, 10);
    }
    else if (item.type === 'cash500') {
      this.ctx.fillStyle = '#52b788';
      this.ctx.fillRect(-32, -15, 64, 30);
      this.ctx.strokeStyle = '#1b4332';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(-32, -15, 64, 30);

      this.ctx.fillStyle = '#1b4332';
      this.ctx.font = 'bold 12px Poppins';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('₹ 500', 0, 3);
    }

    this.ctx.restore();
  }

  renderBalloonStallGallery() {
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = 'rgba(255, 183, 3, 0.15)';
    this.ctx.fillRect(this.width * 0.08, this.height * 0.20, this.width * 0.84, this.height * 0.55);

    this.ctx.fillStyle = '#d90429';
    this.ctx.fillRect(0, 0, this.width, this.height * 0.14);

    this.ctx.fillStyle = '#ffb703';
    for (let f = 0; f < this.width; f += 40) {
      this.ctx.beginPath();
      this.ctx.arc(f + 20, 0, 18, 0, Math.PI);
      this.ctx.fill();
    }

    this.ctx.fillStyle = '#2b1002';
    this.ctx.fillRect(this.width * 0.08, this.height * 0.20, this.width * 0.84, this.height * 0.55);
    this.ctx.strokeStyle = '#ffb703';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.width * 0.08, this.height * 0.20, this.width * 0.84, this.height * 0.55);

    for (let r = 0; r < 3; r++) {
      const shelfY = (this.height * 0.30) + r * 68 + 18;
      this.ctx.fillStyle = '#5c2d12';
      this.ctx.fillRect(this.width * 0.1, shelfY, this.width * 0.8, 10);
    }

    this.renderRajasthaniVendor(this.width * 0.90, this.height * 0.42);

    for (let d = 0; d < 7; d++) {
      const dx = (this.width * 0.14) + d * (this.width * 0.10);
      const dy = this.height * 0.22;

      this.ctx.strokeStyle = '#ced4da';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(dx, dy);
      this.ctx.lineTo(dx, dy + 22);
      this.ctx.stroke();

      this.ctx.fillStyle = (d % 2 === 0) ? '#ff0055' : '#00f5d4';
      this.ctx.beginPath();
      this.ctx.arc(dx, dy + 26, 6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillRect(dx - 5, dy + 32, 10, 14);
    }

    for (let b of this.balloons) {
      if (!b.popped) {
        this.ctx.fillStyle = b.color;
        this.ctx.beginPath();
        this.ctx.ellipse(b.x, b.y, b.radius * 0.85, b.radius, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = 'rgba(255,255,255,0.45)';
        this.ctx.beginPath();
        this.ctx.arc(b.x - 5, b.y - 5, 4, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.moveTo(b.x, b.y + b.radius);
        this.ctx.lineTo(b.x, b.y + b.radius + 12);
        this.ctx.stroke();
      }
    }

    this.ctx.fillStyle = '#0077b6';
    this.ctx.fillRect(0, this.height * 0.72, this.width, this.height * 0.28);

    this.ctx.fillStyle = '#023e8a';
    this.ctx.fillRect(0, this.height * 0.72, this.width, 14);

    this.renderCounterAirRifles();

    this.renderFirstPersonAirRifle();
  }

  renderCounterAirRifles() {
    this.renderSingleRifleOnTable(this.width * 0.22, this.height * 0.80, -0.25);
    this.renderSingleRifleOnTable(this.width * 0.78, this.height * 0.80, 0.25);
  }

  renderSingleRifleOnTable(rx, ry, angle) {
    this.ctx.save();
    this.ctx.translate(rx, ry);
    this.ctx.rotate(angle);

    this.ctx.fillStyle = '#4a2511';
    this.ctx.fillRect(-70, -10, 80, 20);

    this.ctx.fillStyle = '#6c757d';
    this.ctx.fillRect(10, -5, 90, 10);

    this.ctx.fillStyle = '#212529';
    this.ctx.fillRect(-20, -14, 40, 8);

    this.ctx.restore();
  }

  renderFirstPersonAirRifle() {
    this.ctx.save();

    const z = this.rifleZoomProgress;
    const rx = (this.width / 2) + (this.isScoping ? (this.scopePos.x - this.width / 2) * 0.3 : 0);
    const ry = (this.height - 40) - (z * (this.height * 0.35));

    const rifleGrad = this.ctx.createLinearGradient(rx - 60, ry, rx + 60, ry);
    rifleGrad.addColorStop(0, '#3d1e0b');
    rifleGrad.addColorStop(1, '#6c3b1e');

    this.ctx.fillStyle = '#495057';
    this.ctx.fillRect(rx - 12, ry - (140 * (1 - z * 0.4)), 24, 150);

    this.ctx.fillStyle = '#212529';
    this.ctx.fillRect(rx - 4, ry - (140 * (1 - z * 0.4)) - 10, 8, 10);

    this.ctx.fillStyle = '#111111';
    this.ctx.fillRect(rx - 18, ry - 40, 36, 50);

    this.ctx.fillStyle = 'rgba(0, 245, 212, 0.4)';
    this.ctx.beginPath();
    this.ctx.arc(rx, ry - 40, 16, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = rifleGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(rx - 40, this.height);
    this.ctx.lineTo(rx - 30, ry + 10);
    this.ctx.lineTo(rx + 30, ry + 10);
    this.ctx.lineTo(rx + 40, this.height);
    this.ctx.closePath();
    this.ctx.fill();

    const handGrad = this.ctx.createLinearGradient(0, this.height, rx - 35, ry);
    handGrad.addColorStop(0, '#8d5b4c');
    handGrad.addColorStop(1, '#e0a996');

    this.ctx.fillStyle = handGrad;
    this.ctx.beginPath();
    this.ctx.arc(rx - 25, ry + 20, 18, 0, Math.PI * 2);
    this.ctx.arc(rx + 25, ry + 35, 20, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  renderRajasthaniVendor(vx, vy) {
    this.ctx.save();
    this.ctx.translate(vx, vy);

    this.ctx.fillStyle = '#e63946';
    this.ctx.beginPath();
    this.ctx.arc(0, 45, 28, Math.PI, 0);
    this.ctx.fill();

    this.ctx.fillStyle = '#d48c6a';
    this.ctx.beginPath();
    this.ctx.arc(0, 10, 18, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#111111';
    this.ctx.beginPath();
    this.ctx.moveTo(-18, 14);
    this.ctx.quadraticCurveTo(0, 22, 18, 14);
    this.ctx.quadraticCurveTo(24, 6, 20, 2);
    this.ctx.quadraticCurveTo(0, 16, -20, 2);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = '#111111';
    this.ctx.beginPath();
    this.ctx.arc(-7, 6, 2.5, 0, Math.PI * 2);
    this.ctx.arc(7, 6, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#ff0055';
    this.ctx.fillRect(-2, -3, 4, 8);

    this.ctx.fillStyle = '#ffb703';
    this.ctx.beginPath();
    this.ctx.ellipse(0, -8, 26, 16, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#d90429';
    this.ctx.beginPath();
    this.ctx.ellipse(0, -12, 22, 12, 0.2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }
}

window.addEventListener('load', () => {
  new DesiMelaGame();
});
