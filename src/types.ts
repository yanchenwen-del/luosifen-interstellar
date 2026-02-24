export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export interface Point {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
}

export enum EnemyType {
  BASIC = 'BASIC',
  FAST = 'FAST',
  HEAVY = 'HEAVY',
}

export interface Enemy extends Entity {
  type: EnemyType;
  health: number;
  maxHealth: number;
  scoreValue: number;
  color: string;
}

export interface Bullet extends Entity {
  damage: number;
  isPlayer: boolean;
  angle?: number;
}

export enum PowerUpType {
  TRIPLE_SHOT = 'TRIPLE_SHOT',
  SHIELD = 'SHIELD',
}

export interface PowerUp extends Entity {
  type: PowerUpType;
  color: string;
}

export interface Particle extends Point {
  id: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface GameStats {
  score: number;
  level: number;
  health: number;
  maxHealth: number;
  enemiesKilled: number;
  powerUpsCollected: number;
  distanceTraveled: number;
}
