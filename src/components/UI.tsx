import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Shield, Zap, Target, Crosshair, Trophy, Info, Keyboard, MousePointer2 } from 'lucide-react';
import { GameState, GameStats, Achievement } from '../types';
import { ACHIEVEMENTS_LIST } from '../constants';

interface UIOverlayProps {
  gameState: GameState;
  stats: GameStats;
  achievements: Achievement[];
  onStart: () => void;
  onResume: () => void;
  onQuit: () => void;
  lastAchievement?: Achievement;
  levelUpMessage?: string;
}

export const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-6 text-center"
  >
    <motion.h1 
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600 mb-4 tracking-tighter"
    >
      LUOSIFEN星际先锋
    </motion.h1>
    <p className="text-blue-200/60 text-lg mb-12 max-w-md">
      穿越浩瀚星空，击败敌军舰队，成为最强星际飞行员。
    </p>
    
    <button 
      onClick={onStart}
      className="group relative px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.5)]"
    >
      <span className="flex items-center gap-2 text-xl">
        <Play className="fill-current" /> 开始航行
      </span>
    </button>

    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <Keyboard className="mx-auto mb-2 text-blue-400" />
        <h3 className="font-bold text-white mb-1">键盘控制</h3>
        <p className="text-xs text-white/50">WASD/方向键移动<br/>空格键射击 | P键暂停</p>
      </div>
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <MousePointer2 className="mx-auto mb-2 text-blue-400" />
        <h3 className="font-bold text-white mb-1">触屏控制</h3>
        <p className="text-xs text-white/50">在屏幕上滑动以控制战机<br/>自动射击模式开启</p>
      </div>
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <Zap className="mx-auto mb-2 text-blue-400" />
        <h3 className="font-bold text-white mb-1">强化道具</h3>
        <p className="text-xs text-white/50">收集蓝色3X强化火力<br/>收集绿色S获得护盾</p>
      </div>
    </div>
  </motion.div>
);

export const HUD: React.FC<{ stats: GameStats }> = ({ stats }) => (
  <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none z-40">
    <div className="space-y-2">
      <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
        <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Score</div>
        <div className="text-2xl font-mono text-white leading-none">{stats.score.toLocaleString()}</div>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: stats.maxHealth }).map((_, i) => (
          <motion.div 
            key={i}
            animate={{ 
              scale: i < stats.health ? 1 : 0.8,
              opacity: i < stats.health ? 1 : 0.2
            }}
            className="w-8 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        ))}
      </div>
    </div>
    
    <div className="text-right">
      <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
        <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Level</div>
        <div className="text-2xl font-mono text-white leading-none">{stats.level}</div>
      </div>
    </div>
  </div>
);

export const PauseScreen: React.FC<{ onResume: () => void; onQuit: () => void }> = ({ onResume, onQuit }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-50"
  >
    <h2 className="text-5xl font-black text-white mb-8 italic tracking-tighter">PAUSED</h2>
    <div className="flex flex-col gap-4 w-48">
      <button 
        onClick={onResume}
        className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform"
      >
        继续游戏
      </button>
      <button 
        onClick={onQuit}
        className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
      >
        退出
      </button>
    </div>
  </motion.div>
);

export const GameOverScreen: React.FC<{ stats: GameStats; achievements: Achievement[]; onRestart: () => void }> = ({ stats, achievements, onRestart }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl z-50 p-8 overflow-y-auto"
  >
    <motion.div 
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="max-w-md w-full text-center"
    >
      <h2 className="text-6xl font-black text-red-500 mb-2 tracking-tighter">MISSION FAILED</h2>
      <p className="text-white/40 mb-8">战机已被摧毁，任务中止。</p>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="text-xs text-white/40 uppercase mb-1">最终得分</div>
          <div className="text-3xl font-mono text-white">{stats.score.toLocaleString()}</div>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="text-xs text-white/40 uppercase mb-1">最高关卡</div>
          <div className="text-3xl font-mono text-white">{stats.level}</div>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="text-xs text-white/40 uppercase mb-1">击落敌机</div>
          <div className="text-3xl font-mono text-white">{stats.enemiesKilled}</div>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="text-xs text-white/40 uppercase mb-1">收集道具</div>
          <div className="text-3xl font-mono text-white">{stats.powerUpsCollected}</div>
        </div>
      </div>

      <div className="mb-8 text-left">
        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">已解锁成就</h3>
        <div className="space-y-2">
          {achievements.filter(a => a.unlocked).length > 0 ? (
            achievements.filter(a => a.unlocked).map(a => (
              <div key={a.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  {a.icon === 'Target' && <Target size={16} />}
                  {a.icon === 'Shield' && <Shield size={16} />}
                  {a.icon === 'Zap' && <Zap size={16} />}
                  {a.icon === 'Crosshair' && <Crosshair size={16} />}
                  {a.icon === 'Trophy' && <Trophy size={16} />}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{a.title}</div>
                  <div className="text-[10px] text-white/40">{a.description}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/20 text-center py-4 italic">暂无成就解锁</p>
          )}
        </div>
      </div>

      <button 
        onClick={onRestart}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)]"
      >
        重新开始任务
      </button>
    </motion.div>
  </motion.div>
);

export const AchievementPopup: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
  <motion.div 
    initial={{ x: 100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 100, opacity: 0 }}
    className="fixed bottom-8 right-8 bg-black/80 backdrop-blur-xl border border-blue-500/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[100]"
  >
    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]">
      {achievement.icon === 'Target' && <Target />}
      {achievement.icon === 'Shield' && <Shield />}
      {achievement.icon === 'Zap' && <Zap />}
      {achievement.icon === 'Crosshair' && <Crosshair />}
      {achievement.icon === 'Trophy' && <Trophy />}
    </div>
    <div>
      <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">成就解锁</div>
      <div className="text-lg font-bold text-white leading-tight">{achievement.title}</div>
      <div className="text-xs text-white/50">{achievement.description}</div>
    </div>
  </motion.div>
);
