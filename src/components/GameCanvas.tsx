import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  GameState, 
  Enemy, 
  EnemyType, 
  Bullet, 
  PowerUp, 
  PowerUpType, 
  Particle, 
  GameStats,
  ShootingMode
} from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PLAYER_SIZE, 
  PLAYER_SPEED, 
  PLAYER_MAX_HEALTH,
  BULLET_WIDTH,
  BULLET_HEIGHT,
  BULLET_SPEED,
  ENEMY_CONFIG,
  POWERUP_SIZE,
  POWERUP_SPEED,
  POWERUP_DURATION,
  IMAGE_PATHS
} from '../constants';
import { audioManager } from '../services/audioManager';

interface GameCanvasProps {
  gameState: GameState;
  shootingMode: ShootingMode;
  onGameOver: (stats: GameStats) => void;
  onAchievementUnlock: (id: string) => void;
  onLevelUp: (level: number) => void;
  onStatsUpdate: (stats: GameStats) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  shootingMode,
  onGameOver, 
  onAchievementUnlock, 
  onLevelUp,
  onStatsUpdate 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  
  // Game State Refs
  const playerRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 100,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    health: PLAYER_MAX_HEALTH,
    invincible: 0,
    shield: false,
    tripleShot: 0,
  });

  const keysRef = useRef<{ [key: string]: boolean }>({});
  const isTouchingRef = useRef(false);
  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<{x: number, y: number, size: number, speed: number, color: string}[]>([]);
  const nebulasRef = useRef<{x: number, y: number, size: number, color: string, opacity: number}[]>([]);
  
  const statsRef = useRef<GameStats>({
    score: 0,
    level: 1,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    enemiesKilled: 0,
    powerUpsCollected: 0,
    distanceTraveled: 0,
  });

  const lastEnemySpawnRef = useRef(0);
  const lastShotRef = useRef(0);

  // Load Images
  useEffect(() => {
    const loadImages = () => {
      const loadedImages: { [key: string]: HTMLImageElement } = {};
      Object.entries(IMAGE_PATHS).forEach(([key, path]) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
          loadedImages[key] = img;
        };
        // We don't block on error, just fallback to shapes
      });
      imagesRef.current = loadedImages;
    };
    loadImages();
  }, []);

  // Initialize stars and nebulas
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
        color: Math.random() > 0.8 ? '#93c5fd' : '#ffffff',
      });
    }
    starsRef.current = stars;

    const nebulas = [];
    for (let i = 0; i < 5; i++) {
      nebulas.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 300 + 200,
        color: i % 2 === 0 ? '#1e3a8a' : '#4c1d95',
        opacity: Math.random() * 0.1 + 0.05,
      });
    }
    nebulasRef.current = nebulas;
  }, []);

  // Audio start on first interaction
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      audioManager.startBGM();
    }
  }, [gameState]);

  // Handle Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleTouch = useCallback((e: React.TouchEvent) => {
    if (gameState !== GameState.PLAYING) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    const targetX = (touch.clientX - rect.left) * scaleX;
    const targetY = (touch.clientY - rect.top) * scaleY;
    
    playerRef.current.x += (targetX - playerRef.current.x) * 0.2;
    playerRef.current.y += (targetY - playerRef.current.y) * 0.2;
    
    playerRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_SIZE, playerRef.current.x));
    playerRef.current.y = Math.max(0, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, playerRef.current.y));
  }, [gameState]);

  const spawnEnemy = (time: number) => {
    const spawnRate = Math.max(400, 2000 - (statsRef.current.level * 150));
    if (time - lastEnemySpawnRef.current > spawnRate) {
      const rand = Math.random();
      let type = EnemyType.BASIC;
      if (rand > 0.85) type = EnemyType.HEAVY;
      else if (rand > 0.65) type = EnemyType.FAST;

      const config = ENEMY_CONFIG[type];
      const enemy: Enemy = {
        id: Math.random().toString(36).substr(2, 9),
        x: Math.random() * (CANVAS_WIDTH - config.width),
        y: -config.height,
        width: config.width,
        height: config.height,
        speedX: (Math.random() - 0.5) * (type === EnemyType.FAST ? 3 : 1),
        speedY: config.speed + (statsRef.current.level * 0.25),
        type,
        health: config.health,
        maxHealth: config.health,
        scoreValue: config.score,
        color: config.color,
      };
      enemiesRef.current.push(enemy);
      lastEnemySpawnRef.current = time;
    }
  };

  const spawnPowerUp = (x: number, y: number) => {
    if (Math.random() > 0.12) return;
    const type = Math.random() > 0.5 ? PowerUpType.TRIPLE_SHOT : PowerUpType.SHIELD;
    const powerUp: PowerUp = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      width: POWERUP_SIZE,
      height: POWERUP_SIZE,
      speedX: 0,
      speedY: POWERUP_SPEED,
      type,
      color: type === PowerUpType.TRIPLE_SHOT ? '#3b82f6' : '#10b981',
    };
    powerUpsRef.current.push(powerUp);
  };

  const createExplosion = (x: number, y: number, color: string, count = 10) => {
    audioManager.playExplosion();
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Math.random().toString(36).substr(2, 9),
        x,
        y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        life: 1,
        maxLife: 1,
        color,
        size: Math.random() * 5 + 2,
      });
    }
  };

  const shoot = (time: number) => {
    const cooldown = 200;
    if (time - lastShotRef.current > cooldown) {
      audioManager.playLaser();
      const p = playerRef.current;
      const bullets: Bullet[] = [];
      
      if (p.tripleShot > 0) {
        bullets.push({
          id: Math.random().toString(36).substr(2, 9),
          x: p.x + p.width / 2 - BULLET_WIDTH / 2,
          y: p.y,
          width: BULLET_WIDTH,
          height: BULLET_HEIGHT,
          speedX: 0,
          speedY: -BULLET_SPEED,
          damage: 1,
          isPlayer: true,
        });
        bullets.push({
          id: Math.random().toString(36).substr(2, 9),
          x: p.x + p.width / 2 - BULLET_WIDTH / 2,
          y: p.y,
          width: BULLET_WIDTH,
          height: BULLET_HEIGHT,
          speedX: -2.5,
          speedY: -BULLET_SPEED,
          damage: 1,
          isPlayer: true,
          angle: -0.25,
        });
        bullets.push({
          id: Math.random().toString(36).substr(2, 9),
          x: p.x + p.width / 2 - BULLET_WIDTH / 2,
          y: p.y,
          width: BULLET_WIDTH,
          height: BULLET_HEIGHT,
          speedX: 2.5,
          speedY: -BULLET_SPEED,
          damage: 1,
          isPlayer: true,
          angle: 0.25,
        });
      } else {
        bullets.push({
          id: Math.random().toString(36).substr(2, 9),
          x: p.x + p.width / 2 - BULLET_WIDTH / 2,
          y: p.y,
          width: BULLET_WIDTH,
          height: BULLET_HEIGHT,
          speedX: 0,
          speedY: -BULLET_SPEED,
          damage: 1,
          isPlayer: true,
        });
      }
      
      bulletsRef.current.push(...bullets);
      lastShotRef.current = time;
    }
  };

  const checkCollisions = () => {
    const p = playerRef.current;
    
    bulletsRef.current.forEach((bullet, bIdx) => {
      if (!bullet.isPlayer) return;
      enemiesRef.current.forEach((enemy, eIdx) => {
        if (
          bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y
        ) {
          enemy.health -= bullet.damage;
          bulletsRef.current.splice(bIdx, 1);
          
          if (enemy.health <= 0) {
            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, 18);
            statsRef.current.score += enemy.scoreValue;
            statsRef.current.enemiesKilled++;
            spawnPowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            enemiesRef.current.splice(eIdx, 1);
            
            if (statsRef.current.enemiesKilled === 1) onAchievementUnlock('first_blood');
            if (statsRef.current.enemiesKilled === 50) onAchievementUnlock('ace_pilot');
            if (statsRef.current.score >= 10000) onAchievementUnlock('sharpshooter');
          }
        }
      });
    });

    if (p.invincible <= 0) {
      enemiesRef.current.forEach((enemy, eIdx) => {
        if (
          p.x < enemy.x + enemy.width &&
          p.x + p.width > enemy.x &&
          p.y < enemy.y + enemy.height &&
          p.y + p.height > enemy.y
        ) {
          if (p.shield) {
            p.shield = false;
            audioManager.playPowerUp();
            createExplosion(p.x + p.width / 2, p.y + p.height / 2, '#10b981', 25);
          } else {
            p.health--;
            statsRef.current.health = p.health;
            createExplosion(p.x + p.width / 2, p.y + p.height / 2, '#ef4444', 30);
            if (p.health <= 0) {
              onGameOver(statsRef.current);
            } else {
              p.invincible = 120;
            }
          }
          enemiesRef.current.splice(eIdx, 1);
        }
      });
    }

    powerUpsRef.current.forEach((pu, idx) => {
      if (
        p.x < pu.x + pu.width &&
        p.x + p.width > pu.x &&
        p.y < pu.y + pu.height &&
        p.y + p.height > pu.y
      ) {
        audioManager.playPowerUp();
        if (pu.type === PowerUpType.TRIPLE_SHOT) p.tripleShot = 600;
        else if (pu.type === PowerUpType.SHIELD) p.shield = true;
        statsRef.current.powerUpsCollected++;
        if (statsRef.current.powerUpsCollected === 5) onAchievementUnlock('power_hungry');
        powerUpsRef.current.splice(idx, 1);
      }
    });
  };

  const update = (time: number) => {
    if (gameState !== GameState.PLAYING) return;

    const p = playerRef.current;
    
    if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) p.x -= PLAYER_SPEED;
    if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) p.x += PLAYER_SPEED;
    if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) p.y -= PLAYER_SPEED;
    if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) p.y += PLAYER_SPEED;
    
    p.x = Math.max(0, Math.min(CANVAS_WIDTH - p.width, p.x));
    p.y = Math.max(0, Math.min(CANVAS_HEIGHT - p.height, p.y));

    // 射击逻辑
    if (shootingMode === ShootingMode.AUTO) {
      shoot(time);
    } else {
      // 手动模式：键盘空格或触屏按下时射击
      if (keysRef.current['Space'] || isTouchingRef.current) {
        shoot(time);
      }
    }

    if (p.invincible > 0) p.invincible--;
    if (p.tripleShot > 0) p.tripleShot--;

    starsRef.current.forEach(star => {
      star.y += star.speed;
      if (star.y > CANVAS_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * CANVAS_WIDTH;
      }
    });

    nebulasRef.current.forEach(nebula => {
      nebula.y += 0.2;
      if (nebula.y > CANVAS_HEIGHT + nebula.size) {
        nebula.y = -nebula.size;
        nebula.x = Math.random() * CANVAS_WIDTH;
      }
    });

    spawnEnemy(time);
    enemiesRef.current.forEach((enemy, idx) => {
      enemy.y += enemy.speedY;
      enemy.x += enemy.speedX;
      if (enemy.x <= 0 || enemy.x + enemy.width >= CANVAS_WIDTH) enemy.speedX *= -1;
      if (enemy.y > CANVAS_HEIGHT) {
        enemiesRef.current.splice(idx, 1);
        statsRef.current.score = Math.max(0, statsRef.current.score - 50);
      }
    });

    bulletsRef.current.forEach((bullet, idx) => {
      bullet.y += bullet.speedY;
      bullet.x += bullet.speedX;
      if (bullet.y < -50 || bullet.y > CANVAS_HEIGHT + 50) bulletsRef.current.splice(idx, 1);
    });

    powerUpsRef.current.forEach((pu, idx) => {
      pu.y += pu.speedY;
      if (pu.y > CANVAS_HEIGHT) powerUpsRef.current.splice(idx, 1);
    });

    particlesRef.current.forEach((particle, idx) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 0.02;
      if (particle.life <= 0) particlesRef.current.splice(idx, 1);
    });

    checkCollisions();

    const nextLevelScore = statsRef.current.level * 5000;
    if (statsRef.current.score >= nextLevelScore) {
      statsRef.current.level++;
      audioManager.playLevelUp();
      onLevelUp(statsRef.current.level);
      enemiesRef.current = [];
      if (statsRef.current.level === 5) onAchievementUnlock('survivor');
    }

    onStatsUpdate({ ...statsRef.current });
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Nebulas
    nebulasRef.current.forEach(n => {
      const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.size);
      gradient.addColorStop(0, n.color);
      gradient.addColorStop(1, 'transparent');
      ctx.globalAlpha = n.opacity;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw Stars
    starsRef.current.forEach(star => {
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw PowerUps
    powerUpsRef.current.forEach(pu => {
      const imgKey = pu.type === PowerUpType.TRIPLE_SHOT ? 'POWERUP_TRIPLE' : 'POWERUP_SHIELD';
      const img = imagesRef.current[imgKey];

      if (img) {
        ctx.drawImage(img, pu.x, pu.y, pu.width, pu.height);
      } else {
        ctx.shadowBlur = 15;
        ctx.shadowColor = pu.color;
        ctx.fillStyle = pu.color;
        ctx.beginPath();
        ctx.roundRect(pu.x, pu.y, pu.width, pu.height, 5);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(pu.type === PowerUpType.TRIPLE_SHOT ? '3X' : 'S', pu.x + pu.width / 2, pu.y + pu.height / 2 + 5);
      }
    });

    // Draw Bullets
    bulletsRef.current.forEach(b => {
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#3b82f6';
      ctx.fillStyle = '#60a5fa';
      ctx.save();
      ctx.translate(b.x + b.width / 2, b.y + b.height / 2);
      if (b.angle) ctx.rotate(b.angle);
      ctx.fillRect(-b.width / 2, -b.height / 2, b.width, b.height);
      ctx.restore();
    });

    // Draw Enemies
    enemiesRef.current.forEach(e => {
      const imgKey = e.type === EnemyType.BASIC ? 'ENEMY_BASIC' : 
                     e.type === EnemyType.FAST ? 'ENEMY_FAST' : 'ENEMY_HEAVY';
      const img = imagesRef.current[imgKey];

      if (img) {
        ctx.drawImage(img, e.x, e.y, e.width, e.height);
      } else {
        ctx.shadowBlur = 15;
        ctx.shadowColor = e.color;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.moveTo(e.x + e.width / 2, e.y + e.height);
        ctx.lineTo(e.x, e.y);
        ctx.lineTo(e.x + e.width, e.y);
        ctx.closePath();
        ctx.fill();
      }

      if (e.type === EnemyType.HEAVY) {
        ctx.fillStyle = '#333';
        ctx.fillRect(e.x, e.y - 10, e.width, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(e.x, e.y - 10, (e.health / e.maxHealth) * e.width, 4);
      }
    });

    // Draw Player
    const p = playerRef.current;
    if (p.invincible % 10 < 5) {
      const img = imagesRef.current['PLAYER'];
      if (img) {
        ctx.drawImage(img, p.x, p.y, p.width, p.height);
      } else {
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#3b82f6';
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(p.x + p.width / 2, p.y);
        ctx.lineTo(p.x, p.y + p.height);
        ctx.lineTo(p.x + p.width / 2, p.y + p.height * 0.8);
        ctx.lineTo(p.x + p.width, p.y + p.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#93c5fd';
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2, p.y + p.height * 0.4, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      if (p.shield) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width * 0.85, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    ctx.shadowBlur = 0;
  };

  const loop = (time: number) => {
    update(time);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) draw(ctx);
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onTouchStart={() => { isTouchingRef.current = true; }}
      onTouchEnd={() => { isTouchingRef.current = false; }}
      onTouchMove={handleTouch}
      className="w-full h-full object-contain bg-black rounded-lg shadow-2xl"
    />
  );
};

export default GameCanvas;
