
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  SHOP = 'SHOP'
}

export enum GameMode {
  STANDARD = 'STANDARD',
  DIAMOND_HANDS = 'DIAMOND_HANDS',
  FLAPPY_TRUMP = 'FLAPPY_TRUMP',
  NORTH_POLE_DELIVERY = 'NORTH_POLE_DELIVERY'
}

export enum EntityType {
  BITCOIN = 'BITCOIN',
  ETHEREUM = 'ETHEREUM',
  DOGE = 'DOGE',
  TAX = 'TAX',
  SEC_FINE = 'SEC_FINE',
  FAKE_NEWS = 'FAKE_NEWS',
  // Power Ups
  POWERUP_WALL = 'POWERUP_WALL',
  POWERUP_MAGNET = 'POWERUP_MAGNET',
  POWERUP_ROCKET = 'POWERUP_ROCKET',
  POWERUP_TESLA = 'POWERUP_TESLA',
  POWERUP_LASER = 'POWERUP_LASER', // New Space Force Laser
  // Special
  ELON_TRUCK = 'ELON_TRUCK',
  THE_SWAMP = 'THE_SWAMP', // New Obstacle (Slow)
  MYSTERY_BOX = 'MYSTERY_BOX', // New Random Event
  // North Pole Mode
  GIFT = 'GIFT',
  PINE_TREE = 'PINE_TREE',
  SNOWMAN = 'SNOWMAN',
  CANDY_CANE = 'CANDY_CANE',
  COAL = 'COAL',
  THE_GRINCH = 'THE_GRINCH'
}

export enum SkinType {
  DEFAULT = 'DEFAULT', // Blue Suit
  DARK_MAGA = 'DARK_MAGA', // Black/Neon Suit
  GOLDEN_GOD = 'GOLDEN_GOD', // Full Gold Suit
  RED_HAT = 'RED_HAT' // Cheap Skin ($10)
}

export enum UpgradeType {
  ROCKET_START = 'ROCKET_START', // Starts with Rocket
  TAX_EVASION = 'TAX_EVASION',   // Starts with Wall
  INSIDER_INFO = 'INSIDER_INFO',  // Starts with Magnet
  // Dollar Menu Items
  DIET_COKE = 'DIET_COKE',       // Small Speed Boost ($5)
  COVFEFE = 'COVFEFE',           // Mystery Start (Coins) ($1)
  HAMBERDER = 'HAMBERDER',       // Combo Boost ($4)
  GOLDEN_SNEAKERS = 'GOLDEN_SNEAKERS' // Short Rocket Dash ($10)
}

export enum MissionType {
    COLLECT = 'COLLECT',
    SURVIVE = 'SURVIVE',
    SCORE = 'SCORE'
}

export interface Mission {
    text: string;
    type: MissionType;
    target: number;
    progress: number;
    completed: boolean;
}

// --- DAILY MISSION TYPES ---
export enum DailyMissionType {
  COLLECT_COINS = 'COLLECT_COINS', // Any coin
  COLLECT_BITCOIN = 'COLLECT_BITCOIN',
  COLLECT_DOGE = 'COLLECT_DOGE',
  SCORE_TOTAL = 'SCORE_TOTAL',
  PLAY_GAMES = 'PLAY_GAMES'
}

export interface DailyMission {
  date: string; // YYYY-MM-DD
  description: string;
  type: DailyMissionType;
  target: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  reward: number; // Satoshi amount
}

export interface Entity {
  id: number;
  type: EntityType;
  x: number; // World X
  y: number; // World Y
  z: number; // World Z (Depth)
  width: number;
  height: number;
  value: number;
  vx?: number; // Velocity X for moving entities like Elon
}

export interface Player {
  x: number; // Screen X
  y: number; // Screen Y
  width: number;
  height: number;
  tilt: number; // Visual rotation
  vy?: number; // Velocity Y for Flappy Mode
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  z: number; // Depth for 3D particles
  vx: number;
  vy: number;
  vz: number;
  life: number;
  color: string;
}

export interface Star {
  x: number;
  y: number;
  z: number;
}

export interface ActivePowerUp {
  type: EntityType;
  timeLeft: number; // Frames or ms
}
