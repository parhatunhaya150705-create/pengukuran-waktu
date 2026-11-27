export type AppView =
  | 'home'
  | 'map'
  | 'learn'
  | 'demo'
  | 'simulation'
  | 'game'
  | 'rewards'
  | 'guide'
  | 'teacher';

export type QuestionType =
  | 'click_part'
  | 'set_clock'
  | 'multiple_choice'
  | 'match_activity';

export type DifficultyLevel = 'mudah' | 'sedang' | 'lanjut';

export type VoiceCharacter = 'tiki' | 'bimo' | 'narrator';

export type ClockNumberStyle = 'arabic' | 'roman' | 'dots';
export type ClockAppearance = 'classic' | 'colorful' | 'minimal' | 'playful';
export type AppFontFamily = 'outfit' | 'jakarta' | 'fredoka' | 'nunito';

export type ActivityKey =
  | 'bangun'
  | 'mandi'
  | 'sarapan'
  | 'sekolah'
  | 'belajar'
  | 'istirahat'
  | 'pulang'
  | 'bermain'
  | 'makan_malam'
  | 'tidur';

export interface ActivityItem {
  id: string;
  name: string;
  time: string;
  period: string;
  description: string;
  illustrationKey: ActivityKey;
  customImageUrl?: string;
}

export interface MaterialItem {
  id: string;
  order: number;
  title: string;
  type: 'numbers' | 'hands' | 'exact_hour' | 'half_hour' | 'daily_activities' | 'custom';
  summary: string;
  explanation: string;
  instruction: string;
  exampleTimes: string[];
  narrationText: string;
}

export interface GameQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  narration?: string;
  targetPart?: string; // e.g. '3', '6', '9', '12', 'hour_hand', 'minute_hand'
  targetHour?: number; // 1..12
  targetMinute?: number; // 0 or 30 (or 15/45 for advanced)
  displayHour?: number; // for multiple_choice clock display
  displayMinute?: number;
  choices?: string[];
  correctChoice?: string;
  activityKey?: ActivityKey;
  activityName?: string;
  hint?: string;
  feedbackCorrect: string;
  feedbackWrong: string;
  points: number;
  difficulty: DifficultyLevel;
}

export interface LevelConfig {
  id: number;
  areaName: string;
  gameTitle: string;
  description: string;
  instruction: string;
  badgeName: string;
  badgeIcon: 'compass' | 'clock' | 'sun' | 'moon' | 'calendar' | 'crown';
  rewardCoins: number;
  questionCount: number;
  difficulty: DifficultyLevel;
  timeLimitMinutes: number; // 0 = tanpa batas waktu
  customImageUrl?: string;
  unlockRequirement: string;
  accentColor: string;
  questions: GameQuestion[];
}

export interface EditableDialogs {
  simLearnHint: string;
  simExperimentQuestion: string;
  gameStartEncouragement: string;
  demoStepStart: string;
  demoStepMoving: string;
  demoStepEnd: string;
  mapSubtitle: string;
}

export interface DesignSettings {
  backgroundColor: string;
  buttonColor: string;
  clockFaceColor: string;
  clockBezelColor: string;
  clockNumberColor: string;
  hourHandColor: string;
  minuteHandColor: string;
  clockNumberStyle: ClockNumberStyle;
  clockAppearance: ClockAppearance;
  showMinuteTicks: boolean;
  fontFamily: AppFontFamily;
  fontSizeScale: 'small' | 'normal' | 'large';
  clockSize: 'small' | 'medium' | 'large';
  theme: 'sky' | 'forest' | 'sunset' | 'lavender';
  buttonShape: 'rounded' | 'soft' | 'pill' | 'tactile';
}

export interface AudioSettings {
  muted: boolean;
  narrationEnabled: boolean;
  bgMusicEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  narrationVolume: number;
  voiceCharacter: VoiceCharacter;
  customAudioMap: Record<string, string>;
}

export interface LearningSettings {
  timeScope: 'exact_only' | 'exact_and_half';
  defaultSimMode: 'learn' | 'challenge' | 'experiment';
  questionsPerLevel: number;
  difficulty: DifficultyLevel;
  autoFeedback: boolean;
  unlockAllLevels: boolean;
  showAdvancedChallenge: boolean;
}

export interface CustomImages {
  heroBg: string;
  mapBg: string;
  castleBg: string;
  tikiImageUrl?: string;
  bimoImageUrl?: string;
  extraIllustrationUrl?: string;
  illustrationPosition?: 'left' | 'right' | 'center';
}

export interface MediaConfig {
  mediaName: string;
  title: string;
  subtitle: string;
  tikiName: string;
  bimoName: string;
  description: string;
  schoolName: string;
  teacherName: string;
  className: string;
  subject: string;
  learningObjectives: string[];
  introNarration: string;
  dialogs: EditableDialogs;
  design: DesignSettings;
  audio: AudioSettings;
  learning: LearningSettings;
  images: CustomImages;
  materials: MaterialItem[];
  activities: ActivityItem[];
  levels: LevelConfig[];
}

export interface ScoreHistoryEntry {
  id: string;
  date: string;
  levelId: number;
  levelName: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  stars: number;
}

export interface StudentProgress {
  completedLevels: number[];
  levelStars: Record<number, number>;
  levelBestScores: Record<number, number>;
  totalScore: number;
  coins: number;
  earnedBadges: string[];
  history: ScoreHistoryEntry[];
}
