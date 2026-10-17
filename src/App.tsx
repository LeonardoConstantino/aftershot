import React, { useState, useEffect, useCallback } from 'react';
import { GameScreen, GameSession, GameSettings, BestStats } from './types/game';
import { 
  loadSettings, 
  saveSettings, 
  loadStats, 
  saveStats, 
  isOnboarded, 
  setOnboarded 
} from './utils/storage';
import { soundEngine } from './audio/soundEngine';
import { haptics } from './utils/haptics';

import { SplashView } from './components/SplashView';
import { MenuView } from './components/MenuView';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { PosterModal } from './components/PosterModal';
import { RecordsModal } from './components/RecordsModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LandscapeOverlay } from './components/LandscapeOverlay';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('SPLASH');
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [stats, setStats] = useState<BestStats>(loadStats);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!isOnboarded());

  // Game session states
  const [gameKey, setGameKey] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);
  const [maxMisses] = useState<number>(3);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [showPosterModal, setShowPosterModal] = useState<boolean>(false);

  // Sync settings and audio on change
  useEffect(() => {
    saveSettings(settings);
    soundEngine.configure(settings.soundEnabled, settings.sfxVolume, settings.chorusEnabled);
    haptics.setEnabled(settings.hapticsEnabled);
  }, [settings]);

  // Sync stats
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  /**
   * Start a new game session
   */
  const handleStartGame = useCallback(() => {
    soundEngine.unlock();
    soundEngine.playButton();
    haptics.trigger('tap');

    setScore(0);
    setStreak(0);
    setMisses(0);
    setIsNewRecord(false);
    setCurrentSession(null);
    setShowPosterModal(false);
    setGameKey((prev) => prev + 1);
    setScreen('PLAYING');
  }, []);

  /**
   * Score update callback from GameCanvas
   */
  const handleScoreUpdate = useCallback((newScore: number, newStreak: number, isPrecision: boolean) => {
    setScore(newScore);
    setStreak(newStreak);

    // Update ongoing record if beaten
    if (newScore > stats.highScore) {
      setIsNewRecord(true);
    }

    setStats((prev) => ({
      ...prev,
      highScore: Math.max(prev.highScore, newScore),
      bestStreak: Math.max(prev.bestStreak, newStreak),
      totalPrecision: prev.totalPrecision + (isPrecision ? 1 : 0),
    }));
  }, [stats.highScore]);

  /**
   * Miss update callback from GameCanvas
   */
  const handleMissUpdate = useCallback((newMisses: number) => {
    setMisses(newMisses);
    setStreak(0);
  }, []);

  /**
   * Game Over triggered by GameCanvas when misses exceed limit
   */
  const handleGameOver = useCallback((session: GameSession) => {
    setCurrentSession(session);
    setScreen('GAME_OVER');

    // Update global lifetime statistics
    setStats((prev) => ({
      ...prev,
      highScore: Math.max(prev.highScore, session.score),
      bestStreak: Math.max(prev.bestStreak, session.maxStreak),
      totalPrecision: prev.totalPrecision + session.precisionHits,
      totalGames: prev.totalGames + 1,
      totalArrowsShot: prev.totalArrowsShot + session.totalShots,
      runCompositions: [
        {
          id: session.id,
          score: session.score,
          date: new Date().toLocaleDateString('pt-BR'),
          arrowCount: session.persistentArrows.length,
        },
        ...prev.runCompositions.slice(0, 9),
      ],
    }));
  }, []);

  /**
   * First shot onboarding dismissal
   */
  const handleFirstShot = useCallback(() => {
    if (showOnboarding) {
      setShowOnboarding(false);
      setOnboarded();
    }
  }, [showOnboarding]);

  /**
   * Settings updater
   */
  const handleUpdateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return (
    <div className="relative w-full h-dynamic-screen h-[100dvh] max-h-[100dvh] bg-[#E5DDD0] flex items-center justify-center overflow-hidden font-body">
      {/* Orientation advisory when device is rotated to landscape */}
      <LandscapeOverlay />

      {/* Mobile-first viewport container (full screen on mobile, elegant centered portrait frame on wide screens) */}
      <main className="relative w-full h-full max-w-[480px] sm:max-h-[920px] bg-[#F3EBDD] overflow-hidden shadow-2xl flex flex-col sm:border sm:border-[#222321]/15 sm:rounded-3xl">
        {/* Screen 1: Splash */}
        {screen === 'SPLASH' && (
          <SplashView onStart={() => setScreen('MENU')} />
        )}

        {/* Screen 2: Menu */}
        {screen === 'MENU' && (
          <MenuView
            stats={stats}
            onPlay={handleStartGame}
            onOpenRecords={() => setScreen('RECORDS')}
            onOpenSettings={() => setScreen('SETTINGS')}
            onOpenHowToPlay={() => setScreen('HOW_TO_PLAY')}
          />
        )}

        {/* Screen 3: Active Gameplay */}
        {(screen === 'PLAYING' || screen === 'PAUSED') && (
          <div className="relative w-full h-full select-none touch-none">
            <GameHUD
              score={score}
              streak={streak}
              misses={misses}
              maxMisses={maxMisses}
              zenMode={settings.zenMode}
              onPause={() => setScreen('PAUSED')}
            />

            <GameCanvas
              key={gameKey}
              settings={settings}
              score={score}
              streak={streak}
              misses={misses}
              maxMisses={maxMisses}
              onScoreUpdate={handleScoreUpdate}
              onMissUpdate={handleMissUpdate}
              onGameOver={handleGameOver}
              onFirstShot={handleFirstShot}
              isPaused={screen === 'PAUSED'}
            />

            <OnboardingOverlay visible={showOnboarding} />

            {screen === 'PAUSED' && (
              <PauseModal
                settings={settings}
                onResume={() => setScreen('PLAYING')}
                onRestart={handleStartGame}
                onExitMenu={() => setScreen('MENU')}
                onToggleSound={() =>
                  handleUpdateSettings({ soundEnabled: !settings.soundEnabled })
                }
                onToggleHaptics={() =>
                  handleUpdateSettings({ hapticsEnabled: !settings.hapticsEnabled })
                }
              />
            )}
          </div>
        )}

        {/* Screen 4: Game Over & Sculpture Review */}
        {screen === 'GAME_OVER' && currentSession && (
          <div className="relative w-full h-full">
            <GameOverModal
              session={currentSession}
              stats={stats}
              isNewRecord={isNewRecord}
              onPlayAgain={handleStartGame}
              onOpenSharePoster={() => setShowPosterModal(true)}
              onExitMenu={() => setScreen('MENU')}
            />

            {showPosterModal && (
              <PosterModal
                session={currentSession}
                isNewRecord={isNewRecord}
                onClose={() => setShowPosterModal(false)}
              />
            )}
          </div>
        )}

        {/* Screen 5: Records / Estatísticas */}
        {screen === 'RECORDS' && (
          <RecordsModal
            stats={stats}
            onClose={() => setScreen('MENU')}
            onResetStats={() => {
              setStats({
                highScore: 0,
                bestStreak: 0,
                totalPrecision: 0,
                totalGames: 0,
                totalArrowsShot: 0,
                runCompositions: [],
              });
            }}
          />
        )}

        {/* Screen 6: Configurações */}
        {screen === 'SETTINGS' && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClose={() => setScreen('MENU')}
          />
        )}

        {/* Screen 7: Como Jogar */}
        {screen === 'HOW_TO_PLAY' && (
          <HowToPlayModal onClose={() => setScreen('MENU')} />
        )}
      </main>
    </div>
  );
}
