import React, { useState } from 'react';
import { Volume2, ArrowRight, Check } from 'lucide-react';
import { MediaConfig, MaterialItem } from '../types/media';
import { InteractiveClock } from '../components/clock/InteractiveClock';
import { CharacterDialogBox } from '../components/characters/TikiBimo';
import { ActivityIllustration } from '../components/illustrations/ActivityIllustration';
import { audioEngine } from '../utils/audioEngine';
import { getClockSizePixels } from '../utils/designHelpers';

interface LearnPageProps {
  config: MediaConfig;
  onGoSimulation: () => void;
  onGoAdventure: () => void;
}

function parseTimeStringToMinutes(timeStr: string): number {
  const parts = timeStr.replace(':', '.').split('.');
  const h = parseInt(parts[0] || '12', 10) % 12;
  const m = parseInt(parts[1] || '0', 10) % 60;
  return h * 60 + m;
}

export const LearnPage: React.FC<LearnPageProps> = ({
  config,
  onGoSimulation,
  onGoAdventure,
}) => {
  const sortedMaterials = [...config.materials].sort((a, b) => a.order - b.order);
  const [activeId, setActiveId] = useState<string>(sortedMaterials[0]?.id ?? 'mat-1');
  const [clockMinutes, setClockMinutes] = useState<number>(180);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedHand, setSelectedHand] = useState<'hour_hand' | 'minute_hand' | null>(null);
  const [clickedActivityId, setClickedActivityId] = useState<string | null>(
    config.activities[0]?.id ?? null
  );

  const activeMat: MaterialItem =
    sortedMaterials.find((m) => m.id === activeId) ?? sortedMaterials[0];

  const handleSelectMaterial = (mat: MaterialItem) => {
    audioEngine.playClick(config.audio);
    setActiveId(mat.id);
    setSelectedNumber(null);
    setSelectedHand(null);

    if (mat.exampleTimes.length > 0) {
      setClockMinutes(parseTimeStringToMinutes(mat.exampleTimes[0]));
    }
    audioEngine.speak(mat.narrationText, config.audio, 'tiki', `material_${mat.id}`);
  };

  const handleNumberClick = (num: number) => {
    audioEngine.playStar(config.audio);
    setSelectedNumber(num);
    setClockMinutes((num % 12) * 60);
    audioEngine.speak(
      `Ini angka ${num}! Pada jam, angka ${num} membantu kita membaca waktu.`,
      config.audio,
      'tiki'
    );
  };

  const handleHandClick = (hand: 'hour_hand' | 'minute_hand') => {
    audioEngine.playStar(config.audio);
    setSelectedHand(hand);
    if (hand === 'hour_hand') {
      audioEngine.speak(
        'Ini jarum pendek! Jarum pendek bertugas menunjukkan JAM!',
        config.audio,
        'tiki'
      );
    } else {
      audioEngine.speak(
        'Ini jarum panjang! Jarum panjang bertugas menunjukkan MENIT!',
        config.audio,
        'bimo'
      );
    }
  };

  const selectedActivity =
    config.activities.find((a) => a.id === clickedActivityId) ?? config.activities[0];

  const dialogText = (() => {
    if (activeMat.type === 'numbers' && selectedNumber !== null) {
      return `Kamu mengklik angka ${selectedNumber}! Angka pada jam tersusun berurutan dari 1 sampai 12.`;
    }
    if (activeMat.type === 'hands' && selectedHand === 'hour_hand') {
      return 'Jarum Pendek: Bentuknya lebih pendek dan tebal. Tugasnya menunjuk angka JAM.';
    }
    if (activeMat.type === 'hands' && selectedHand === 'minute_hand') {
      return 'Jarum Panjang: Bentuknya lebih panjang. Tugasnya menunjuk MENIT (angka 12 = tepat, angka 6 = setengah jam).';
    }
    return activeMat.explanation;
  })();

  const clockSize = getClockSizePixels(config.design.clockSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-sky-700">Menu Belajar Dulu · Materi Bertahap</p>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Belajar Membaca Jam Bersama {config.tikiName} &amp; {config.bimoName}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onGoSimulation}
            className="min-h-[42px] rounded-xl border border-sky-200 bg-white px-4 py-2 text-xs font-bold text-sky-800 hover:bg-sky-50 whitespace-nowrap"
          >
            Buka Simulasi Jam
          </button>
          <button
            type="button"
            onClick={onGoAdventure}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 whitespace-nowrap"
          >
            Lanjut Bermain <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-sky-100 bg-white p-2 shadow-xs">
        {sortedMaterials.map((mat, i) => {
          const active = mat.id === activeMat.id;
          return (
            <button
              key={mat.id}
              type="button"
              onClick={() => handleSelectMaterial(mat)}
              className={`min-h-[42px] rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap sm:text-sm ${
                active ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:bg-sky-50'
              }`}
            >
              {i + 1}. {mat.title}
            </button>
          );
        })}
      </div>

      {activeMat.type !== 'daily_activities' ? (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="flex flex-col items-center rounded-3xl border border-sky-200 bg-white p-6 shadow-sm lg:col-span-6">
            <InteractiveClock
              totalMinutes={clockMinutes}
              onChangeMinutes={
                activeMat.type === 'exact_hour' ||
                activeMat.type === 'half_hour' ||
                activeMat.type === 'custom'
                  ? setClockMinutes
                  : undefined
              }
              interactiveDrag={
                activeMat.type === 'exact_hour' ||
                activeMat.type === 'half_hour' ||
                activeMat.type === 'custom'
              }
              clickableNumbers={activeMat.type === 'numbers'}
              clickableHands={activeMat.type === 'hands'}
              onNumberClick={handleNumberClick}
              onHandClick={handleHandClick}
              highlightedNumber={selectedNumber}
              highlightedHand={selectedHand}
              showDigital={activeMat.type !== 'numbers'}
              showControls={false}
              helperHighlightHalfHour={activeMat.type === 'half_hour'}
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
          </div>

          <div className="space-y-5 lg:col-span-6">
            <div className="rounded-3xl border border-sky-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-teal-700">Materi {activeMat.order}</span>
                  <h2 className="font-display text-2xl font-extrabold text-slate-900">
                    {activeMat.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    audioEngine.speak(
                      `${activeMat.summary}. ${activeMat.explanation}`,
                      config.audio,
                      'tiki',
                      `material_${activeMat.id}`
                    )
                  }
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-sky-100 px-3.5 py-2 text-xs font-bold text-sky-900 hover:bg-sky-200 whitespace-nowrap"
                >
                  <Volume2 className="h-4 w-4" /> Putar Penjelasan
                </button>
              </div>

              <p className="rounded-2xl bg-sky-50 p-4 text-base font-bold text-sky-950">
                {activeMat.summary}
              </p>

              <p className="text-sm leading-relaxed text-slate-700 md:text-base">
                {activeMat.instruction}
              </p>

              {activeMat.type === 'hands' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleHandClick('hour_hand')}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selectedHand === 'hour_hand'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-display font-bold text-blue-800">Jarum Pendek</p>
                    <p className="mt-1 text-xs text-slate-600">Lebih tebal · Menunjukkan Jam</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHandClick('minute_hand')}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selectedHand === 'minute_hand'
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-display font-bold text-orange-700">Jarum Panjang</p>
                    <p className="mt-1 text-xs text-slate-600">Lebih panjang · Menunjukkan Menit</p>
                  </button>
                </div>
              )}

              {(activeMat.type === 'exact_hour' ||
                activeMat.type === 'half_hour' ||
                activeMat.type === 'custom') &&
                activeMat.exampleTimes.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-bold text-slate-600">
                      Klik contoh waktu di bawah untuk melihat posisi jarum:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeMat.exampleTimes.map((t) => {
                        const mins = parseTimeStringToMinutes(t);
                        const isSelected = mins === clockMinutes;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              audioEngine.playClick(config.audio);
                              setClockMinutes(mins);
                              audioEngine.speak(`Ini adalah pukul ${t}`, config.audio, 'tiki');
                            }}
                            className={`font-mono-num min-h-[42px] rounded-xl border px-4 py-2 text-sm font-bold transition ${
                              isSelected
                                ? 'border-sky-600 bg-sky-600 text-white'
                                : 'border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>

            <CharacterDialogBox
              character="tiki"
              characterName={config.tikiName}
              pose="pointing"
              text={dialogText}
              customImageUrl={config.images.tikiImageUrl}
              onSpeak={() => audioEngine.speak(dialogText, config.audio, 'tiki')}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <CharacterDialogBox
            character="bimo"
            characterName={config.bimoName}
            pose="happy"
            text={activeMat.explanation}
            customImageUrl={config.images.bimoImageUrl}
            onSpeak={() => audioEngine.speak(activeMat.narrationText, config.audio, 'bimo')}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:col-span-8">
              {config.activities.map((act) => {
                const isActive = act.id === selectedActivity?.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => {
                      audioEngine.playClick(config.audio);
                      setClickedActivityId(act.id);
                      audioEngine.speak(
                        `${act.name}, contoh waktunya pukul ${act.time} ${act.period}. ${act.description}`,
                        config.audio,
                        'bimo'
                      );
                    }}
                    className={`flex flex-col rounded-2xl border p-3 text-left transition ${
                      isActive
                        ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-200'
                        : 'border-slate-200 bg-white hover:border-sky-300'
                    }`}
                  >
                    <ActivityIllustration
                      activityKey={act.illustrationKey}
                      customImageUrl={act.customImageUrl}
                      alt={act.name}
                      className="h-24 w-full"
                    />
                    <div className="mt-2.5 flex items-center justify-between gap-1">
                      <span className="font-mono-num text-sm font-extrabold text-sky-700">
                        {act.time}
                      </span>
                      {isActive && <Check className="h-4 w-4 text-sky-600" />}
                    </div>
                    <p className="mt-0.5 font-display text-sm font-bold text-slate-900">
                      {act.name}
                    </p>
                    <p className="text-xs text-slate-500">{act.period}</p>
                  </button>
                );
              })}
            </div>

            {selectedActivity && (
              <div className="flex flex-col items-center rounded-3xl border border-sky-200 bg-white p-5 shadow-sm lg:col-span-4">
                <p className="text-xs font-bold text-teal-700">Contoh Jadwal Kegiatan</p>
                <h3 className="mt-1 font-display text-xl font-extrabold text-slate-900">
                  {selectedActivity.name}
                </h3>
                <p className="mt-1 text-center text-xs text-slate-600">
                  {selectedActivity.description}
                </p>
                <div className="mt-4">
                  <InteractiveClock
                    totalMinutes={parseTimeStringToMinutes(selectedActivity.time)}
                    interactiveDrag={false}
                    showDigital
                    showControls={false}
                    sizePx={230}
                    clockFaceColor={config.design.clockFaceColor}
                    clockBezelColor={config.design.clockBezelColor}
                    clockNumberColor={config.design.clockNumberColor}
                    hourHandColor={config.design.hourHandColor}
                    minuteHandColor={config.design.minuteHandColor}
                    numberStyle={config.design.clockNumberStyle}
                    clockAppearance={config.design.clockAppearance}
                    showMinuteTicks={config.design.showMinuteTicks}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
