
const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
let audioCtx: AudioContext | null = null;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) => {
  const ctx = initAudio();
  if (!ctx) return;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
  
  gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
};

// --- Collectibles ---

export const playCollectSound = () => {
  // Fallback generic
  playTone(1200, 'sine', 0.1, 0, 0.05);
  playTone(1600, 'sine', 0.2, 0.05, 0.05);
};

export const playBitcoinSound = () => {
  // Premium, crystal clear chime (High C major ish)
  playTone(1567.98, 'sine', 0.15, 0, 0.08); // G6
  playTone(2093.00, 'sine', 0.3, 0.05, 0.08); // C7
};

export const playEthereumSound = () => {
  // Digital/Tech sound (Square/Triangle blend)
  playTone(880, 'triangle', 0.2, 0, 0.08);
  playTone(1108, 'triangle', 0.2, 0.05, 0.08);
  playTone(1318, 'square', 0.1, 0.1, 0.02); // Quick digital blip at end
};

export const playDogeSound = () => {
  // Playful "Boing" slide effect
  const ctx = initAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15); // Slide up
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
};

// --- Obstacles ---

export const playDamageSound = () => {
  // Fallback generic
  playTone(150, 'sawtooth', 0.2, 0, 0.1);
  playTone(100, 'sawtooth', 0.2, 0.05, 0.1);
};

export const playTaxSound = () => {
  // Dull, bureaucratic thud
  playTone(100, 'square', 0.15, 0, 0.15);
  playTone(80, 'square', 0.15, 0.05, 0.15);
};

export const playSecFineSound = () => {
  // Harsh Alarm / Siren
  const ctx = initAudio();
  if (!ctx) return;
  const t = ctx.currentTime;
  
  // Dissonant interval
  playTone(440, 'sawtooth', 0.3, 0, 0.1);
  playTone(466, 'sawtooth', 0.3, 0, 0.1); // Minor second clash
  
  // Downward slide
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(800, t);
  osc.frequency.exponentialRampToValueAtTime(200, t + 0.3);
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.3);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.3);
};

export const playFakeNewsSound = () => {
  // Static / Paper crumple noise simulation
  // Rapid random frequencies
  const ctx = initAudio();
  if (!ctx) return;
  const t = ctx.currentTime;
  
  for(let i=0; i<5; i++) {
     playTone(200 + Math.random() * 800, 'square', 0.05, i * 0.02, 0.05);
  }
};

export const playGrinchSound = () => {
  // Mean, low pitched laughter-like sound
  const ctx = initAudio();
  if (!ctx) return;
  
  playTone(150, 'sawtooth', 0.15, 0, 0.2);
  playTone(120, 'sawtooth', 0.15, 0.15, 0.2);
  playTone(100, 'sawtooth', 0.15, 0.30, 0.3);
};

export const playSwampSound = () => {
    // Slurpy low squelch
    const ctx = initAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
}

export const playMysterySound = () => {
    // Quick ascending scale (Casino style)
    playTone(400, 'sine', 0.1, 0, 0.1);
    playTone(500, 'sine', 0.1, 0.1, 0.1);
    playTone(600, 'sine', 0.1, 0.2, 0.1);
}

export const playLaserSound = () => {
    // Pew Pew
    const ctx = initAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
}

// --- Events ---

export const playPowerUpSound = () => {
  // Powerup: ascending arpeggio
  playTone(440, 'square', 0.1, 0, 0.05);
  playTone(554, 'square', 0.1, 0.05, 0.05);
  playTone(659, 'square', 0.1, 0.10, 0.05);
  playTone(880, 'square', 0.3, 0.15, 0.05);
};

export const playTeslaSound = () => {
  // Electric Zap
  const ctx = initAudio();
  if (!ctx) return;
  
  // Buzzing square wave
  playTone(100, 'sawtooth', 0.1, 0, 0.2);
  playTone(150, 'sawtooth', 0.1, 0.05, 0.2);
  
  // High frequency crackle
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(2000, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.2);
  
  // Strobe volume for crackle effect
  const lfo = ctx.createOscillator();
  lfo.type = 'square';
  lfo.frequency.value = 50;
  
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 500;
  
  lfo.connect(lfoGain.gain);
  
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
};

export const playShieldBreakSound = () => {
    playTone(300, 'square', 0.1, 0, 0.1);
    playTone(100, 'sawtooth', 0.2, 0.05, 0.1);
};

export const playFeverStartSound = () => {
    // Triumphant chord
    playTone(523.25, 'triangle', 0.5, 0, 0.1); // C5
    playTone(659.25, 'triangle', 0.5, 0, 0.1); // E5
    playTone(783.99, 'triangle', 0.5, 0, 0.1); // G5
    playTone(1046.50, 'triangle', 0.8, 0.1, 0.1); // C6
}

export const playGameStartSound = () => {
    playTone(440, 'sine', 0.1, 0, 0.1);
    playTone(880, 'sine', 0.4, 0.1, 0.1);
}

export const playGameOverSound = () => {
    playTone(300, 'sawtooth', 0.4, 0, 0.2);
    playTone(250, 'sawtooth', 0.4, 0.3, 0.2);
    playTone(200, 'sawtooth', 1.0, 0.6, 0.2);
    playTone(100, 'sawtooth', 1.5, 1.0, 0.2);
}

export const playBuySound = () => {
    // Cash register cha-ching
    playTone(800, 'square', 0.1, 0, 0.1);
    playTone(1600, 'square', 0.3, 0.1, 0.1);
}

export const playSellSound = () => {
    // Coin clink reverse
    playTone(1200, 'sine', 0.1, 0, 0.1);
    playTone(600, 'sine', 0.3, 0.1, 0.1);
}

export const playVolatilitySound = () => {
  // Urgent oscillating siren
  const ctx = initAudio();
  if (!ctx) return;
  const t = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(600, t);
  osc.frequency.linearRampToValueAtTime(800, t + 0.2);
  osc.frequency.linearRampToValueAtTime(600, t + 0.4);
  osc.frequency.linearRampToValueAtTime(800, t + 0.6);
  osc.frequency.linearRampToValueAtTime(600, t + 0.8);
  
  gain.gain.setValueAtTime(0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(t);
  osc.stop(t + 1.0);
};

export const playMissionSound = () => {
  // Attention grabbing notification
  playTone(660, 'square', 0.1, 0, 0.1);
  playTone(660, 'square', 0.3, 0.15, 0.1);
};

export const playMissionCompleteSound = () => {
  // Victory fanfare mini
  playTone(523.25, 'square', 0.1, 0, 0.1); // C5
  playTone(659.25, 'square', 0.1, 0.1, 0.1); // E5
  playTone(783.99, 'square', 0.1, 0.2, 0.1); // G5
  playTone(1046.50, 'square', 0.3, 0.3, 0.1); // C6
};

export const playSleighBellSound = () => {
    // High pitched shimmering bells
    const ctx = initAudio();
    if (!ctx) return;
    
    // Multiple quick high sine waves
    for(let i=0; i<4; i++) {
        playTone(2000 + Math.random()*1000, 'sine', 0.05, i*0.03, 0.05);
    }
}

export const playSnowCrashSound = () => {
    // Muffled low noise
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Simulate low thud noise via FM synthesis or low freq sawtooth
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.2);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
}
