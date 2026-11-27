import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Star,
  Coins,
  Award,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  Volume2,
  Compass,
  Clock,
  Sun,
  Moon,
  Calendar,
  Crown,
  Timer,
} from 'lucide-react';
import { GameQuestion, LevelConfig, MediaConfig } from '../types/media';
import {
  InteractiveClock,
  verifyClockAnswer,
} from '../components/clock/InteractiveClock';
import { TikiCharacter, BimoCharacter, CharacterDialogBox } from '../components/characters/TikiBimo';
import { ActivityIllustration } from '../components/illustrations/ActivityIllustration';
import { audioEngine } from '../utils/audioEngine';
import { getButtonStyleClass, getClockSizePixels } from '../utils/designHelpers';

interface GameLevelViewProps {
  config: MediaConfig;
  level: LevelConfig;
  onExitToMap: () => void;
  onNextLevel: (nextLevelId: number) => void;
  onCompleteLevel: (result: {
    levelId: number;
    levelName: string;
    score: number;
    correctCount: number;
    wrongCount: number;
    stars: number;
    coinsEarned: number;
    badgeName: string;
  }) => void;
}

export const BadgeEmblem: React.FC<{ icon: LevelConfig['badgeIcon']; earned: boolean }> = ({
  icon,
  earned,
}) => {
  const IconComp =
    icon === 'compass'
      ? Compass
      : icon === 'clock'
        ? Clock
        : icon === 'sun'
          ? Sun
          : icon === 'moon'
            ? Moon
            : icon === 'calendar'
              ? Calendar
              : Crown;

  return (
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-full border-4 shadow-sm ${
        earned
          ? 'border-amber-300 bg-gradient-to-br from-amber-400 to-orange-500 text-white'
          : 'border-slate-200 bg-slate-100 text-slate-400'
      }`}
    >
      <IconComp className="h-8 w-8" />
    </div>
  );
};

export const GameLevelView: React.FC<GameLevelViewProps> = ({
  config,
  level,
  onExitToMap,
  onNextLevel,
  onCompleteLevel,
}) => {
  const activeQuestions: GameQuestion[] = React.useMemo(() => {
    let list = [...level.questions];
    if (config.learning.timeScope === 'exact_only' && level.id === 6) {
      list = list.filter((q) => (q.targetMinute ?? 0) === 0 && (q.displayMinute ?? 0) === 0);
    }
    return list.slice(0, Math.max(1, Math.min(level.questionCount, list.length)));
  }, [level, config.learning.timeScope]);

  const [qIndex, setQIndex] = useState(0);
  const [clockMinutes, setClockMinutes] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [dragHoverDrop, setDragHoverDrop] = useState(false);

  const [status, setStatus] = useState<'answering' | 'correct' | 'wrong'>('answering');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showHint, setShowHint] = useState(false);

  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answeredCorrectlyThisQ, setAnsweredCorrectlyThisQ] = useState(false);
  const [finished, setFinished] = useState(false);
  const [castleBgFailed, setCastleBgFailed] = useState(false);

  // Optional level timer configured by teacher
  const [secondsLeft, setSecondsLeft] = useState<number>(
    level.timeLimitMinutes > 0 ? level.timeLimitMinutes * 60 : 0
  );

  useEffect(() => {
    if (level.timeLimitMinutes <= 0 || finished) return;
    const t = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(t);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [level.timeLimitMinutes, finished]);

  const currentQ = activeQuestions[qIndex];
  const btnShape = getButtonStyleClass(config.design.buttonShape);
  const clockSize = getClockSizePixels(config.design.clockSize);

  const resetQuestionState = (nextIdx: number) => {
    setQIndex(nextIdx);
    setClockMinutes(0);
    setSelectedChoice(null);
    setStatus('answering');
    setFeedbackMsg('');
    setShowHint(false);
    setAnsweredCorrectlyThisQ(false);
  };

  const handleRestartLevel = () => {
    audioEngine.playClick(config.audio);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setFinished(false);
    setSecondsLeft(level.timeLimitMinutes > 0 ? level.timeLimitMinutes * 60 : 0);
    resetQuestionState(0);
  };

  const finishLevel = (finalScore: number, finalCorrect: number, finalWrong: number) => {
    const ratio = finalCorrect / Math.max(1, activeQuestions.length);
    const stars = ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1;
    audioEngine.playVictory(config.audio);
    setFinished(true);
    onCompleteLevel({
      levelId: level.id,
      levelName: `${level.areaName}: ${level.gameTitle}`,
      score: finalScore,
      correctCount: finalCorrect,
      wrongCount: finalWrong,
      stars,
      coinsEarned: level.rewardCoins,
      badgeName: level.badgeName,
    });
  };

  const handleAdvance = () => {
    audioEngine.playClick(config.audio);
    if (qIndex + 1 >= activeQuestions.length) {
      finishLevel(score, correctCount, wrongCount);
    } else {
      resetQuestionState(qIndex + 1);
    }
  };

  const markCorrect = (customMsg?: string) => {
    audioEngine.playCorrect(config.audio);
    audioEngine.playStar(config.audio);
    const msg = customMsg || currentQ.feedbackCorrect;
    setStatus('correct');
    setFeedbackMsg(msg);
    if (!answeredCorrectlyThisQ) {
      setScore((s) => s + (currentQ.points || 10));
      setCorrectCount((c) => c + 1);
      setAnsweredCorrectlyThisQ(true);
    }
    audioEngine.speak(msg, config.audio, 'tiki');
  };

  const markWrong = (customMsg?: string) => {
    audioEngine.playWrong(config.audio);
    const msg = customMsg || currentQ.feedbackWrong;
    setStatus('wrong');
    setFeedbackMsg(msg);
    if (!answeredCorrectlyThisQ) {
      setWrongCount((w) => w + 1);
    }
    audioEngine.speak(msg, config.audio, 'bimo');
  };

  const handlePartClick = (part: string) => {
    if (status === 'correct' || currentQ.type !== 'click_part') return;
    if (part === currentQ.targetPart) {
      markCorrect();
    } else {
      markWrong();
    }
  };

  const handleCheckClock = () => {
    if (status === 'correct') return;
    const targetH = currentQ.targetHour ?? 12;
    const targetM = currentQ.targetMinute ?? 0;
    const result = verifyClockAnswer(clockMinutes, targetH, targetM);
    if (result.isCorrect) {
      markCorrect(currentQ.feedbackCorrect || result.feedbackMessage);
    } else {
      markWrong(result.feedbackMessage);
    }
  };

  const handleSelectChoice = (choice: string) => {
    if (status === 'correct') return;
    setSelectedChoice(choice);
    if (choice === currentQ.correctChoice) {
      markCorrect();
    } else {
      markWrong();
    }
  };

  const matchedActivityObj = currentQ?.activityKey
    ? config.activities.find((a) => a.illustrationKey === currentQ.activityKey)
    : undefined;

  if (finished) {
    const ratio = correctCount / Math.max(1, activeQuestions.length);
    const stars = ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1;
    const hasNextLevel = level.id < config.levels.length;

    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-md">
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`animate-star-pop h-12 w-12 ${
                s <= stars ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
              }`}
              style={{ animationDelay: `${s * 120}ms` }}
            />
          ))}
        </div>

        <h1 className="mt-4 font-display text-3xl font-extrabold text-slate-900">
          Luar Biasa! Area {level.id} Selesai!
        </h1>
        <p className="mt-1 text-base font-semibold text-sky-700">
          {level.areaName} · {level.gameTitle}
        </p>

        <div className="my-6 flex items-center justify-center gap-6">
          <TikiCharacter pose="excited" size={110} customImageUrl={config.images.tikiImageUrl} />
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <BadgeEmblem icon={level.badgeIcon} earned />
            <span className="text-xs font-bold text-amber-900">Lencana Diperoleh</span>
            <span className="font-display text-sm font-extrabold text-slate-900">
              {level.badgeName}
            </span>
          </div>
          <BimoCharacter pose="celebrating" size={110} customImageUrl={config.images.bimoImageUrl} />
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div>
            <p className="text-xs font-semibold text-slate-500">Skor Total</p>
            <p className="font-mono-num text-2xl font-extrabold text-slate-900">{score}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Jawaban Benar</p>
            <p className="font-mono-num text-2xl font-extrabold text-emerald-700">{correctCount}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Koin Hadiah</p>
            <p className="font-mono-num inline-flex items-center gap-1 text-2xl font-extrabold text-amber-600">
              <Coins className="h-5 w-5" /> +{level.rewardCoins}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRestartLevel}
            className={`inline-flex min-h-[46px] items-center gap-2 border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 ${btnShape}`}
          >
            <RotateCcw className="h-4 w-4" /> Main Lagi
          </button>
          <button
            type="button"
            onClick={onExitToMap}
            className={`inline-flex min-h-[46px] items-center gap-2 bg-sky-100 px-5 py-2.5 text-sm font-bold text-sky-900 hover:bg-sky-200 ${btnShape}`}
          >
            Kembali ke Peta
          </button>
          {hasNextLevel && (
            <button
              type="button"
              onClick={() => {
                audioEngine.playLevelUp(config.audio);
                onNextLevel(level.id + 1);
              }}
              className={`inline-flex min-h-[46px] items-center gap-2 bg-emerald-600 px-6 py-2.5 text-sm font-extrabold text-white hover:bg-emerald-700 ${btnShape}`}
            >
              Lanjut Area {level.id + 1} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  const levelHeaderImage =
    level.customImageUrl || (level.id === 6 && !castleBgFailed ? config.images.castleBg : '');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-white px-5 py-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              audioEngine.stopNarration();
              onExitToMap();
            }}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Peta
          </button>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Area {level.id} · {level.areaName} · Tingkat {level.difficulty}
            </p>
            <h1 className="font-display text-lg font-extrabold text-slate-900">
              {level.gameTitle}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
          {level.timeLimitMinutes > 0 && (
            <span className="font-mono-num inline-flex items-center gap-1 text-rose-700">
              <Timer className="h-4 w-4" />
              {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
            </span>
          )}
          <span className="font-mono-num text-slate-700">
            Soal {qIndex + 1}/{activeQuestions.length}
          </span>
          <span className="font-mono-num text-emerald-700">Benar: {correctCount}</span>
          <span className="font-mono-num text-amber-600">Skor: {score}</span>
        </div>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-sky-100">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${((qIndex + (status === 'correct' ? 1 : 0)) / activeQuestions.length) * 100}%`,
            backgroundColor: level.accentColor,
          }}
        />
      </div>

      {levelHeaderImage && (
        <div className="relative h-32 overflow-hidden rounded-2xl border border-amber-200">
          <img
            src={levelHeaderImage}
            alt={level.areaName}
            referrerPolicy="no-referrer"
            onError={() => setCastleBgFailed(true)}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center bg-gradient-to-r from-slate-950/75 to-transparent px-6">
            <div className="text-white">
              <p className="text-xs font-bold text-amber-300">{level.areaName}</p>
              <p className="font-display text-xl font-extrabold">{level.instruction}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-sky-200 bg-white p-6 shadow-sm lg:col-span-6">
          {currentQ.type === 'click_part' && (
            <InteractiveClock
              totalMinutes={150}
              interactiveDrag={false}
              clickableNumbers
              clickableHands
              onNumberClick={(num) => handlePartClick(String(num))}
              onHandClick={(hand) => handlePartClick(hand)}
              highlightedNumber={
                status === 'correct' && !isNaN(Number(currentQ.targetPart))
                  ? Number(currentQ.targetPart)
                  : null
              }
              highlightedHand={
                status === 'correct' &&
                (currentQ.targetPart === 'hour_hand' || currentQ.targetPart === 'minute_hand')
                  ? currentQ.targetPart
                  : null
              }
              showDigital={false}
              showControls={false}
              sizePx={clockSize}
              clockFaceColor={config.design.clockFaceColor}
              clockBezelColor={config.design.clockBezelColor}
              clockNumberColor={config.design.clockNumberColor}
              hourHandColor={config.design.hourHandColor}
              minuteHandColor={config.design.minuteHandColor}
              numberStyle={config.design.clockNumberStyle}
              clockAppearance={config.design.clockAppearance}
              showMinuteTicks={config.design.showMinuteTicks}
            />
          )}

          {currentQ.type === 'set_clock' && (
            <InteractiveClock
              totalMinutes={clockMinutes}
              onChangeMinutes={(m) => {
                setClockMinutes(m);
                if (status === 'wrong') setStatus('answering');
              }}
              interactiveDrag={status !== 'correct'}
              showDigital={false}
              hiddenDigitalLabel="Atur jarum jamnya lalu tekan Periksa Jawaban"
              showControls={status !== 'correct'}
              showZoomControls
              snapStep={level.id === 6 ? 15 : 5}
              helperHighlightHalfHour={level.id === 4 || (currentQ.targetMinute ?? 0) === 30}
              feedbackStatus={status === 'correct' ? 'correct' : status === 'wrong' ? 'wrong' : 'idle'}
              sizePx={clockSize}
              clockFaceColor={config.design.clockFaceColor}
              clockBezelColor={config.design.clockBezelColor}
              clockNumberColor={config.design.clockNumberColor}
              hourHandColor={config.design.hourHandColor}
              minuteHandColor={config.design.minuteHandColor}
              numberStyle={config.design.clockNumberStyle}
              clockAppearance={config.design.clockAppearance}
              showMinuteTicks={config.design.showMinuteTicks}
              audioSettings={config.audio}
            />
          )}

          {currentQ.type === 'multiple_choice' && (
            <InteractiveClock
              totalMinutes={
                ((currentQ.displayHour ?? 12) % 12) * 60 + (currentQ.displayMinute ?? 0)
              }
              interactiveDrag={false}
              showDigital={false}
              showControls={false}
              sizePx={clockSize}
              clockFaceColor={config.design.clockFaceColor}
              clockBezelColor={config.design.clockBezelColor}
              clockNumberColor={config.design.clockNumberColor}
              hourHandColor={config.design.hourHandColor}
              minuteHandColor={config.design.minuteHandColor}
              numberStyle={config.design.clockNumberStyle}
              clockAppearance={config.design.clockAppearance}
              showMinuteTicks={config.design.showMinuteTicks}
            />
          )}

          {currentQ.type === 'match_activity' && currentQ.activityKey && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragHoverDrop(true);
              }}
              onDragLeave={() => setDragHoverDrop(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragHoverDrop(false);
                const droppedTime = e.dataTransfer.getData('text/plain');
                if (droppedTime) {
                  handleSelectChoice(droppedTime);
                }
              }}
              className={`w-full max-w-sm rounded-3xl border-2 p-5 text-center transition ${
                dragHoverDrop
                  ? 'border-dashed border-sky-500 bg-sky-50 scale-[1.01]'
                  : status === 'correct'
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : 'border-dashed border-sky-200 bg-sky-50/30'
              }`}
            >
              <ActivityIllustration
                activityKey={currentQ.activityKey}
                customImageUrl={matchedActivityObj?.customImageUrl}
                alt={currentQ.activityName || 'Kegiatan sehari-hari'}
                className="h-44 w-full"
              />
              <h3 className="mt-3 font-display text-xl font-extrabold text-slate-900">
                {currentQ.activityName}
              </h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Seret kartu waktu ke gambar ini atau langsung klik pilihan waktu!
              </p>
              {status === 'correct' && selectedChoice && (
                <div className="font-mono-num mt-3 inline-block rounded-xl bg-emerald-600 px-4 py-1.5 text-lg font-extrabold text-white">
                  {selectedChoice}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-5 lg:col-span-6">
          <div className="rounded-3xl border border-sky-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-sky-700">{level.instruction}</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-slate-900">
                  {currentQ.prompt}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => audioEngine.speak(currentQ.prompt, config.audio, 'bimo')}
                className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl bg-sky-100 px-3 py-2 text-xs font-bold text-sky-900 hover:bg-sky-200"
              >
                <Volume2 className="h-4 w-4" /> Bacakan
              </button>
            </div>

            {currentQ.type === 'click_part' && (
              <div className="rounded-2xl bg-sky-50 p-4 text-sm font-medium text-sky-950">
                Sentuh atau klik langsung angka atau jarum pada gambar jam di sebelah kiri.
              </div>
            )}

            {currentQ.type === 'set_clock' && status !== 'correct' && (
              <button
                type="button"
                onClick={handleCheckClock}
                className={`flex min-h-[48px] w-full items-center justify-center gap-2 bg-emerald-600 px-5 py-3 text-base font-extrabold text-white shadow-sm transition hover:bg-emerald-700 ${btnShape}`}
              >
                <CheckCircle2 className="h-5 w-5" /> PERIKSA JAWABAN
              </button>
            )}

            {(currentQ.type === 'multiple_choice' || currentQ.type === 'match_activity') &&
              currentQ.choices && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {currentQ.choices.map((ch, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isPicked = selectedChoice === ch;
                    const isCorrectBtn = status === 'correct' && ch === currentQ.correctChoice;
                    const isWrongBtn = status === 'wrong' && isPicked && ch !== currentQ.correctChoice;

                    return (
                      <button
                        key={ch}
                        type="button"
                        draggable={currentQ.type === 'match_activity' && status !== 'correct'}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', ch);
                        }}
                        onClick={() => handleSelectChoice(ch)}
                        className={`flex min-h-[56px] items-center justify-center gap-2 border-2 px-4 py-3 text-lg font-extrabold transition ${btnShape} ${
                          isCorrectBtn
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : isWrongBtn
                              ? 'border-rose-500 bg-rose-50 text-rose-800'
                              : 'border-sky-200 bg-sky-50/70 text-slate-900 hover:border-sky-500 hover:bg-sky-100'
                        }`}
                      >
                        <span className="text-xs opacity-75">{letter}.</span>
                        <span className="font-mono-num">{ch}</span>
                      </button>
                    );
                  })}
                </div>
              )}

            {currentQ.hint && status !== 'correct' && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline"
                >
                  <HelpCircle className="h-4 w-4" />
                  {showHint ? 'Sembunyikan Petunjuk' : 'Butuh Petunjuk?'}
                </button>
                {showHint && (
                  <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
                    {currentQ.hint}
                  </p>
                )}
              </div>
            )}

            {status === 'correct' && (
              <button
                type="button"
                onClick={handleAdvance}
                style={{ backgroundColor: config.design.buttonColor }}
                className={`flex min-h-[48px] w-full items-center justify-center gap-2 px-5 py-3 text-base font-extrabold text-white shadow-sm transition hover:brightness-110 ${btnShape}`}
              >
                {qIndex + 1 >= activeQuestions.length ? (
                  <>
                    <Award className="h-5 w-5" /> Lihat Hasil &amp; Penghargaan
                  </>
                ) : (
                  <>
                    Soal Berikutnya <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            )}
          </div>

          <CharacterDialogBox
            character={status === 'wrong' ? 'bimo' : 'tiki'}
            characterName={status === 'wrong' ? config.bimoName : config.tikiName}
            pose={
              status === 'correct'
                ? 'excited'
                : status === 'wrong'
                  ? 'confused'
                  : 'pointing'
            }
            text={
              status === 'answering'
                ? config.dialogs.gameStartEncouragement
                : feedbackMsg
            }
            customImageUrl={
              status === 'wrong' ? config.images.bimoImageUrl : config.images.tikiImageUrl
            }
            tone={status === 'correct' ? 'success' : status === 'wrong' ? 'hint' : 'neutral'}
          />
        </div>
      </div>
    </div>
  );
};
