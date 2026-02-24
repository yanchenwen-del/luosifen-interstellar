export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 900;

export const PLAYER_SIZE = 40;
export const PLAYER_SPEED = 5;
export const PLAYER_MAX_HEALTH = 3;

export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 15;
export const BULLET_SPEED = 8;

export const IMAGE_PATHS = {
  PLAYER: '/assets/player.png',
  ENEMY_BASIC: '/assets/enemy_basic.png',
  ENEMY_FAST: '/assets/enemy_fast.png',
  ENEMY_HEAVY: '/assets/enemy_heavy.png',
  POWERUP_TRIPLE: '/assets/powerup_triple.png',
  POWERUP_SHIELD: '/assets/powerup_shield.png',
};

export const ENEMY_CONFIG = {
  BASIC: {
    width: 40,
    height: 40,
    speed: 2,
    health: 1,
    score: 100,
    color: '#ef4444', // red-500
  },
  FAST: {
    width: 30,
    height: 30,
    speed: 4,
    health: 1,
    score: 200,
    color: '#f59e0b', // amber-500
  },
  HEAVY: {
    width: 60,
    height: 60,
    speed: 1,
    health: 3,
    score: 500,
    color: '#8b5cf6', // violet-500
  },
};

export const POWERUP_SIZE = 30;
export const POWERUP_SPEED = 2;
export const POWERUP_DURATION = 10000; // 10 seconds

export const ACHIEVEMENTS_LIST = [
  {
    id: 'first_blood',
    title: '第一滴血',
    description: '击落第一架敌机',
    icon: 'Target',
  },
  {
    id: 'survivor',
    title: '生存者',
    description: '达到第5关',
    icon: 'Shield',
  },
  {
    id: 'power_hungry',
    title: '能量狂人',
    description: '收集5个道具',
    icon: 'Zap',
  },
  {
    id: 'sharpshooter',
    title: '神枪手',
    description: '分数达到10000分',
    icon: 'Crosshair',
  },
  {
    id: 'ace_pilot',
    title: '王牌飞行员',
    description: '击落50架敌机',
    icon: 'Trophy',
  },
];
