import React, { useEffect, useRef, useState } from 'react';
import { GameState, Entity, EntityType, Player, Particle, Star, SkinType, ActivePowerUp, UpgradeType, GameMode } from '../types';
import { TrumpBackIcon, BitcoinIcon, DogeIcon, TaxIcon, SecIcon, FakeNewsIcon, WallIcon, MagnetIcon, RocketIcon, ElonTruckIcon, TeslaCoilIcon, SantaTrumpFaceIcon, SledgeTrumpIcon, GiftIcon, PineTreeIcon, SnowmanIcon, CandyCaneIcon, CoalIcon, GrinchIcon, MountainRangeIcon, SantaMoonIcon, NorthPoleVillageIcon, SwampIcon, MysteryBoxIcon, LaserEyesEffect } from './AssetIcons';
import { 
  playCollectSound, 
  playDamageSound, 
  playPowerUpSound, 
  playShieldBreakSound, 
  playFeverStartSound,
  playBitcoinSound, 
  playDogeSound, 
  playEthereumSound, 
  playTaxSound, 
  playSecFineSound, 
  playFakeNewsSound,
  playTeslaSound,
  playVolatilitySound,
  playMissionSound,
  playSleighBellSound,
  playSnowCrashSound,
  playGrinchSound,
  playSwampSound,
  playMysterySound,
  playLaserSound
} from '../services/audioService';
import { generateTrumpMission } from '../services/geminiService';

interface GameCanvasProps {
  gameState: GameState;
  gameMode: GameMode;
  skin: SkinType;
  initialUpgrades: UpgradeType[];
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number, multiplier: number) => void;
  setCommentaryTrigger: (trigger: 'hit' | 'miss') => void;
  onPowerUpUpdate: (active: ActivePowerUp[]) => void;
  onComboUpdate: (value: number) => void;
  onEntityCollected: (type: EntityType) => void;
}

// 3D Engine Constants
const FOV = 400; // Increased FOV for better 3D depth
const SPAWN_Z = 3000;
const SPEED_BASE = 35;
const MAX_SPEED = 100;
const POWERUP_DURATION = 600;
const COMBO_DECAY = 0.5;
const COMBO_MAX = 100;
const FLOOR_WORLD_Y = 350; // Defined ground plane level

// Flappy Mode Constants
const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const FLAPPY_SPEED = 12;

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, gameMode, skin, initialUpgrades, onGameOver, onScoreUpdate, setCommentaryTrigger, onPowerUpUpdate, onComboUpdate, onEntityCollected }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // React State for Rendering (Updated every frame via update loop)
  const [player, setPlayer] = useState<Player>({ x: window.innerWidth / 2, y: window.innerHeight / 2, width: 100, height: 100, tilt: 0, vy: 0 });
  const [entitiesDisplay, setEntitiesDisplay] = useState<Entity[]>([]);
  const [shadowsDisplay, setShadowsDisplay] = useState<any[]>([]);
  
  // Mission State
  const [mission, setMission] = useState<string>("GET RICH QUICK!");
  const [showMissionModal, setShowMissionModal] = useState(false);

  const isDiamondMode = gameMode === GameMode.DIAMOND_HANDS;
  const isFlappyMode = gameMode === GameMode.FLAPPY_TRUMP;
  const isNorthPoleMode = gameMode === GameMode.NORTH_POLE_DELIVERY;

  // Mutable Game State (Physics)
  const stateRef = useRef({
    player: { x: window.innerWidth / 2, y: window.innerHeight / 2, width: 100, height: 100, tilt: 0, vy: 0 },
    entities: [] as Entity[],
    particles: [] as Particle[],
    stars: [] as Star[],
    activePowerUps: [] as ActivePowerUp[],
    score: 0,
    combo: 0,
    wasFever: false,
    gameTime: 0,
    isRunning: false,
    speed: SPEED_BASE,
    shake: 0,
    floorOffset: 0,
    elonCooldown: 0,
    initialApplied: false,
    mouseVelocity: { x: 0, y: 0 },
    volatilityCooldown: 0,
    volatilityEndTime: 0,
    isVolatilityActive: false,
    lastMissionTime: 0,
    swampSlowdown: 0 // Duration of slow effect
  });

  const requestRef = useRef<number>();
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Init Stars
  useEffect(() => {
    const stars: Star[] = [];
    for(let i=0; i<80; i++) {
        stars.push({
            x: (Math.random() - 0.5) * window.innerWidth * 4,
            y: (Math.random() - 0.5) * window.innerHeight * 2 - 500,
            z: Math.random() * SPAWN_Z
        });
    }
    stateRef.current.stars = stars;
  }, []);

  const spawnEntity = (forcedType?: EntityType, forcedX?: number, forcedY?: number, forcedZ?: number) => {
    const { speed, isVolatilityActive } = stateRef.current;
    const isMobile = window.innerWidth < 768;

    let type = EntityType.BITCOIN;
    let value = 100;
    
    if (forcedType) {
        type = forcedType;
        if (type === EntityType.DOGE) value = 50;
    } else {
        if (isNorthPoleMode) {
             const weights: Partial<Record<EntityType, number>> = {
                 [EntityType.GIFT]: 15,
                 [EntityType.CANDY_CANE]: 35,
                 [EntityType.PINE_TREE]: 15,
                 [EntityType.SNOWMAN]: 15,
                 [EntityType.COAL]: 15,
                 [EntityType.THE_GRINCH]: 2,
                 [EntityType.POWERUP_MAGNET]: 1.5,
                 [EntityType.POWERUP_ROCKET]: 1.5
             };
             
             let totalWeight = 0;
             const pool: { type: EntityType; weight: number }[] = [];
             (Object.keys(weights) as EntityType[]).forEach(key => {
                 const w = weights[key]!;
                 pool.push({ type: key, weight: w });
                 totalWeight += w;
             });

             let random = Math.random() * totalWeight;
             for (const item of pool) {
                 if (random < item.weight) {
                     type = item.type;
                     break;
                 }
                 random -= item.weight;
             }
             
             switch(type) {
                 case EntityType.GIFT: value = 250; break;
                 case EntityType.CANDY_CANE: value = 100; break;
                 case EntityType.PINE_TREE: value = -200; break;
                 case EntityType.SNOWMAN: value = -150; break;
                 case EntityType.COAL: value = -50; break;
                 case EntityType.THE_GRINCH: value = -500; break;
                 case EntityType.POWERUP_MAGNET:
                 case EntityType.POWERUP_ROCKET: value = 0; break;
                 default: value = 100;
             }

        } else {
            const difficulty = Math.min(1, Math.max(0, (speed - SPEED_BASE) / (MAX_SPEED - SPEED_BASE)));
            const weights: Partial<Record<EntityType, number>> = {
                [EntityType.BITCOIN]: 25,
                [EntityType.ETHEREUM]: 15,
                [EntityType.DOGE]: 25,
                [EntityType.TAX]: isDiamondMode ? (4 + difficulty * 20) : (5 + (difficulty * 25)),
                [EntityType.SEC_FINE]: 2 + (difficulty * 15),
                [EntityType.FAKE_NEWS]: 1 + (difficulty * 15),
                [EntityType.THE_SWAMP]: 2 + (difficulty * 5),
                [EntityType.MYSTERY_BOX]: 1.5,
                [EntityType.POWERUP_WALL]: isDiamondMode ? 3 : 2,
                [EntityType.POWERUP_MAGNET]: 2,
                [EntityType.POWERUP_ROCKET]: 1.5,
                [EntityType.POWERUP_TESLA]: 1.5,
                [EntityType.POWERUP_LASER]: 1.0,
            };

            let totalWeight = 0;
            const pool: { type: EntityType; weight: number }[] = [];
            (Object.keys(weights) as EntityType[]).forEach(key => {
                const w = weights[key]!;
                pool.push({ type: key, weight: w });
                totalWeight += w;
            });

            let random = Math.random() * totalWeight;
            for (const item of pool) {
                if (random < item.weight) {
                    type = item.type;
                    break;
                }
                random -= item.weight;
            }

            const multiplier = isVolatilityActive ? (Math.random() * 2.5 + 0.5) : 1;

            switch(type) {
                case EntityType.BITCOIN: value = Math.floor(100 * multiplier); break;
                case EntityType.ETHEREUM: value = Math.floor(150 * multiplier); break;
                case EntityType.DOGE: value = Math.floor(50 * multiplier); break;
                case EntityType.TAX: value = -200; break;
                case EntityType.SEC_FINE: value = -500; break;
                case EntityType.FAKE_NEWS: value = -100; break;
                case EntityType.THE_SWAMP: value = -50; break; // Speed penalty mainly
                case EntityType.MYSTERY_BOX: value = 0; break; // RNG
                case EntityType.POWERUP_WALL:
                case EntityType.POWERUP_MAGNET:
                case EntityType.POWERUP_ROCKET:
                case EntityType.POWERUP_TESLA:
                case EntityType.POWERUP_LASER:
                    value = 0;
                    break;
                default: value = 100;
            }
        }
    }

    // ADJUST SPREAD FOR MOBILE
    // On mobile (width < 768), make spread much tighter so objects stay on screen
    const spreadX = isMobile ? window.innerWidth * 1.5 : window.innerWidth * 2;
    const spreadY = window.innerHeight * 1.5;

    let finalX, finalY, finalZ;

    if (isFlappyMode) {
        finalX = window.innerWidth + 200;
        finalY = Math.random() * (window.innerHeight - 200) + 100;
        finalZ = 0;
    } else {
        let spawnY = forcedY ?? (Math.random() - 0.5) * spreadY;
        if (type === EntityType.ELON_TRUCK || type === EntityType.THE_SWAMP || (isNorthPoleMode && (type === EntityType.PINE_TREE || type === EntityType.SNOWMAN || type === EntityType.COAL))) {
            spawnY = 275; 
        }
        finalX = forcedX ?? (Math.random() - 0.5) * spreadX;
        finalY = spawnY;
        finalZ = forcedZ ?? SPAWN_Z;
    }

    const newEntity: Entity = {
      id: Date.now() + Math.random(),
      type,
      x: finalX,
      y: finalY,
      z: finalZ,
      width: type === EntityType.ELON_TRUCK ? 300 : 100,
      height: type === EntityType.ELON_TRUCK ? 150 : 100,
      value,
      vx: type === EntityType.ELON_TRUCK ? (isFlappyMode ? -25 : 30) : 0
    };
    
    stateRef.current.entities.push(newEntity);
  };

  const createParticles = (x: number, y: number, z: number, color: string, count: number = 10) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Math.random(),
        x, y, z,
        vx: (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 80,
        vz: (Math.random() - 0.5) * 80,
        life: 1.0,
        color
      });
    }
    stateRef.current.particles.push(...newParticles);
  };

  const jump = () => {
      if (isFlappyMode) {
          stateRef.current.player.vy = JUMP_STRENGTH;
          createParticles(stateRef.current.player.x, stateRef.current.player.y + 40, 0, '#fff', 5);
      }
  };

  const fetchNewMission = async () => {
     const newMission = await generateTrumpMission();
     setMission(newMission);
  };

  const resumeFromMission = () => {
      setShowMissionModal(false);
      stateRef.current.isRunning = true;
      requestRef.current = requestAnimationFrame(update);
      playCollectSound();
  };

  // Main Game Loop (Physics + Render Trigger)
  const update = () => {
    if (!stateRef.current.isRunning) return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    stateRef.current.gameTime++;
    if (stateRef.current.shake > 0) stateRef.current.shake *= 0.9;
    if (stateRef.current.swampSlowdown > 0) stateRef.current.swampSlowdown--;

    const hasMagnet = stateRef.current.activePowerUps.some(p => p.type === EntityType.POWERUP_MAGNET);
    const hasRocket = stateRef.current.activePowerUps.some(p => p.type === EntityType.POWERUP_ROCKET);
    const hasWall = stateRef.current.activePowerUps.some(p => p.type === EntityType.POWERUP_WALL);
    const hasTesla = stateRef.current.activePowerUps.some(p => p.type === EntityType.POWERUP_TESLA);
    const hasLaser = stateRef.current.activePowerUps.some(p => p.type === EntityType.POWERUP_LASER);

    const feverMode = stateRef.current.combo >= COMBO_MAX;
    const rocketSpeedBonus = hasRocket ? 50 : 0;
    const feverSpeedBonus = feverMode ? 30 : 0;
    
    // Mission Check
    if (stateRef.current.gameTime - stateRef.current.lastMissionTime > 2400) {
        stateRef.current.lastMissionTime = stateRef.current.gameTime;
        stateRef.current.isRunning = false; 
        playMissionSound();
        fetchNewMission();
        setShowMissionModal(true);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        // Force one last render to show updated state if needed
        return; 
    }

    // Volatility Check
    if (!stateRef.current.isVolatilityActive && stateRef.current.gameTime > stateRef.current.volatilityCooldown && Math.random() > 0.999) {
        stateRef.current.isVolatilityActive = true;
        stateRef.current.volatilityEndTime = stateRef.current.gameTime + 600; 
        stateRef.current.volatilityCooldown = stateRef.current.gameTime + 2000;
        playVolatilitySound();
    }
    if (stateRef.current.isVolatilityActive && stateRef.current.gameTime > stateRef.current.volatilityEndTime) {
        stateRef.current.isVolatilityActive = false;
    }

    // Physics Speed
    const modeMultiplier = isDiamondMode ? 1.5 : 1.0;
    const baseCalc = Math.min(MAX_SPEED, SPEED_BASE + (stateRef.current.score / 500));
    let finalSpeed = (baseCalc * modeMultiplier) + rocketSpeedBonus + feverSpeedBonus;
    
    if (stateRef.current.swampSlowdown > 0) finalSpeed *= 0.5; // Swamp penalty

    stateRef.current.speed = finalSpeed;
    const currentSpeed = stateRef.current.speed;
    
    stateRef.current.floorOffset = (stateRef.current.floorOffset + currentSpeed) % 200;
    stateRef.current.combo = Math.max(0, stateRef.current.combo - COMBO_DECAY);
    onComboUpdate(stateRef.current.combo);

    if (feverMode && !stateRef.current.wasFever) {
        playFeverStartSound();
        stateRef.current.wasFever = true;
    } else if (!feverMode) {
        stateRef.current.wasFever = false;
    }

    stateRef.current.activePowerUps = stateRef.current.activePowerUps
        .map(p => ({ ...p, timeLeft: p.timeLeft - 1 }))
        .filter(p => p.timeLeft > 0);
    onPowerUpUpdate(stateRef.current.activePowerUps);

    // Player Movement
    if (isFlappyMode) {
        if (!hasRocket) {
            stateRef.current.player.vy = (stateRef.current.player.vy || 0) + GRAVITY;
        } else {
            stateRef.current.player.vy = (centerY - stateRef.current.player.y) * 0.05;
        }
        
        stateRef.current.player.y += stateRef.current.player.vy!;
        stateRef.current.player.tilt = Math.max(-25, Math.min(25, (stateRef.current.player.vy || 0) * 3));

        if (stateRef.current.player.y > window.innerHeight - 50 || stateRef.current.player.y < 0) {
            if (!hasRocket && !hasWall) {
                handleCollision({ type: EntityType.TAX, value: -100 } as any);
                stateRef.current.player.vy = -10;
            } else {
                 stateRef.current.player.y = Math.max(0, Math.min(window.innerHeight - 50, stateRef.current.player.y));
                 stateRef.current.player.vy = 0;
            }
        }
        stateRef.current.player.x = window.innerWidth * 0.2; 
    } else {
        const targetX = mouseRef.current.x;
        const targetY = mouseRef.current.y;
        const moveSpeed = 0.1;
        const prevX = stateRef.current.player.x;
        const prevY = stateRef.current.player.y;
        
        stateRef.current.player.x += (targetX - stateRef.current.player.x) * moveSpeed;
        stateRef.current.player.y += (targetY - stateRef.current.player.y) * moveSpeed;
        stateRef.current.mouseVelocity.x = stateRef.current.player.x - prevX;
        stateRef.current.mouseVelocity.y = stateRef.current.player.y - prevY;
        
        const dx = targetX - stateRef.current.player.x;
        stateRef.current.player.tilt = dx * 0.2; 
    }

    // Dynamic Density Spawn Logic
    // We increase spawn probability as speed increases to maintain density
    const baseSpawnRate = isFlappyMode ? 0.06 : 0.05; // Base probability per frame
    const speedFactor = Math.max(1, currentSpeed / SPEED_BASE);
    let finalSpawnProb = baseSpawnRate * speedFactor;
    
    // Cap probability to avoid chaos
    finalSpawnProb = Math.min(0.5, finalSpawnProb);
    
    if (stateRef.current.isVolatilityActive) finalSpawnProb *= 2;

    if (!isNorthPoleMode && stateRef.current.gameTime > stateRef.current.elonCooldown && Math.random() > 0.995) {
        spawnEntity(EntityType.ELON_TRUCK); 
        stateRef.current.elonCooldown = stateRef.current.gameTime + 1200;
    } else {
        if (Math.random() < finalSpawnProb) {
            spawnEntity();
        }
    }
    
    // Laser Logic: Auto destroy obstacles in front
    if (hasLaser) {
         if (Math.random() > 0.9) playLaserSound();
         stateRef.current.entities.forEach(e => {
             const isObstacle = e.type === EntityType.TAX || e.type === EntityType.SEC_FINE || e.type === EntityType.FAKE_NEWS || e.type === EntityType.THE_SWAMP || e.type === EntityType.COAL || e.type === EntityType.THE_GRINCH;
             if (isObstacle) {
                 const dx = Math.abs(e.x - (stateRef.current.player.x - centerX)); // Approximate relative x
                 if (dx < 200 && e.z < 1500) {
                     // Destroy obstacle
                     e.z = -9999;
                     e.x = -9999;
                     createParticles(stateRef.current.player.x, stateRef.current.player.y, 0, '#ef4444', 5);
                 }
             }
         })
    }

    stateRef.current.entities.forEach(entity => {
      if (isFlappyMode) {
          const moveSpeed = (currentSpeed / 100) * FLAPPY_SPEED; 
          entity.x -= moveSpeed;
          if (entity.vx) entity.x += entity.vx; 
          if ((hasMagnet || hasTesla) && entity.x < window.innerWidth && entity.x > 0) {
               const isBad = entity.value < 0;
               if (!isBad) {
                   const dx = stateRef.current.player.x - entity.x;
                   const dy = stateRef.current.player.y - entity.y;
                   const dist = Math.sqrt(dx*dx + dy*dy);
                   if (dist < 400) {
                       entity.x += dx * 0.1;
                       entity.y += dy * 0.1;
                   }
               }
          }
      } else {
          entity.z -= currentSpeed;
          if (entity.vx) entity.x += entity.vx;
          if (hasMagnet || hasTesla) {
            const isBad = entity.value < 0;
            if (!isBad && entity.z < SPAWN_Z * 0.8 && entity.z > 0) {
                const scale = FOV / (FOV + entity.z);
                const playerWorldX = (stateRef.current.player.x - centerX) / scale;
                const playerWorldY = (stateRef.current.player.y - centerY) / scale;
                const pullStrength = hasTesla ? 0.25 : 0.1; 
                entity.x += (playerWorldX - entity.x) * pullStrength;
                entity.y += (playerWorldY - entity.y) * pullStrength;
                if (hasTesla && (entity.type === EntityType.BITCOIN || entity.type === EntityType.DOGE || entity.type === EntityType.ETHEREUM)) {
                    entity.x += (Math.random() - 0.5) * 50;
                    entity.y += (Math.random() - 0.5) * 50;
                }
            }
         }
      }

      // Hitbox
      let screenX, screenY, screenWidth, screenHeight;
      if (isFlappyMode) {
          screenX = entity.x;
          screenY = entity.y;
          screenWidth = entity.width;
          screenHeight = entity.height;
      } else {
          const scale = FOV / (FOV + entity.z);
          screenX = centerX + entity.x * scale;
          screenY = centerY + entity.y * scale;
          screenWidth = entity.width * scale;
          screenHeight = entity.height * scale;
      }

      const zCollision = isFlappyMode ? true : (entity.z < 100 && entity.z > -100);
      if (zCollision) {
          const p = stateRef.current.player;
          const px = p.x - p.width * 0.3; 
          const py = p.y - p.height * 0.3;
          const pw = p.width * 0.6;
          const ph = p.height * 0.6;
          const ex = screenX - screenWidth/2;
          const ey = screenY - screenHeight/2;
          if (px < ex + screenWidth && px + pw > ex && py < ey + screenHeight && py + ph > ey) {
              handleCollision(entity);
              if (isFlappyMode) stateRef.current.entities = stateRef.current.entities.filter(e => e.id !== entity.id);
              else entity.z = -9999; 
          }
      }
    });

    if (isFlappyMode) stateRef.current.entities = stateRef.current.entities.filter(e => e.x > -200);
    else stateRef.current.entities = stateRef.current.entities.filter(e => e.z > -FOV);

    stateRef.current.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.z += p.vz; p.life -= 0.02;
    });
    stateRef.current.particles = stateRef.current.particles.filter(p => p.life > 0);

    stateRef.current.stars.forEach(s => {
        if (isFlappyMode) {
            s.x -= currentSpeed * 0.1;
            if (s.x < 0) s.x = window.innerWidth;
        } else {
            s.z -= currentSpeed * 0.5; 
            if (s.z <= 0) s.z += SPAWN_Z;
        }
    });
    
    // --- SYNCHRONIZED RENDERING ---
    // Update State Display variables directly here to prevent frame mismatch
    
    // Calculate Shadows
    let newShadows = [];
    if (!isFlappyMode) {
        const scaleFactor = FOV;
        newShadows = stateRef.current.entities.map(e => {
            const shadowZ = e.z;
            const sScale = scaleFactor / (scaleFactor + shadowZ);
            const shadowShift = (e.x / 5); 
            const lateralSkew = (e.x / 2000) * 30;
            const sx = centerX + (e.x + shadowShift) * sScale;
            const sy = centerY + FLOOR_WORLD_Y * sScale;
            const heightFromFloor = Math.max(0, FLOOR_WORLD_Y - e.y);
            const alpha = Math.max(0, 0.6 * (1 - Math.abs(heightFromFloor)/800));
            const blur = Math.min(20, Math.max(2, Math.abs(heightFromFloor)/15));
            const sizeFactor = Math.max(0, 1 - Math.abs(heightFromFloor)/1500);

            if (sScale <= 0 || alpha < 0.05) return null;
            return { id: e.id, sx, sy, width: e.width * sScale * sizeFactor, height: e.height * sScale * 0.25 * sizeFactor, opacity: alpha, blur: blur, skew: lateralSkew };
        }).filter(Boolean);
    }
    
    setShadowsDisplay(newShadows);
    setEntitiesDisplay([...stateRef.current.entities]);
    setPlayer({...stateRef.current.player});

    requestRef.current = requestAnimationFrame(update);
  };

  const handleCollision = (entity: Entity) => {
      const isBad = entity.value < 0;
      const hasShield = stateRef.current.activePowerUps.some(p => p.type === EntityType.POWERUP_WALL);
      const hasRocket = stateRef.current.activePowerUps.some(p => p.type === EntityType.POWERUP_ROCKET);
      const hasTesla = stateRef.current.activePowerUps.some(p => p.type === EntityType.POWERUP_TESLA);
      
      // Powerups logic
      if (entity.type === EntityType.POWERUP_WALL || entity.type === EntityType.POWERUP_MAGNET || entity.type === EntityType.POWERUP_ROCKET || entity.type === EntityType.POWERUP_TESLA || entity.type === EntityType.POWERUP_LASER) {
          playPowerUpSound();
          const newPowerUps = [...stateRef.current.activePowerUps];
          
          if (entity.type === EntityType.POWERUP_ROCKET) newPowerUps.push({ type: EntityType.POWERUP_ROCKET, timeLeft: POWERUP_DURATION });
          else if (entity.type === EntityType.POWERUP_WALL) newPowerUps.push({ type: EntityType.POWERUP_WALL, timeLeft: POWERUP_DURATION });
          else if (entity.type === EntityType.POWERUP_MAGNET) newPowerUps.push({ type: EntityType.POWERUP_MAGNET, timeLeft: POWERUP_DURATION });
          else if (entity.type === EntityType.POWERUP_TESLA) newPowerUps.push({ type: EntityType.POWERUP_TESLA, timeLeft: POWERUP_DURATION });
          else if (entity.type === EntityType.POWERUP_LASER) newPowerUps.push({ type: EntityType.POWERUP_LASER, timeLeft: POWERUP_DURATION });
          
          stateRef.current.activePowerUps = newPowerUps;
          onPowerUpUpdate(newPowerUps);
          createParticles(stateRef.current.player.x, stateRef.current.player.y, 0, '#fff', 20);
          setCommentaryTrigger('hit');
          return;
      }
      
      // Special Entities
      if (entity.type === EntityType.MYSTERY_BOX) {
          playMysterySound();
          const roll = Math.random();
          if (roll < 0.3) {
              // Bad: Tax
              handleCollision({ ...entity, type: EntityType.TAX, value: -200 });
          } else if (roll < 0.6) {
              // Good: Bonus Points
              handleCollision({ ...entity, type: EntityType.BITCOIN, value: 500 });
          } else {
              // Great: Powerup
              handleCollision({ ...entity, type: EntityType.POWERUP_LASER, value: 0 });
          }
          return;
      }

      if (isBad) {
          if (hasRocket) {
              playDamageSound(); 
              createParticles(stateRef.current.player.x, stateRef.current.player.y, 0, '#aaa', 15);
              stateRef.current.shake = 10;
              return;
          }
          if (hasShield) {
             playShieldBreakSound();
             stateRef.current.activePowerUps = stateRef.current.activePowerUps.filter(p => p.type !== EntityType.POWERUP_WALL);
             onPowerUpUpdate(stateRef.current.activePowerUps);
             stateRef.current.shake = 20;
             createParticles(stateRef.current.player.x, stateRef.current.player.y, 0, '#ea580c', 30); 
             return;
          }

          if (entity.type === EntityType.TAX) playTaxSound();
          else if (entity.type === EntityType.SEC_FINE) playSecFineSound();
          else if (entity.type === EntityType.FAKE_NEWS) playFakeNewsSound();
          else if (entity.type === EntityType.THE_SWAMP) { playSwampSound(); stateRef.current.swampSlowdown = 300; }
          else if (entity.type === EntityType.PINE_TREE || entity.type === EntityType.SNOWMAN || entity.type === EntityType.COAL) playSnowCrashSound();
          else if (entity.type === EntityType.THE_GRINCH) playGrinchSound();
          else playDamageSound();

          if (isDiamondMode) {
              stateRef.current.score = -1;
              endGame();
              createParticles(stateRef.current.player.x, stateRef.current.player.y, 0, '#ef4444', 100);
              setCommentaryTrigger('gameover');
              return;
          }

          stateRef.current.score += entity.value;
          stateRef.current.shake = entity.type === EntityType.SEC_FINE || entity.type === EntityType.THE_GRINCH ? 40 : 20; 
          stateRef.current.combo = 0;
          onComboUpdate(0);
          onScoreUpdate(stateRef.current.score, 1);
          createParticles(stateRef.current.player.x, stateRef.current.player.y, 0, '#ef4444', entity.type === EntityType.SEC_FINE ? 50 : 20);
          setCommentaryTrigger('miss');

          if (stateRef.current.score <= 0) endGame();
      } else {
          if (entity.type === EntityType.GIFT || entity.type === EntityType.CANDY_CANE) playSleighBellSound();
          else if (entity.type === EntityType.BITCOIN) playBitcoinSound();
          else if (entity.type === EntityType.ETHEREUM) playEthereumSound();
          else if (entity.type === EntityType.DOGE) playDogeSound();
          else playCollectSound();

          let val = entity.value;
          if (hasTesla) val *= 2;
          const fever = stateRef.current.combo >= COMBO_MAX;
          if (isDiamondMode) val *= 2;
          if (fever) val *= 4;
          else if (stateRef.current.combo > 50) val *= 2;
          
          stateRef.current.score += val;
          stateRef.current.combo = Math.min(COMBO_MAX, stateRef.current.combo + 10);
          onComboUpdate(stateRef.current.combo);
          onScoreUpdate(stateRef.current.score, fever ? 4 : (stateRef.current.combo > 50 ? 2 : 1));
          onEntityCollected(entity.type);
          
          const color = hasTesla ? '#0ea5e9' : (entity.type === EntityType.BITCOIN ? '#fbbf24' : '#fff');
          createParticles(stateRef.current.player.x, stateRef.current.player.y, 0, color, 10);
          if (Math.random() > 0.8) setCommentaryTrigger('hit');
      }
  };

  const endGame = () => {
    stateRef.current.isRunning = false;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    onGameOver(stateRef.current.score);
  };

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
        stateRef.current.score = 0;
        stateRef.current.activePowerUps = [];
        stateRef.current.isRunning = true;
        stateRef.current.shake = 0;
        stateRef.current.combo = 0;
        stateRef.current.speed = SPEED_BASE;
        stateRef.current.entities = []; 
        stateRef.current.elonCooldown = 0;
        stateRef.current.isVolatilityActive = false;
        setShowMissionModal(false);
        stateRef.current.lastMissionTime = 0;
        stateRef.current.gameTime = 0;
        fetchNewMission(); 
        
        stateRef.current.player = {
            x: isFlappyMode ? window.innerWidth * 0.2 : window.innerWidth / 2,
            y: window.innerHeight / 2,
            width: 100,
            height: 100,
            tilt: 0,
            vy: 0
        };
        
        if (!stateRef.current.initialApplied && initialUpgrades.length > 0) {
            const newPowerups: ActivePowerUp[] = [];
            initialUpgrades.forEach(u => {
                if (u === UpgradeType.ROCKET_START) newPowerups.push({ type: EntityType.POWERUP_ROCKET, timeLeft: 300 }); 
                if (u === UpgradeType.TAX_EVASION) newPowerups.push({ type: EntityType.POWERUP_WALL, timeLeft: 99999 }); 
                if (u === UpgradeType.INSIDER_INFO) newPowerups.push({ type: EntityType.POWERUP_MAGNET, timeLeft: 600 });
                if (u === UpgradeType.DIET_COKE) stateRef.current.speed += 50; 
                if (u === UpgradeType.COVFEFE) {
                    for(let i=0; i<8; i++) {
                        if (isFlappyMode) spawnEntity(EntityType.DOGE, window.innerWidth + i * 100, window.innerHeight/2 + (Math.random()-0.5)*200, 0);
                        else spawnEntity(EntityType.DOGE, (Math.random()-0.5) * 500, undefined, 500 + i * 200);
                    }
                }
                if (u === UpgradeType.HAMBERDER) stateRef.current.combo = 80; 
                if (u === UpgradeType.GOLDEN_SNEAKERS) newPowerups.push({ type: EntityType.POWERUP_ROCKET, timeLeft: 120 });
            });
            stateRef.current.activePowerUps = newPowerups;
            onPowerUpUpdate(newPowerups);
            stateRef.current.initialApplied = true;
        }

        const handleMouseMove = (e: MouseEvent) => { if (!isFlappyMode) mouseRef.current = { x: e.clientX, y: e.clientY }; };
        const handleTouchMove = (e: TouchEvent) => { if (!isFlappyMode) mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
        const handleMouseDown = () => { if (isFlappyMode) jump(); };
        const handleKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space' && isFlappyMode) jump(); };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('keydown', handleKeyDown);
        
        requestRef.current = requestAnimationFrame(update);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('keydown', handleKeyDown);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    } else {
        stateRef.current.isRunning = false;
        stateRef.current.initialApplied = false;
    }
  }, [gameState, initialUpgrades, gameMode]);

  const floorPos = stateRef.current.floorOffset;
  const isFever = stateRef.current.combo >= COMBO_MAX;
  const hasTesla = stateRef.current.activePowerUps.some(p => p.type === EntityType.POWERUP_TESLA);
  const isVolatility = stateRef.current.isVolatilityActive;
  const hasRocket = stateRef.current.activePowerUps.some(p => p.type === EntityType.POWERUP_ROCKET);
  const hasWall = stateRef.current.activePowerUps.some(p => p.type === EntityType.POWERUP_WALL);
  const hasMagnet = stateRef.current.activePowerUps.some(p => p.type === EntityType.POWERUP_MAGNET);
  const hasLaser = stateRef.current.activePowerUps.some(p => p.type === EntityType.POWERUP_LASER);

  let skyClass = 'bg-slate-900';
  let floorStyle = {};
  
  if (isNorthPoleMode) {
      skyClass = 'animate-aurora'; 
      floorStyle = {
          background: `
              radial-gradient(circle at 50% 0%, rgba(224, 242, 254, 0.4) 0%, rgba(186, 230, 253, 0.1) 40%, transparent 80%),
              linear-gradient(to top, #475569 0%, transparent 100%)
          `,
          transform: `perspective(500px) rotateX(60deg) translateY(${floorPos}px) scale(4)`,
          transformOrigin: '50% 100%'
      };
  } else if (isFever) {
      skyClass = 'bg-amber-900';
      floorStyle = {
          background: `
            linear-gradient(to top, #78350f 0%, transparent 100%),
            repeating-linear-gradient(0deg, rgba(251, 191, 36, 0.5) 0px, transparent 1px, transparent 50px),
            repeating-linear-gradient(90deg, rgba(251, 191, 36, 0.5) 0px, transparent 1px, transparent 100px)
          `,
          transform: `perspective(500px) rotateX(60deg) translateY(${floorPos}px) scale(2)`,
          transformOrigin: '50% 100%'
      };
  } else if (isDiamondMode) {
      skyClass = 'bg-cyan-950';
       floorStyle = {
          background: `
            linear-gradient(to top, #083344 0%, transparent 100%),
            repeating-linear-gradient(0deg, rgba(34, 211, 238, 0.3) 0px, transparent 1px, transparent 50px),
            repeating-linear-gradient(90deg, rgba(34, 211, 238, 0.3) 0px, transparent 1px, transparent 100px)
          `,
          transform: `perspective(500px) rotateX(60deg) translateY(${floorPos}px) scale(2)`,
          transformOrigin: '50% 100%'
      };
  } else {
      floorStyle = {
          background: `
            linear-gradient(to top, #1e293b 0%, transparent 100%),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.2) 0px, transparent 1px, transparent 50px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.2) 0px, transparent 1px, transparent 100px)
          `,
          transform: `perspective(500px) rotateX(60deg) translateY(${floorPos}px) scale(2)`,
          transformOrigin: '50% 100%'
      };
  }

  if (isVolatility) skyClass = 'bg-red-900/50 animate-pulse';
  const shakeStyle = stateRef.current.shake > 0 ? { transform: `translate(${Math.random()*stateRef.current.shake - stateRef.current.shake/2}px, ${Math.random()*stateRef.current.shake - stateRef.current.shake/2}px)` } : {};

  // Background Parallax synchronized with stateRef.current.gameTime which is updated every render frame now
  const backParallax = (stateRef.current.gameTime * 0.2) % 2000;
  const midParallax = (stateRef.current.gameTime * 0.5) % 2000;
  const villageParallax = (stateRef.current.gameTime * 0.8) % 2000;

  return (
    <div 
        ref={canvasRef} 
        className={`w-full h-full relative overflow-hidden ${skyClass} transition-colors duration-1000 perspective-container ${isVolatility ? 'animate-glitch' : ''}`}
        style={shakeStyle}
    >
        {!isFlappyMode && (
        <>
            <div className={`absolute left-1/2 bottom-[35%] -translate-x-1/2 transition-all duration-1000 z-10 ${isDiamondMode ? 'opacity-80' : 'opacity-100'}`}>
                {isNorthPoleMode ? (
                     <SantaMoonIcon className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] text-yellow-100 animate-pulse-scale opacity-90 drop-shadow-[0_0_50px_rgba(255,255,255,0.8)]" />
                ) : (
                     <BitcoinIcon className={`w-[500px] h-[500px] md:w-[700px] md:h-[700px] ${isDiamondMode ? 'text-cyan-400' : 'text-yellow-500'} animate-pulse-scale opacity-20 blur-sm`} />
                )}
            </div>
            
            {isNorthPoleMode && !isFlappyMode && (
                <>
                    <div className="absolute left-0 bottom-[30%] w-[4000px] h-[400px] opacity-60 z-10 flex" style={{ transform: `translateX(-${backParallax}px)` }}>
                        <MountainRangeIcon className="w-[2000px] h-full text-indigo-900" fill="#312e81" />
                        <MountainRangeIcon className="w-[2000px] h-full text-indigo-900" fill="#312e81" />
                    </div>
                    <div className="absolute left-0 bottom-[25%] w-[4000px] h-[300px] opacity-80 z-20 flex" style={{ transform: `translateX(-${midParallax}px)` }}>
                        <MountainRangeIcon className="w-[2000px] h-full" fill="#64748b" />
                        <MountainRangeIcon className="w-[2000px] h-full" fill="#64748b" />
                    </div>
                    <div className="absolute left-0 bottom-[280px] w-[4000px] h-[150px] opacity-100 z-30 flex" style={{ transform: `translateX(-${villageParallax}px)` }}>
                        <div className="w-[2000px] h-full flex justify-around">
                             <NorthPoleVillageIcon className="w-[600px] h-full" />
                             <div className="w-[400px]"></div>
                             <NorthPoleVillageIcon className="w-[600px] h-full" />
                        </div>
                        <div className="w-[2000px] h-full flex justify-around">
                             <NorthPoleVillageIcon className="w-[600px] h-full" />
                             <div className="w-[400px]"></div>
                             <NorthPoleVillageIcon className="w-[600px] h-full" />
                        </div>
                    </div>
                </>
            )}

            {stateRef.current.stars.map((s, i) => {
                const scale = FOV / (FOV + s.z);
                const x = window.innerWidth / 2 + s.x * scale;
                const y = window.innerHeight / 2 + s.y * scale;
                return (
                    <div key={i} className={`absolute rounded-full ${isNorthPoleMode ? 'bg-white blur-[1px]' : 'bg-white'}`}
                        style={{ left: x, top: y, width: (isNorthPoleMode ? 5 : 3)*scale, height: (isNorthPoleMode ? 5 : 3)*scale, opacity: Math.min(1, scale) }}
                    />
                )
            })}

            <div className="absolute inset-0 fog-gradient pointer-events-none z-30"></div>

            <div className="absolute w-full h-[50vh] bottom-0 left-0 overflow-hidden z-20">
                <div className="w-full h-full" style={floorStyle}></div>
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] blur-[100px] rounded-full ${isNorthPoleMode ? 'bg-white/40' : 'bg-yellow-400/10'}`}></div>
            </div>

            {shadowsDisplay.map(s => (
                <div key={`shadow-${s.id}`} className="absolute rounded-[50%] bg-black z-20"
                    style={{ left: s.sx - s.width/2, top: s.sy - s.height/2, width: s.width, height: s.height, opacity: s.opacity, filter: `blur(${s.blur}px)`, transform: `skewX(${s.skew}deg)` }}
                />
            ))}
        </>
        )}
        
        {isFlappyMode && (
            <div className="absolute inset-0 z-0">
                {stateRef.current.stars.map((s, i) => (
                    <div key={i} className="absolute rounded-full bg-white opacity-50" style={{ left: s.x, top: Math.abs(s.y) % window.innerHeight, width: 2, height: 2 }} />
                ))}
            </div>
        )}

        {entitiesDisplay.map(entity => {
            let x, y, w, h, opacity, zIndex;
            
            if (isFlappyMode) {
                x = entity.x; y = entity.y; w = entity.width; h = entity.height; opacity = 1; zIndex = 10;
            } else {
                const scale = FOV / (FOV + entity.z);
                if (scale <= 0) return null;
                x = window.innerWidth / 2 + entity.x * scale - (entity.width * scale) / 2;
                y = window.innerHeight / 2 + entity.y * scale - (entity.height * scale) / 2;
                w = entity.width * scale;
                h = entity.height * scale;
                opacity = Math.min(1, scale * 1.5);
                zIndex = Math.floor(5000 - entity.z);
                const distFactor = entity.z / SPAWN_Z; 
                opacity *= (1 - distFactor * 0.5); 
            }
            if (isVolatility && Math.random() > 0.8) opacity = 0.2;

            const isCoin = entity.type === EntityType.BITCOIN || entity.type === EntityType.DOGE || entity.type === EntityType.ETHEREUM || entity.type === EntityType.GIFT || entity.type === EntityType.CANDY_CANE;
            const isTeslaTarget = hasTesla && isCoin && ((!isFlappyMode && entity.z < 800) || (isFlappyMode && entity.x < window.innerWidth));

            return (
                <div key={entity.id} className="absolute flex items-center justify-center will-change-transform"
                    style={{ left: x, top: y, width: w, height: h, opacity, zIndex, filter: !isFlappyMode ? `blur(${Math.max(0, entity.z/800)}px) brightness(${1 - entity.z/4000}) drop-shadow(0 10px 10px rgba(0,0,0,0.5))` : 'none' }}
                >
                    {entity.type === EntityType.BITCOIN && <BitcoinIcon className={`w-full h-full ${isTeslaTarget ? 'animate-spin-y-fast' : 'animate-spin-y'}`} />}
                    {entity.type === EntityType.DOGE && <DogeIcon className={`w-full h-full ${isTeslaTarget ? 'animate-spin-y-fast' : 'animate-spin-y'}`} />}
                    {entity.type === EntityType.TAX && <TaxIcon className="w-full h-full animate-pulse" />}
                    {entity.type === EntityType.SEC_FINE && <SecIcon className="w-full h-full animate-ping" />}
                    {entity.type === EntityType.FAKE_NEWS && <FakeNewsIcon className="w-full h-full animate-tumble" />}
                    {entity.type === EntityType.THE_SWAMP && <SwampIcon className="w-full h-full animate-pulse" />}
                    {entity.type === EntityType.MYSTERY_BOX && <MysteryBoxIcon className="w-full h-full animate-spin-y" />}
                    {entity.type === EntityType.POWERUP_WALL && <WallIcon className="w-full h-full animate-pulse-scale" />}
                    {entity.type === EntityType.POWERUP_MAGNET && <MagnetIcon className="w-full h-full animate-pulse-scale" />}
                    {entity.type === EntityType.POWERUP_ROCKET && <RocketIcon className="w-full h-full animate-pulse-scale" />}
                    {entity.type === EntityType.POWERUP_LASER && <div className="w-full h-full rounded-full bg-red-600 border-4 border-white animate-pulse-scale flex items-center justify-center text-white font-bold text-xs">LASER</div>}
                    {entity.type === EntityType.ELON_TRUCK && <ElonTruckIcon className="w-full h-full" />}
                    {entity.type === EntityType.POWERUP_TESLA && <TeslaCoilIcon className="w-full h-full animate-pulse-scale" />}
                    {entity.type === EntityType.GIFT && <GiftIcon className={`w-full h-full ${isTeslaTarget ? 'animate-pulse' : 'animate-float'}`} />}
                    {entity.type === EntityType.PINE_TREE && <PineTreeIcon className="w-full h-full" />}
                    {entity.type === EntityType.SNOWMAN && <SnowmanIcon className="w-full h-full" />}
                    {entity.type === EntityType.CANDY_CANE && <CandyCaneIcon className="w-full h-full animate-spin-y" />}
                    {entity.type === EntityType.COAL && <CoalIcon className="w-full h-full animate-tumble" />}
                    {entity.type === EntityType.THE_GRINCH && <GrinchIcon className="w-full h-full animate-pulse" />}
                    {isTeslaTarget && <div className="absolute inset-[-20%] rounded-full border-2 border-cyan-200 animate-ping opacity-50"></div>}
                </div>
            )
        })}
        
        {isNorthPoleMode && !isFlappyMode && (
            <>
                <div className="absolute inset-0 z-[100] animate-snow pointer-events-none opacity-80" style={{backgroundSize: '400px 400px', animationDuration: '5s'}}></div>
                <div className="absolute inset-0 z-[100] animate-snow pointer-events-none opacity-60" style={{backgroundSize: '300px 300px', animationDuration: '10s', transform: 'scale(1.5)'}}></div>
                <div className="absolute inset-0 z-[100] animate-snow pointer-events-none opacity-40" style={{backgroundSize: '600px 600px', animationDuration: '15s', transform: 'scale(2)'}}></div>
            </>
        )}

        {stateRef.current.particles.map(p => {
             const scale = isFlappyMode ? 1 : FOV / (FOV + p.z);
             if (scale <= 0) return null;
             let px, py;
             if (isFlappyMode) { px = p.x; py = p.y; } else { px = window.innerWidth / 2 + p.x * scale; py = window.innerHeight / 2 + p.y * scale; }
             return (
                 <div key={p.id} className="absolute rounded-full"
                    style={{ left: px, top: py, width: (isFlappyMode ? 4 : 5 * scale), height: (isFlappyMode ? 4 : 5 * scale), backgroundColor: p.color, opacity: p.life, zIndex: 2000 }}
                 />
             )
        })}

        <div className="absolute z-50 transition-transform duration-75"
            style={{
                left: player.x - player.width / 2, top: player.y - player.height / 2, width: player.width, height: player.height,
                transform: `rotate(${player.tilt}deg) ${!isFlappyMode ? `rotateY(${stateRef.current.mouseVelocity.x * 0.5}deg) rotateX(${-stateRef.current.mouseVelocity.y * 0.5}deg)` : ''}`
            }}
        >
            {/* LASER EYES EFFECT */}
            {hasLaser && (
                <>
                    <LaserEyesEffect className="absolute top-[20px] left-[35px] w-[20px] h-[800px] origin-top transform -rotate-12 opacity-80" />
                    <LaserEyesEffect className="absolute top-[20px] right-[35px] w-[20px] h-[800px] origin-top transform rotate-12 opacity-80" />
                </>
            )}

            {isNorthPoleMode ? (
                <>
                    <SledgeTrumpIcon className="w-full h-full drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]" />
                    <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full animate-ping"></div>
                    <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-red-500/20 blur-[60px] rounded-full pointer-events-none -z-10 transform -translate-y-1/2"></div>
                </>
            ) : (
                <TrumpBackIcon className="w-full h-full drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]" skin={skin} />
            )}
            
            {hasWall && <div className="absolute inset-[-20%] border-4 border-orange-500 rounded-full animate-pulse opacity-60"></div>}
            {hasMagnet && <div className="absolute inset-[-30%] border-2 border-yellow-400 rounded-full animate-spin opacity-40" style={{animationDuration: '3s'}}></div>}
            {hasRocket && <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>}
            {hasTesla && (
                <>
                    <div className="absolute inset-[-40%] border border-cyan-400 rounded-full animate-ping opacity-30"></div>
                    <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
                </>
            )}
            
            {hasTesla && (
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] pointer-events-none overflow-visible">
                    {entitiesDisplay.filter(e => e.z < 800 && (e.type === EntityType.BITCOIN || e.type === EntityType.DOGE || e.type === EntityType.GIFT || e.type === EntityType.CANDY_CANE)).map(e => {
                        const dx = (e.x - player.x) * (isFlappyMode ? 1 : 0.5); 
                        const dy = (e.y - player.y) * (isFlappyMode ? 1 : 0.5);
                        return <path key={`bolt-${e.id}`} d={`M500 500 L${500 + dx} ${500 + dy}`} stroke="#0ea5e9" strokeWidth="2" strokeDasharray="10,10" className="animate-pulse" />
                    })}
                </svg>
            )}
        </div>
        
        {hasRocket && <div className="absolute inset-0 bg-blue-500/10 pointer-events-none z-40 mix-blend-overlay"></div>}
        {hasWall && <div className="absolute inset-0 border-[20px] border-orange-500/20 pointer-events-none z-40 box-border"></div>}
        {hasTesla && <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none z-40 animate-pulse"></div>}
        {hasLaser && <div className="absolute inset-0 bg-red-500/5 pointer-events-none z-40 animate-pulse"></div>}
        
        {showMissionModal && (
            <div className="absolute inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center animate-fade-in p-4">
                 <div className="bg-red-900 border-4 border-yellow-500 p-6 md:p-8 rounded-xl max-w-2xl w-full text-center shadow-[0_0_50px_rgba(234,179,8,0.5)] relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]"></div>
                      <div className="relative z-10">
                          <h1 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-widest uppercase">PRESIDENTIAL ALERT</h1>
                          <div className="flex justify-center my-6">
                               <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-500 overflow-hidden bg-slate-800">
                                   <SantaTrumpFaceIcon className="w-full h-full transform scale-110 translate-y-2" />
                               </div>
                          </div>
                          <p className="text-yellow-400 font-bold text-lg md:text-xl mb-6 font-mono typing-effect">"{mission}"</p>
                          <button onClick={resumeFromMission} className="bg-green-600 hover:bg-green-500 text-white font-black text-xl md:text-2xl py-3 px-8 md:py-4 md:px-12 rounded shadow-xl hover:scale-105 transition-transform w-full md:w-auto">I ACCEPT!</button>
                      </div>
                 </div>
            </div>
        )}

        {!showMissionModal && (
            <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 bg-slate-900/80 border border-yellow-500/50 px-4 py-1 md:px-6 md:py-2 rounded-full backdrop-blur z-40 flex flex-col items-center whitespace-nowrap">
                 <div className="text-yellow-500 font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase mb-1">CURRENT MISSION</div>
                 <div className="text-white font-bold text-xs md:text-sm text-center">{mission}</div>
            </div>
        )}
        
        {isVolatility && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white font-black text-2xl md:text-4xl px-4 py-2 md:px-8 md:py-4 -rotate-3 z-50 animate-pulse shadow-xl border-4 border-white whitespace-nowrap">
                HIGH VOLATILITY!
            </div>
        )}
        
        <div className="absolute inset-0 pointer-events-none z-30 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]"></div>
    </div>
  );
};