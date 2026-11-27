import React from 'react';
import { Volume2, VolumeX, Music, Sparkles, MessageCircle, X } from 'lucide-react';
import { AudioSettings, VoiceCharacter } from '../../types/media';
import { audioEngine } from '../../utils/audioEngine';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audio: AudioSettings;
  onChangeAudio: (next: AudioSettings) => void;
  tikiName: string;
  bimoName: string;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  audio,
  onChangeAudio,
  tikiName,
  bimoName,
}) => {
  if (!isOpen) return null;

  const update = (patch: Partial<AudioSettings>) => {
    const next = { ...audio, ...patch };
    onChangeAudio(next);
    if (next.bgMusicEnabled && !next.muted) {
      audioEngine.startBackgroundMusic(next);
    } else {
      audioEngine.stopBackgroundMusic();
    }
  };

  const voices: { id: VoiceCharacter; label: string; sample: string }[] = [
    {
      id: 'tiki',
      label: `Suara ${tikiName}`,
      sample: `Halo! Aku ${tikiName}. Ayo kita belajar membaca jam bersama!`,
    },
    {
      id: 'bimo',
      label: `Suara ${bimoName}`,
      sample: `Hai teman-teman! Aku ${bimoName}. Siap berpetualang di Dunia Waktu?`,
    },
    {
      id: 'narrator',
      label: 'Suara Narator',
      sample: 'Selamat datang di Dunia Waktu. Perhatikan jarum pendek dan jarum panjang.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-modal-title"
    >
      <div className="w-full max-w-lg rounded-3xl border border-sky-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            {audio.muted ? (
              <VolumeX className="h-6 w-6 text-rose-600" />
            ) : (
              <Volume2 className="h-6 w-6 text-sky-600" />
            )}
            <h2 id="audio-modal-title" className="font-display text-xl font-bold text-slate-900">
              Pengaturan Suara
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Tutup pengaturan suara"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-2xl bg-sky-50 p-4">
            <div>
              <p className="font-semibold text-slate-900">Status Semua Suara</p>
              <p className="text-xs text-slate-600">
                {audio.muted ? 'Semua suara sedang dimatikan (Mute)' : 'Suara aktif dan siap diputar'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => update({ muted: !audio.muted })}
              className={`min-h-[42px] rounded-xl px-4 py-2 text-sm font-bold text-white transition whitespace-nowrap ${
                audio.muted ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {audio.muted ? 'Aktifkan Suara' : 'Matikan (Mute)'}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="music-vol" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Music className="h-4 w-4 text-teal-600" />
                Musik Latar ({Math.round(audio.musicVolume * 100)}%)
              </label>
              <button
                type="button"
                onClick={() => update({ bgMusicEnabled: !audio.bgMusicEnabled })}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  audio.bgMusicEnabled
                    ? 'bg-teal-100 text-teal-900'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {audio.bgMusicEnabled ? 'Musik Nyala' : 'Musik Mati'}
              </button>
            </div>
            <input
              id="music-vol"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audio.musicVolume}
              onChange={(e) => update({ musicVolume: Number(e.target.value) })}
              className="h-2 w-full cursor-pointer accent-teal-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="sfx-vol" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Sparkles className="h-4 w-4 text-amber-600" />
                Efek Suara Tombol &amp; Bintang ({Math.round(audio.sfxVolume * 100)}%)
              </label>
              <button
                type="button"
                onClick={() => audioEngine.playStar(audio)}
                className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 hover:bg-amber-200"
              >
                Tes Efek
              </button>
            </div>
            <input
              id="sfx-vol"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audio.sfxVolume}
              onChange={(e) => update({ sfxVolume: Number(e.target.value) })}
              className="h-2 w-full cursor-pointer accent-amber-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="nar-vol" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MessageCircle className="h-4 w-4 text-sky-600" />
                Narasi Suara ({Math.round(audio.narrationVolume * 100)}%)
              </label>
              <button
                type="button"
                onClick={() => update({ narrationEnabled: !audio.narrationEnabled })}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  audio.narrationEnabled !== false
                    ? 'bg-sky-100 text-sky-900'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {audio.narrationEnabled !== false ? 'Narasi Aktif' : 'Narasi Mati'}
              </button>
            </div>
            <input
              id="nar-vol"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audio.narrationVolume}
              onChange={(e) => update({ narrationVolume: Number(e.target.value) })}
              className="h-2 w-full cursor-pointer accent-sky-600"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-800">Pilihan Suara Narasi</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {voices.map((v) => {
                const active = audio.voiceCharacter === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      const next = { ...audio, voiceCharacter: v.id };
                      update({ voiceCharacter: v.id });
                      audioEngine.speak(v.sample, next, v.id);
                    }}
                    className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${
                      active
                        ? 'border-sky-600 bg-sky-50 text-sky-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-700"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
