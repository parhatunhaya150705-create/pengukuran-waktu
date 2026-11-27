import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Clock, Menu, X } from 'lucide-react';
import { AppView } from './types/media';
import { useMediaStore } from './hooks/useMediaStore';
import { audioEngine } from './utils/audioEngine';
import { getFontFamilyValue } from './utils/designHelpers';
import { AudioSettingsModal } from './components/modals/AudioSettingsModal';
import { HomePage } from './pages/HomePage';
import { AdventureMap } from './pages/AdventureMap';
import { LearnPage } from './pages/LearnPage';
import { DemoAnimationPage } from './pages/DemoAnimationPage';
import { SimulationPage } from './pages/SimulationPage';
import { GameLevelView } from './pages/GameLevelView';
import { RewardsPage } from './pages/RewardsPage';
import { GuidePage } from './pages/GuidePage';
import { TeacherModePage } from './pages/TeacherModePage';

export default function App() {
  const {
    config,
    progress,
    updateConfig,
    replaceConfig,
    resetConfig,
    recordLevelCompletion,
    resetProgress,
  } = useMediaStore();

  const [view, setView] = useState<AppView>('home');
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [teacherInitialTab, setTeacherInitialTab] = useState<string>('texts');
  const [teacherGateVerified, setTeacherGateVerified] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (config.audio.bgMusicEnabled && !config.audio.muted) {
      audioEngine.startBackgroundMusic(config.audio);
    } else {
      audioEngine.stopBackgroundMusic();
    }
    return () => audioEngine.stopBackgroundMusic();
  }, [config.audio]);

  const navigate = (nextView: AppView) => {
    audioEngine.stopNarration();
    setView(nextView);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openTeacher = (tab: string = 'texts') => {
    setTeacherInitialTab(tab);
    navigate('teacher');
  };

  const activeLevel =
    config.levels.find((l) => l.id === activeLevelId) ?? config.levels[0];

  const navLinks: { id: AppView; label: string }[] = [
    { id: 'home', label: 'Beranda' },
    { id: 'map', label: 'Peta' },
    { id: 'learn', label: 'Belajar' },
    { id: 'simulation', label: 'Simulasi' },
    { id: 'rewards', label: 'Penghargaan' },
  ];

  const fontScaleClass =
    config.design.fontSizeScale === 'large'
      ? 'text-lg'
      : config.design.fontSizeScale === 'small'
        ? 'text-sm'
        : 'text-base';

  const activeFontFamily = getFontFamilyValue(config.design.fontFamily);

  return (
    <div
      className={`min-h-screen transition-colors ${fontScaleClass}`}
      style={
        {
          backgroundColor: config.design.backgroundColor,
          fontFamily: activeFontFamily,
          '--font-display': activeFontFamily,
          '--font-body': activeFontFamily,
        } as React.CSSProperties
      }
    >
      <header className="sticky top-0 z-40 border-b border-sky-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            <Clock className="h-5 w-5 text-sky-600" />
            <span>Dunia Waktu</span>
          </button>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            {navLinks.map((link) => {
              const active = view === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => {
                    audioEngine.playClick(config.audio);
                    navigate(link.id);
                  }}
                  className={`transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'text-sky-700 underline decoration-sky-500 decoration-2 underline-offset-8 font-bold'
                      : 'hover:text-slate-900 hover:underline underline-offset-8'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAudioModalOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-sky-50"
              aria-label="Pengaturan suara"
              title="Pengaturan Suara"
            >
              {config.audio.muted ? (
                <VolumeX className="h-4 w-4 text-rose-600" />
              ) : (
                <Volume2 className="h-4 w-4 text-sky-700" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                audioEngine.playClick(config.audio);
                openTeacher('texts');
              }}
              style={{ backgroundColor: config.design.buttonColor }}
              className="hidden min-h-[40px] rounded-xl px-4 py-2 text-xs font-extrabold text-white transition hover:brightness-110 whitespace-nowrap shrink-0 sm:inline-flex sm:items-center"
            >
              Edit Media
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 md:hidden"
              aria-label="Menu navigasi"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-sky-100 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => navigate(link.id)}
                  className={`min-h-[42px] rounded-xl px-3 py-2 text-left text-sm font-bold ${
                    view === link.id ? 'bg-sky-50 text-sky-800' : 'text-slate-700'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => navigate('demo')}
                className="min-h-[42px] rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-700"
              >
                Lihat Cara Membaca Jam
              </button>
              <button
                type="button"
                onClick={() => navigate('guide')}
                className="min-h-[42px] rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-700"
              >
                Panduan
              </button>
              <button
                type="button"
                onClick={() => openTeacher('texts')}
                className="mt-1 min-h-[42px] rounded-xl bg-sky-600 px-3 py-2 text-left text-sm font-bold text-white"
              >
                Mode Guru &amp; Edit Media
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        {view === 'home' && (
          <HomePage
            config={config}
            progress={progress}
            onNavigate={navigate}
            onOpenAudio={() => setAudioModalOpen(true)}
            onOpenTeacher={openTeacher}
          />
        )}

        {view === 'map' && (
          <AdventureMap
            config={config}
            progress={progress}
            onSelectLevel={(levelId) => {
              setActiveLevelId(levelId);
              navigate('game');
            }}
            onOpenRewards={() => navigate('rewards')}
          />
        )}

        {view === 'learn' && (
          <LearnPage
            config={config}
            onGoSimulation={() => navigate('simulation')}
            onGoAdventure={() => navigate('map')}
          />
        )}

        {view === 'demo' && (
          <DemoAnimationPage
            config={config}
            onTryYourself={() => navigate('simulation')}
          />
        )}

        {view === 'simulation' && <SimulationPage config={config} />}

        {view === 'game' && activeLevel && (
          <GameLevelView
            key={activeLevel.id}
            config={config}
            level={activeLevel}
            onExitToMap={() => navigate('map')}
            onNextLevel={(nextId) => {
              setActiveLevelId(nextId);
            }}
            onCompleteLevel={recordLevelCompletion}
          />
        )}

        {view === 'rewards' && (
          <RewardsPage
            config={config}
            progress={progress}
            onGoMap={() => navigate('map')}
          />
        )}

        {view === 'guide' && (
          <GuidePage
            config={config}
            onStartAdventure={() => navigate('map')}
            onOpenTeacher={() => openTeacher('guide')}
          />
        )}

        {view === 'teacher' && (
          <TeacherModePage
            key={teacherInitialTab}
            config={config}
            progress={progress}
            initialTab={teacherInitialTab}
            isGateVerified={teacherGateVerified}
            onVerifyGate={() => setTeacherGateVerified(true)}
            onSaveConfig={replaceConfig}
            onResetConfig={resetConfig}
            onResetProgress={resetProgress}
            onPreviewMedia={() => navigate('home')}
          />
        )}
      </main>

      <AudioSettingsModal
        isOpen={audioModalOpen}
        onClose={() => setAudioModalOpen(false)}
        audio={config.audio}
        onChangeAudio={(nextAudio) =>
          updateConfig((prev) => ({ ...prev, audio: nextAudio }))
        }
        tikiName={config.tikiName}
        bimoName={config.bimoName}
      />
    </div>
  );
}
