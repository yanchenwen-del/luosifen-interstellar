import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GameState, GameStats, Achievement, ShootingMode } from './types';
import { ACHIEVEMENTS_LIST, PLAYER_MAX_HEALTH } from './constants';
import GameCanvas from './components/GameCanvas';
import { StartScreen, HUD, PauseScreen, GameOverScreen, AchievementPopup } from './components/UI';
import { Info, Shield, Zap, Target } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    level: 1,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    enemiesKilled: 0,
    powerUpsCollected: 0,
    distanceTraveled: 0,
  });
  const [achievements, setAchievements] = useState<Achievement[]>(
    ACHIEVEMENTS_LIST.map(a => ({ ...a, unlocked: false }))
  );
  const [lastAchievement, setLastAchievement] = useState<Achievement | null>(null);
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);
  const [shootingMode, setShootingMode] = useState<ShootingMode>(ShootingMode.MANUAL);

  const handleStart = () => {
    setStats({
      score: 0,
      level: 1,
      health: PLAYER_MAX_HEALTH,
      maxHealth: PLAYER_MAX_HEALTH,
      enemiesKilled: 0,
      powerUpsCollected: 0,
      distanceTraveled: 0,
    });
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (finalStats: GameStats) => {
    setStats(finalStats);
    setGameState(GameState.GAME_OVER);
  };

  const handleAchievementUnlock = useCallback((id: string) => {
    setAchievements(prev => {
      const achievement = prev.find(a => a.id === id);
      if (achievement && !achievement.unlocked) {
        const updated = prev.map(a => a.id === id ? { ...a, unlocked: true } : a);
        setLastAchievement({ ...achievement, unlocked: true });
        setTimeout(() => setLastAchievement(null), 4000);
        return updated;
      }
      return prev;
    });
  }, []);

  const handleLevelUp = useCallback((level: number) => {
    setLevelUpMessage(`关卡 ${level}`);
    setTimeout(() => setLevelUpMessage(null), 3000);
  }, []);

  const handleStatsUpdate = useCallback((newStats: GameStats) => {
    setStats(newStats);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP') {
        if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED);
        else if (gameState === GameState.PAUSED) setGameState(GameState.PLAYING);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex flex-col w-80 border-r border-white/10 p-8 bg-black/40 backdrop-blur-xl shrink-0">
        <div className="mb-12">
          <h2 className="text-2xl font-black italic tracking-tighter text-blue-500 mb-2">LUOSIFEN INTERSTELLAR</h2>
          <p className="text-xs text-white/30 uppercase tracking-widest">Operation Pioneer</p>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={12} /> 操作指南
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">移动</span>
                <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-mono">WASD / ARROWS</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">射击</span>
                <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-mono">SPACE</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">暂停</span>
                <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-mono">P</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={12} /> 道具说明
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Target size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold">三向子弹</div>
                  <div className="text-[10px] text-white/40">增强火力，覆盖更广范围</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Shield size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold">能量护盾</div>
                  <div className="text-[10px] text-white/40">抵挡一次敌机撞击</div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Info size={12} /> 自定义素材
            </h3>
            <p className="text-[10px] text-white/40 leading-relaxed">
              在本地运行时，您可以将 PNG 图片放入 <code>/public/assets/</code> 文件夹中来替换飞机和道具。
            </p>
          </section>
        </div>

        <div className="mt-auto pt-8 border-t border-white/10">
          <div className="flex items-center gap-2 text-[10px] text-white/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SYSTEMS ONLINE
          </div>
        </div>
      </aside>

      {/* Main Game Area */}
      <main className="relative flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-[600px] aspect-[2/3] md:aspect-[8/9] bg-black rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.1)] border border-white/5">
          <GameCanvas 
            gameState={gameState}
            shootingMode={shootingMode}
            onGameOver={handleGameOver}
            onAchievementUnlock={handleAchievementUnlock}
            onLevelUp={handleLevelUp}
            onStatsUpdate={handleStatsUpdate}
          />

          <AnimatePresence mode="wait">
            {gameState === GameState.START && (
              <StartScreen 
                key="start-screen" 
                onStart={handleStart} 
                shootingMode={shootingMode}
                onShootingModeChange={setShootingMode}
              />
            )}
            
            {gameState === GameState.PLAYING && (
              <HUD key="hud-overlay" stats={stats} />
            )}

            {gameState === GameState.PAUSED && (
              <PauseScreen 
                key="pause-screen"
                onResume={() => setGameState(GameState.PLAYING)} 
                onQuit={() => setGameState(GameState.START)} 
              />
            )}

            {gameState === GameState.GAME_OVER && (
              <GameOverScreen 
                key="game-over-screen"
                stats={stats} 
                achievements={achievements} 
                onRestart={handleStart} 
              />
            )}

            {levelUpMessage && (
              <motion.div 
                key="level-up-message"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
              >
                <div className="text-6xl font-black italic text-blue-400 tracking-tighter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                  {levelUpMessage}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Achievement Popups */}
      <AnimatePresence>
        {lastAchievement && (
          <AchievementPopup key={`achievement-${lastAchievement.id}`} achievement={lastAchievement} />
        )}
      </AnimatePresence>
    </div>
  );
}
