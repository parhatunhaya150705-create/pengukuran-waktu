import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_MEDIA_CONFIG, DEFAULT_STUDENT_PROGRESS } from '../data/defaultMedia';
import { MediaConfig, ScoreHistoryEntry, StudentProgress } from '../types/media';

const CONFIG_KEY = 'tiki_bimo_media_config_v1';
const PROGRESS_KEY = 'tiki_bimo_student_progress_v1';

function loadConfigFromStorage(): MediaConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_MEDIA_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_MEDIA_CONFIG,
      ...parsed,
      dialogs: { ...DEFAULT_MEDIA_CONFIG.dialogs, ...(parsed.dialogs || {}) },
      design: { ...DEFAULT_MEDIA_CONFIG.design, ...(parsed.design || {}) },
      audio: { ...DEFAULT_MEDIA_CONFIG.audio, ...(parsed.audio || {}) },
      learning: { ...DEFAULT_MEDIA_CONFIG.learning, ...(parsed.learning || {}) },
      images: { ...DEFAULT_MEDIA_CONFIG.images, ...(parsed.images || {}) },
    };
  } catch {
    return DEFAULT_MEDIA_CONFIG;
  }
}

function loadProgressFromStorage(): StudentProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_STUDENT_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STUDENT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_STUDENT_PROGRESS;
  }
}

export function useMediaStore() {
  const [config, setConfig] = useState<MediaConfig>(loadConfigFromStorage);
  const [progress, setProgress] = useState<StudentProgress>(loadProgressFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch {
      // Ignore quota errors cleanly
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // Ignore quota errors cleanly
    }
  }, [progress]);

  const updateConfig = useCallback((updater: (prev: MediaConfig) => MediaConfig) => {
    setConfig((prev) => updater(prev));
  }, []);

  const replaceConfig = useCallback((nextConfig: MediaConfig) => {
    setConfig(nextConfig);
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_MEDIA_CONFIG);
    try {
      localStorage.removeItem(CONFIG_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const recordLevelCompletion = useCallback(
    (entry: {
      levelId: number;
      levelName: string;
      score: number;
      correctCount: number;
      wrongCount: number;
      stars: number;
      coinsEarned: number;
      badgeName: string;
    }) => {
      setProgress((prev) => {
        const completed = prev.completedLevels.includes(entry.levelId)
          ? prev.completedLevels
          : [...prev.completedLevels, entry.levelId];

        const prevStars = prev.levelStars[entry.levelId] ?? 0;
        const prevBest = prev.levelBestScores[entry.levelId] ?? 0;
        const alreadyEarnedBadge = prev.earnedBadges.includes(entry.badgeName);

        const nextHistory: ScoreHistoryEntry = {
          id: `hist-${Date.now()}`,
          date: new Date().toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
          levelId: entry.levelId,
          levelName: entry.levelName,
          score: entry.score,
          correctCount: entry.correctCount,
          wrongCount: entry.wrongCount,
          stars: entry.stars,
        };

        const nextBestScores = {
          ...prev.levelBestScores,
          [entry.levelId]: Math.max(prevBest, entry.score),
        };

        const computedTotalScore = Object.values(nextBestScores).reduce((sum, s) => sum + s, 0);

        return {
          completedLevels: completed,
          levelStars: {
            ...prev.levelStars,
            [entry.levelId]: Math.max(prevStars, entry.stars),
          },
          levelBestScores: nextBestScores,
          totalScore: computedTotalScore,
          coins: prev.coins + (alreadyEarnedBadge ? Math.round(entry.coinsEarned / 2) : entry.coinsEarned),
          earnedBadges: alreadyEarnedBadge
            ? prev.earnedBadges
            : [...prev.earnedBadges, entry.badgeName],
          history: [nextHistory, ...prev.history].slice(0, 30),
        };
      });
    },
    []
  );

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_STUDENT_PROGRESS);
    try {
      localStorage.removeItem(PROGRESS_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    config,
    progress,
    updateConfig,
    replaceConfig,
    resetConfig,
    recordLevelCompletion,
    resetProgress,
  };
}
