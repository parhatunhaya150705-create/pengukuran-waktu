import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  Download,
  Upload,
  Eye,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  X,
  Type,
  BookOpen,
  HelpCircle,
  Image as ImageIcon,
  Music,
  Clock,
  Layers,
  Palette,
  BarChart3,
} from 'lucide-react';
import {
  DEFAULT_CASTLE_BG,
  DEFAULT_HERO_BG,
  DEFAULT_MAP_BG,
  DEFAULT_MEDIA_CONFIG,
} from '../data/defaultMedia';
import {
  ActivityKey,
  AppFontFamily,
  ClockAppearance,
  ClockNumberStyle,
  DifficultyLevel,
  GameQuestion,
  MaterialItem,
  MediaConfig,
  QuestionType,
  StudentProgress,
  VoiceCharacter,
} from '../types/media';
import { InteractiveClock } from '../components/clock/InteractiveClock';
import { ActivityIllustration } from '../components/illustrations/ActivityIllustration';
import { TikiCharacter, BimoCharacter } from '../components/characters/TikiBimo';
import { audioEngine } from '../utils/audioEngine';
import {
  compressImageFile,
  getButtonStyleClass,
  getFontFamilyValue,
} from '../utils/designHelpers';

export type TeacherTab =
  | 'guide'
  | 'texts'
  | 'materials'
  | 'questions'
  | 'images'
  | 'audio'
  | 'clock'
  | 'levels'
  | 'theme';

interface TeacherModePageProps {
  config: MediaConfig;
  progress: StudentProgress;
  initialTab?: string;
  isGateVerified: boolean;
  onVerifyGate: () => void;
  onSaveConfig: (next: MediaConfig) => void;
  onResetConfig: () => void;
  onResetProgress: () => void;
  onPreviewMedia: () => void;
}

const THEME_PRESETS: Record<
  MediaConfig['design']['theme'],
  { label: string; bg: string; btn: string; face: string; bezel: string; hour: string; min: string }
> = {
  sky: {
    label: 'Biru Langit Cerah',
    bg: '#F2F8FD',
    btn: '#0284C7',
    face: '#FFFFFF',
    bezel: '#0284C7',
    hour: '#1D4ED8',
    min: '#EA580C',
  },
  forest: {
    label: 'Hutan Toska Pastel',
    bg: '#F0FDF9',
    btn: '#0D9488',
    face: '#FFFFFF',
    bezel: '#0D9488',
    hour: '#0F766E',
    min: '#F59E0B',
  },
  sunset: {
    label: 'Oranye Ceria',
    bg: '#FFFBF2',
    btn: '#EA580C',
    face: '#FFFFFF',
    bezel: '#F59E0B',
    hour: '#B45309',
    min: '#0284C7',
  },
  lavender: {
    label: 'Ungu Pastel',
    bg: '#F8F5FF',
    btn: '#7C3AED',
    face: '#FFFFFF',
    bezel: '#7C3AED',
    hour: '#5B21B6',
    min: '#EC4899',
  },
};

function normalizeInitialTab(tab?: string): TeacherTab {
  if (tab === 'identity') return 'texts';
  if (tab === 'games') return 'questions';
  if (tab === 'media') return 'images';
  if (tab === 'design') return 'theme';
  const valid: TeacherTab[] = [
    'guide',
    'texts',
    'materials',
    'questions',
    'images',
    'audio',
    'clock',
    'levels',
    'theme',
  ];
  return valid.includes(tab as TeacherTab) ? (tab as TeacherTab) : 'texts';
}

export const TeacherModePage: React.FC<TeacherModePageProps> = ({
  config,
  progress,
  initialTab,
  isGateVerified,
  onVerifyGate,
  onSaveConfig,
  onResetConfig,
  onResetProgress,
  onPreviewMedia,
}) => {
  const [activeTab, setActiveTab] = useState<TeacherTab>(() => normalizeInitialTab(initialTab));
  const [draft, setDraft] = useState<MediaConfig>(() => JSON.parse(JSON.stringify(config)));
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [previewMinutes, setPreviewMinutes] = useState<number>(210); // 03.30
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'reset_config' | 'reset_progress' | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(config);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  };

  if (!isGateVerified) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-sky-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">
          Verifikasi Mode Guru
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Area ini khusus untuk guru mengedit teks, materi, soal, gambar, audio, jam, level, dan tema media.
          Jawab soal singkat di bawah untuk masuk:
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (gateInput.trim() === '24') {
              onVerifyGate();
              setGateError('');
            } else {
              setGateError('Jawaban belum tepat. Petunjuk: 6 × 4 = 24');
            }
          }}
          className="mt-5 space-y-4"
        >
          <div>
            <label htmlFor="teacher-gate" className="block text-sm font-bold text-slate-800">
              Berapa hasil dari 6 × 4 ?
            </label>
            <input
              id="teacher-gate"
              type="text"
              inputMode="numeric"
              value={gateInput}
              onChange={(e) => setGateInput(e.target.value)}
              placeholder="Ketik angka jawaban..."
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base font-bold text-slate-900 focus:border-sky-500 focus:outline-none"
            />
            {gateError && <p className="mt-1.5 text-xs font-semibold text-rose-600">{gateError}</p>}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="submit"
              className="min-h-[44px] rounded-xl bg-sky-600 px-6 py-2 text-sm font-extrabold text-white hover:bg-sky-700"
            >
              Masuk Editor Guru
            </button>
            <button
              type="button"
              onClick={onVerifyGate}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline"
            >
              Lewati Verifikasi (Guru)
            </button>
          </div>
        </form>
      </div>
    );
  }

  const handleSave = () => {
    onSaveConfig(draft);
    showToast('Perubahan berhasil disimpan ke browser dan langsung aktif di media!');
  };

  const handleCancelChanges = () => {
    setDraft(JSON.parse(JSON.stringify(config)));
    showToast('Perubahan yang belum disimpan telah dibatalkan.');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `konfigurasi-dunia-waktu-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Konfigurasi media (.json) berhasil diekspor.');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && parsed.title && Array.isArray(parsed.levels)) {
          const merged: MediaConfig = {
            ...DEFAULT_MEDIA_CONFIG,
            ...parsed,
            dialogs: { ...DEFAULT_MEDIA_CONFIG.dialogs, ...(parsed.dialogs || {}) },
            design: { ...DEFAULT_MEDIA_CONFIG.design, ...(parsed.design || {}) },
            audio: { ...DEFAULT_MEDIA_CONFIG.audio, ...(parsed.audio || {}) },
            learning: { ...DEFAULT_MEDIA_CONFIG.learning, ...(parsed.learning || {}) },
            images: { ...DEFAULT_MEDIA_CONFIG.images, ...(parsed.images || {}) },
          };
          setDraft(merged);
          onSaveConfig(merged);
          showToast('Konfigurasi JSON berhasil diimpor dan langsung diterapkan!');
        } else {
          showToast('File JSON tidak valid untuk media ini.');
        }
      } catch {
        showToast('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCompressedImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onResult: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 880);
      onResult(compressed);
      showToast('Gambar berhasil diunggah. Klik Simpan untuk menyimpan permanen.');
    } catch {
      showToast('Gagal memuat file gambar.');
    }
    e.target.value = '';
  };

  const handleAudioFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    slotKey: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_800_000) {
      showToast('Ukuran file audio disarankan di bawah 1.8 MB agar tersimpan lancar di browser.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((prev) => ({
        ...prev,
        audio: {
          ...prev.audio,
          customAudioMap: { ...prev.audio.customAudioMap, [slotKey]: String(reader.result) },
        },
      }));
      showToast('File audio berhasil diunggah ke slot narasi.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const selectedLevel =
    draft.levels.find((l) => l.id === selectedLevelId) ?? draft.levels[0];

  const updateSelectedLevel = (updater: (lvl: typeof selectedLevel) => typeof selectedLevel) => {
    setDraft((prev) => ({
      ...prev,
      levels: prev.levels.map((l) => (l.id === selectedLevel.id ? updater(l) : l)),
    }));
  };

  const moveItem = <T,>(arr: T[], idx: number, dir: -1 | 1): T[] => {
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return arr;
    const copy = [...arr];
    const [item] = copy.splice(idx, 1);
    copy.splice(target, 0, item);
    return copy;
  };

  const navItems: { id: TeacherTab; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'texts', label: '1. Edit Teks & Dialog', desc: 'Judul, instruksi, dialog', icon: <Type className="h-4 w-4" /> },
    { id: 'materials', label: '2. Edit Materi', desc: 'Tambah & urutkan materi', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'questions', label: '3. Edit Soal', desc: 'Bank soal & kunci jam', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'images', label: '4. Edit Gambar', desc: 'Karakter, latar & level', icon: <ImageIcon className="h-4 w-4" /> },
    { id: 'audio', label: '5. Edit Audio', desc: 'Narasi, suara & volume', icon: <Music className="h-4 w-4" /> },
    { id: 'clock', label: '6. Edit Jam', desc: 'Warna, ukuran & angka', icon: <Clock className="h-4 w-4" /> },
    { id: 'levels', label: '7. Edit Level', desc: 'Nama, durasi & reward', icon: <Layers className="h-4 w-4" /> },
    { id: 'theme', label: '8. Edit Tema', desc: 'Warna, font & tombol', icon: <Palette className="h-4 w-4" /> },
    { id: 'guide', label: 'Rekap Skor & Kelas', desc: 'Nilai murid & akses level', icon: <BarChart3 className="h-4 w-4" /> },
  ];

  const previewBtnClass = getButtonStyleClass(draft.design.buttonShape);
  const previewFont = getFontFamilyValue(draft.design.fontFamily);

  return (
    <div className="space-y-5">
      {/* Top Sticky Dashboard Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-sky-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="font-bold text-teal-700">Editor Visual Media Guru</span>
            <span aria-hidden="true">·</span>
            <span>{isDirty ? 'Ada perubahan belum disimpan' : 'Semua perubahan tersimpan'}</span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">
            Dashboard Edit Media Pembelajaran
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-emerald-700 whitespace-nowrap"
          >
            <Save className="h-4 w-4" /> Simpan
          </button>
          <button
            type="button"
            onClick={() => {
              onSaveConfig(draft);
              onPreviewMedia();
            }}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-sky-700 whitespace-nowrap"
          >
            <Eye className="h-4 w-4" /> Preview Penuh
          </button>
          {isDirty && (
            <button
              type="button"
              onClick={handleCancelChanges}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              Batalkan
            </button>
          )}
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <Download className="h-4 w-4" /> Export JSON
          </button>
          <label className="inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap">
            <Upload className="h-4 w-4" /> Import JSON
            <input type="file" accept=".json,application/json" onChange={handleImportJson} className="hidden" />
          </label>
          <button
            type="button"
            onClick={() => setConfirmAction('reset_config')}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 whitespace-nowrap"
          >
            <RotateCcw className="h-4 w-4" /> Reset Awal
          </button>
          <button
            type="button"
            onClick={() => setShowMobilePreview((v) => !v)}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-900 xl:hidden whitespace-nowrap"
          >
            <Eye className="h-4 w-4" /> {showMobilePreview ? 'Tutup Preview' : 'Lihat Preview'}
          </button>
        </div>
      </div>

      {toast && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-950">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            {toast}
          </span>
          <button type="button" onClick={() => setToast(null)} aria-label="Tutup pesan">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {confirmAction && (
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-rose-300 bg-rose-50 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-bold text-rose-950">
                {confirmAction === 'reset_config'
                  ? 'Kembalikan seluruh teks, soal, gambar, jam, dan tema ke pengaturan awal?'
                  : 'Hapus seluruh skor, bintang, dan lencana murid (Reset Permainan)?'}
              </p>
              <p className="text-xs text-rose-800">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmAction(null)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirmAction === 'reset_config') {
                  onResetConfig();
                  setDraft(JSON.parse(JSON.stringify(DEFAULT_MEDIA_CONFIG)));
                  showToast('Media dikembalikan ke pengaturan awal.');
                } else {
                  onResetProgress();
                  showToast('Progress murid berhasil direset.');
                }
                setConfirmAction(null);
              }}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
            >
              Ya, Reset
            </button>
          </div>
        </div>
      )}

      {/* Main 3-Zone Editor Dashboard */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Sidebar Navigation */}
        <aside className="rounded-3xl border border-sky-200 bg-white p-3 shadow-sm lg:col-span-3">
          <p className="px-3 pt-1 pb-2 text-xs font-bold text-slate-500">Menu Editor Media</p>
          <nav className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-start gap-2.5 rounded-2xl px-3 py-2.5 text-left transition ${
                    active
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  <span className="mt-0.5 shrink-0">{item.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-xs font-extrabold sm:text-sm">{item.label}</span>
                    <span
                      className={`block text-[11px] ${
                        active ? 'text-sky-100' : 'text-slate-500'
                      }`}
                    >
                      {item.desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Center Editor Workspace */}
        <div className="space-y-5 lg:col-span-9 xl:col-span-5">
          {/* 1. EDIT TEKS & DIALOG */}
          {activeTab === 'texts' && (
            <div className="space-y-5 rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-extrabold text-slate-900">
                1. Edit Teks, Identitas &amp; Dialog Karakter
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Judul Utama</label>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Subjudul</label>
                  <input
                    type="text"
                    value={draft.subtitle}
                    onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Nama Karakter 1</label>
                  <input
                    type="text"
                    value={draft.tikiName}
                    onChange={(e) => setDraft({ ...draft, tikiName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Nama Karakter 2</label>
                  <input
                    type="text"
                    value={draft.bimoName}
                    onChange={(e) => setDraft({ ...draft, bimoName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Nama Sekolah</label>
                  <input
                    type="text"
                    value={draft.schoolName}
                    onChange={(e) => setDraft({ ...draft, schoolName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Nama Guru</label>
                  <input
                    type="text"
                    value={draft.teacherName}
                    onChange={(e) => setDraft({ ...draft, teacherName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Kelas</label>
                  <input
                    type="text"
                    value={draft.className}
                    onChange={(e) => setDraft({ ...draft, className: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={draft.subject}
                    onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Deskripsi Singkat Media</label>
                <textarea
                  rows={2}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Narasi Cerita Pembuka</label>
                <textarea
                  rows={3}
                  value={draft.introNarration}
                  onChange={(e) => setDraft({ ...draft, introNarration: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="font-display text-base font-extrabold text-slate-900">
                  Dialog Karakter &amp; Teks Demonstrasi
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Subjudul Peta Petualangan</label>
                  <input
                    type="text"
                    value={draft.dialogs.mapSubtitle}
                    onChange={(e) =>
                      setDraft({ ...draft, dialogs: { ...draft.dialogs, mapSubtitle: e.target.value } })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Dialog Simulasi Belajar</label>
                  <textarea
                    rows={2}
                    value={draft.dialogs.simLearnHint}
                    onChange={(e) =>
                      setDraft({ ...draft, dialogs: { ...draft.dialogs, simLearnHint: e.target.value } })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Pertanyaan Mode Eksperimen</label>
                  <input
                    type="text"
                    value={draft.dialogs.simExperimentQuestion}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        dialogs: { ...draft.dialogs, simExperimentQuestion: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Dialog Penyemangat saat Bermain</label>
                  <input
                    type="text"
                    value={draft.dialogs.gameStartEncouragement}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        dialogs: { ...draft.dialogs, gameStartEncouragement: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Tujuan Pembelajaran</label>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        learningObjectives: [...draft.learningObjectives, 'Tujuan pembelajaran baru'],
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-sky-100 px-3 py-1 text-xs font-bold text-sky-900"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah
                  </button>
                </div>
                {draft.learningObjectives.map((obj, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => {
                        const next = [...draft.learningObjectives];
                        next[idx] = e.target.value;
                        setDraft({ ...draft, learningObjectives: next });
                      }}
                      className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          learningObjectives: draft.learningObjectives.filter((_, i) => i !== idx),
                        })
                      }
                      className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                      aria-label="Hapus tujuan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. EDIT MATERI */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-3xl border border-sky-200 bg-white p-5 shadow-sm">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-slate-900">
                    2. Edit Materi Pembelajaran
                  </h2>
                  <p className="text-xs text-slate-600">
                    Tambah, ubah, hapus, atau atur urutan materi pada menu Belajar Dulu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newMat: MaterialItem = {
                      id: `mat-${Date.now()}`,
                      order: draft.materials.length + 1,
                      title: 'Materi Baru',
                      type: 'custom',
                      summary: 'Ringkasan singkat materi untuk kelas 2 SD.',
                      explanation: 'Penjelasan materi dengan bahasa sederhana.',
                      instruction: 'Klik contoh waktu di bawah atau gerakkan jarum.',
                      exampleTimes: ['03.00', '06.30'],
                      narrationText: 'Ayo pelajari materi ini bersama Tiki dan Bimo.',
                    };
                    setDraft({ ...draft, materials: [...draft.materials, newMat] });
                  }}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700 whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" /> Tambah Materi
                </button>
              </div>

              {draft.materials.map((mat, idx) => (
                <div
                  key={mat.id}
                  className="space-y-3 rounded-3xl border border-sky-200 bg-white p-5 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="font-display text-base font-extrabold text-sky-900">
                      {idx + 1}. {mat.title}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const reordered = moveItem(draft.materials, idx, -1).map((m, i) => ({
                            ...m,
                            order: i + 1,
                          }));
                          setDraft({ ...draft, materials: reordered });
                        }}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                        aria-label="Naikkan urutan"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const reordered = moveItem(draft.materials, idx, 1).map((m, i) => ({
                            ...m,
                            order: i + 1,
                          }));
                          setDraft({ ...draft, materials: reordered });
                        }}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                        aria-label="Turunkan urutan"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      {draft.materials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = draft.materials
                              .filter((m) => m.id !== mat.id)
                              .map((m, i) => ({ ...m, order: i + 1 }));
                            setDraft({ ...draft, materials: filtered });
                          }}
                          className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                          aria-label="Hapus materi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600">Judul Materi</label>
                      <input
                        type="text"
                        value={mat.title}
                        onChange={(e) => {
                          const next = [...draft.materials];
                          next[idx] = { ...mat, title: e.target.value };
                          setDraft({ ...draft, materials: next });
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600">
                        Contoh Waktu (pisahkan koma)
                      </label>
                      <input
                        type="text"
                        value={mat.exampleTimes.join(', ')}
                        onChange={(e) => {
                          const next = [...draft.materials];
                          next[idx] = {
                            ...mat,
                            exampleTimes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          };
                          setDraft({ ...draft, materials: next });
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600">Ringkasan Utama</label>
                      <input
                        type="text"
                        value={mat.summary}
                        onChange={(e) => {
                          const next = [...draft.materials];
                          next[idx] = { ...mat, summary: e.target.value };
                          setDraft({ ...draft, materials: next });
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600">Instruksi Murid</label>
                      <input
                        type="text"
                        value={mat.instruction}
                        onChange={(e) => {
                          const next = [...draft.materials];
                          next[idx] = { ...mat, instruction: e.target.value };
                          setDraft({ ...draft, materials: next });
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600">Penjelasan Lengkap</label>
                    <textarea
                      rows={2}
                      value={mat.explanation}
                      onChange={(e) => {
                        const next = [...draft.materials];
                        next[idx] = { ...mat, explanation: e.target.value };
                        setDraft({ ...draft, materials: next });
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. EDIT SOAL */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-sky-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-xl font-extrabold text-slate-900">
                    3. Edit Bank Soal Level {selectedLevel.id}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      const newQ: GameQuestion = {
                        id: `q-${Date.now()}`,
                        type: 'set_clock',
                        prompt: 'Atur jarum jam ke pukul 05.00!',
                        targetHour: 5,
                        targetMinute: 0,
                        hint: 'Jarum pendek ke angka 5, jarum panjang ke angka 12.',
                        feedbackCorrect: 'Hebat! Jawabanmu tepat sekali!',
                        feedbackWrong: 'Coba periksa kembali posisi jarum jamnya.',
                        points: 10,
                        difficulty: 'mudah',
                      };
                      updateSelectedLevel((l) => ({
                        ...l,
                        questions: [...l.questions, newQ],
                        questionCount: l.questions.length + 1,
                      }));
                    }}
                    className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" /> Tambah Soal Baru
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {draft.levels.map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSelectedLevelId(lvl.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        selectedLevelId === lvl.id
                          ? 'bg-sky-600 text-white'
                          : 'bg-sky-50 text-sky-900 hover:bg-sky-100'
                      }`}
                    >
                      Level {lvl.id} ({lvl.questions.length})
                    </button>
                  ))}
                </div>
              </div>

              {selectedLevel.questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-display text-sm font-extrabold text-slate-900">
                      Soal #{qIdx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedLevel((l) => ({
                            ...l,
                            questions: moveItem(l.questions, qIdx, -1),
                          }))
                        }
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedLevel((l) => ({
                            ...l,
                            questions: moveItem(l.questions, qIdx, 1),
                          }))
                        }
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      {selectedLevel.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedLevel((l) => ({
                              ...l,
                              questions: l.questions.filter((item) => item.id !== q.id),
                            }))
                          }
                          className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600">Teks Soal</label>
                      <input
                        type="text"
                        value={q.prompt}
                        onChange={(e) => {
                          const nextQs = [...selectedLevel.questions];
                          nextQs[qIdx] = { ...q, prompt: e.target.value };
                          updateSelectedLevel((l) => ({ ...l, questions: nextQs }));
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600">Jenis Soal</label>
                      <select
                        value={q.type}
                        onChange={(e) => {
                          const nextQs = [...selectedLevel.questions];
                          nextQs[qIdx] = { ...q, type: e.target.value as QuestionType };
                          updateSelectedLevel((l) => ({ ...l, questions: nextQs }));
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="click_part">Klik Bagian Jam</option>
                        <option value="set_clock">Atur Jarum Jam</option>
                        <option value="multiple_choice">Pilihan Ganda Jam</option>
                        <option value="match_activity">Cocokkan Kegiatan</option>
                      </select>
                    </div>
                  </div>

                  {q.type === 'click_part' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-600">
                        Kunci Klik (1–12, hour_hand, atau minute_hand)
                      </label>
                      <input
                        type="text"
                        value={q.targetPart ?? ''}
                        onChange={(e) => {
                          const nextQs = [...selectedLevel.questions];
                          nextQs[qIdx] = { ...q, targetPart: e.target.value };
                          updateSelectedLevel((l) => ({ ...l, questions: nextQs }));
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  )}

                  {q.type === 'set_clock' && (
                    <div className="flex flex-col gap-3 rounded-2xl bg-sky-50 p-3 sm:flex-row sm:items-center">
                      <div className="grid flex-1 grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700">Jam Kunci (1–12)</label>
                          <input
                            type="number"
                            min={1}
                            max={12}
                            value={q.targetHour ?? 3}
                            onChange={(e) => {
                              const nextQs = [...selectedLevel.questions];
                              nextQs[qIdx] = { ...q, targetHour: Number(e.target.value) };
                              updateSelectedLevel((l) => ({ ...l, questions: nextQs }));
                            }}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">Menit Kunci (0 / 30)</label>
                          <input
                            type="number"
                            min={0}
                            max={55}
                            step={5}
                            value={q.targetMinute ?? 0}
                            onChange={(e) => {
                              const nextQs = [...selectedLevel.questions];
                              nextQs[qIdx] = { ...q, targetMinute: Number(e.target.value) };
                              updateSelectedLevel((l) => ({ ...l, questions: nextQs }));
                            }}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold"
                          />
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-center rounded-xl bg-white/80 p-2">
                        <InteractiveClock
                          totalMinutes={((q.targetHour ?? 3) % 12) * 60 + (q.targetMinute ?? 0)}
                          interactiveDrag={false}
                          showDigital={false}
                          showControls={false}
                          sizePx={96}
                          clockFaceColor={draft.design.clockFaceColor}
                          clockBezelColor={draft.design.clockBezelColor}
                          clockNumberColor={draft.design.clockNumberColor}
                          hourHandColor={draft.design.hourHandColor}
                          minuteHandColor={draft.design.minuteHandColor}
                          numberStyle={draft.design.clockNumberStyle}
                          clockAppearance={draft.design.clockAppearance}
                          showMinuteTicks={draft.design.showMinuteTicks}
                          audioSettings={draft.audio}
                        />
                      </div>
                    </div>
                  )}

                  {(q.type === 'multiple_choice' || q.type === 'match_activity') && (
                    <div className="space-y-3 rounded-2xl bg-sky-50 p-3">
                      {q.type === 'multiple_choice' && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="grid flex-1 grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700">Jam Ditampilkan</label>
                              <input
                                type="number"
                                min={1}
                                max={12}
                                value={q.displayHour ?? 3}
                                onChange={(e) => {
                                  const nextQs = [...selectedLevel.questions];
                                  nextQs[qIdx] = { ...q, displayHour: Number(e.target.value) };
                                  updateSelectedLevel((l) => ({ ...l, questions: nextQs }));
                                }}
                                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700">Menit Ditampilkan</label>
                              <input
                                type="number"
                                min={0}
                                max={55}
                                step={5}
                                value={q.displayMinute ?? 0}
                                onChange={(e) => {
                                  const nextQs = [...selectedLevel.questions];
                                  nextQs[qIdx] = { ...q, displayMinute: Number(e.target.value) };
                                  updateSelectedLevel((l) => ({ ...l, questions: nextQs }));
                                }}
                                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold"
                              />
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-center rounded-xl bg-white/80 p-2">
                            <InteractiveClock
                              totalMinutes={((q.displayHour ?? 3) % 12) * 60 + (q.displayMinute ?? 0)}
                              interactiveDrag={false}
                              showDigital={false}
                              showControls={false}
                              sizePx={96}
                              clockFaceColor={draft.design.clockFaceColor}
                              clockBezelColor={draft.design.clockBezelColor}
                              clockNumberColor={draft.design.clockNumberColor}
                              hourHandColor={draft.design.hourHandColor}
                              minuteHandColor={draft.design.minuteHandColor}
                              numberStyle={draft.design.clockNumberStyle}
                              clockAppearance={draft.design.clockAppearance}
                              showMinuteTicks={draft.design.showMinuteTicks}
                              audioSettings={draft.audio}
                            />
                          </div>
                        </div>
                      )}
                      {q.type === 'match_activity' && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold text-slate-700">Ilustrasi Kegiatan</label>
                            <select
                              value={q.activityKey ?? 'bangun'}
                              onChange={(e) => {
                                const nextQs = [...selectedLevel.questions];
                                nextQs[qIdx] = {
                                  ...q,
                                  activityKey: e.target.value as ActivityKey,
                                };
                                updateSelectedLevel((l) => ({ ...l, questions: nextQs }));
                              }}
                              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm"
                            >
                              {draft.activities.map((act) => (
                                <option key={act.id} value={act.illustrationKey}>
                                  {act.name} ({act.time})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700">Nama Kegiatan Ditampilkan</label>
                            <input
                              type="text"
                              value={q.activityName ?? ''}
                              onChange={(e) => {
                                const nextQs = [...selectedLevel.questions];
                                nextQs[qIdx] = { ...q, activityName: e.target.value };
                                updateSelectedLevel((l) => ({ ...l, questions: nextQs }));
                              }}
                              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm"
                            />
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700">
                            Pilihan Jawaban (pisahkan koma)
                          </label>
                          <input
                            type="text"
                            value={(q.choices ?? []).join(', ')}
                            onChange={(e) => {
                              const nextQs = [...selectedLevel.questions];
                              nextQs[qIdx] = {
                                ...q,
                                choices: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              };
                              updateSelectedLevel((l) => ({ ...l, questions: nextQs }));
                            }}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">Kunci Jawaban</label>
                          <input
                            type="text"
                            value={q.correctChoice ?? ''}
                            onChange={(e) => {
                              const nextQs = [...selectedLevel.questions];
                              nextQs[qIdx] = { ...q, correctChoice: e.target.value };
                              updateSelectedLevel((l) => ({ ...l, questions: nextQs }));
                            }}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600">Petunjuk Soal (Opsional)</label>
                      <input
                        type="text"
                        value={q.hint ?? ''}
                        onChange={(e) => {
                          const nextQs = [...selectedLevel.questions];
                          nextQs[qIdx] = { ...q, hint: e.target.value };
                          updateSelectedLevel((l) => ({ ...l, questions: nextQs }));
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600">Feedback Benar</label>
                      <input
                        type="text"
                        value={q.feedbackCorrect}
                        onChange={(e) => {
                          const nextQs = [...selectedLevel.questions];
                          nextQs[qIdx] = { ...q, feedbackCorrect: e.target.value };
                          updateSelectedLevel((l) => ({ ...l, questions: nextQs }));
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600">Feedback Salah</label>
                      <input
                        type="text"
                        value={q.feedbackWrong}
                        onChange={(e) => {
                          const nextQs = [...selectedLevel.questions];
                          nextQs[qIdx] = { ...q, feedbackWrong: e.target.value };
                          updateSelectedLevel((l) => ({ ...l, questions: nextQs }));
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. EDIT GAMBAR */}
          {activeTab === 'images' && (
            <div className="space-y-6 rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-extrabold text-slate-900">
                4. Edit Gambar Karakter, Latar, Level &amp; Kegiatan
              </h2>

              {/* Character Images */}
              <div className="space-y-3">
                <h3 className="font-display text-base font-extrabold text-slate-800">
                  Gambar Karakter ({draft.tikiName} &amp; {draft.bimoName})
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
                    <TikiCharacter size={74} customImageUrl={draft.images.tikiImageUrl} />
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-900">Karakter {draft.tikiName}</p>
                      <div className="flex flex-wrap gap-2">
                        <label className="cursor-pointer rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-900 hover:bg-sky-200">
                          Unggah Gambar
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleCompressedImageUpload(e, (url) =>
                                setDraft({ ...draft, images: { ...draft.images, tikiImageUrl: url } })
                              )
                            }
                            className="hidden"
                          />
                        </label>
                        {draft.images.tikiImageUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraft({ ...draft, images: { ...draft.images, tikiImageUrl: undefined } })
                            }
                            className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-600"
                          >
                            Pakai Kartun Asli
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
                    <BimoCharacter size={74} customImageUrl={draft.images.bimoImageUrl} />
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-900">Karakter {draft.bimoName}</p>
                      <div className="flex flex-wrap gap-2">
                        <label className="cursor-pointer rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-900 hover:bg-sky-200">
                          Unggah Gambar
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleCompressedImageUpload(e, (url) =>
                                setDraft({ ...draft, images: { ...draft.images, bimoImageUrl: url } })
                              )
                            }
                            className="hidden"
                          />
                        </label>
                        {draft.images.bimoImageUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraft({ ...draft, images: { ...draft.images, bimoImageUrl: undefined } })
                            }
                            className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-600"
                          >
                            Pakai Kartun Asli
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* World Backgrounds */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="font-display text-base font-extrabold text-slate-800">
                  Gambar Background Utama
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { key: 'heroBg' as const, label: 'Latar Beranda', fallback: DEFAULT_HERO_BG },
                    { key: 'mapBg' as const, label: 'Latar Peta', fallback: DEFAULT_MAP_BG },
                    { key: 'castleBg' as const, label: 'Latar Istana', fallback: DEFAULT_CASTLE_BG },
                  ].map((item) => (
                    <div key={item.key} className="space-y-2 rounded-2xl border border-slate-200 p-3">
                      <p className="text-xs font-bold text-slate-900">{item.label}</p>
                      {draft.images[item.key] ? (
                        <img
                          src={draft.images[item.key]}
                          alt={item.label}
                          className="h-24 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-24 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-500">
                          Tanpa gambar
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        <label className="cursor-pointer rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-900">
                          Unggah
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleCompressedImageUpload(e, (url) =>
                                setDraft({ ...draft, images: { ...draft.images, [item.key]: url } })
                              )
                            }
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({ ...draft, images: { ...draft.images, [item.key]: item.fallback } })
                          }
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700"
                        >
                          Bawaan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-Level Custom Images */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="font-display text-base font-extrabold text-slate-800">
                  Gambar Khusus Setiap Level (Area 1–6)
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {draft.levels.map((lvl, lIdx) => (
                    <div key={lvl.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900">
                          Level {lvl.id}: {lvl.areaName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {lvl.customImageUrl ? 'Gambar kustom terpasang' : 'Pakai ilustrasi standar'}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <label className="cursor-pointer rounded-lg bg-sky-100 px-2.5 py-1.5 text-xs font-bold text-sky-900">
                          Unggah
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleCompressedImageUpload(e, (url) => {
                                const nextLvls = [...draft.levels];
                                nextLvls[lIdx] = { ...lvl, customImageUrl: url };
                                setDraft({ ...draft, levels: nextLvls });
                              })
                            }
                            className="hidden"
                          />
                        </label>
                        {lvl.customImageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              const nextLvls = [...draft.levels];
                              nextLvls[lIdx] = { ...lvl, customImageUrl: undefined };
                              setDraft({ ...draft, levels: nextLvls });
                            }}
                            className="rounded-lg border border-rose-200 px-2 py-1.5 text-xs text-rose-600"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Activity Illustrations */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="font-display text-base font-extrabold text-slate-800">
                  Ilustrasi Kegiatan Sehari-hari
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {draft.activities.map((act, idx) => (
                    <div key={act.id} className="space-y-2 rounded-2xl border border-slate-200 p-2.5">
                      <ActivityIllustration
                        activityKey={act.illustrationKey}
                        customImageUrl={act.customImageUrl}
                        alt={act.name}
                        className="h-20 w-full"
                      />
                      <p className="truncate text-xs font-bold text-slate-900">{act.name}</p>
                      <div className="flex gap-1.5">
                        <label className="cursor-pointer rounded-md bg-sky-100 px-2 py-1 text-[11px] font-bold text-sky-900">
                          Ganti
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleCompressedImageUpload(e, (url) => {
                                const next = [...draft.activities];
                                next[idx] = { ...act, customImageUrl: url };
                                setDraft({ ...draft, activities: next });
                              })
                            }
                            className="hidden"
                          />
                        </label>
                        {act.customImageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...draft.activities];
                              next[idx] = { ...act, customImageUrl: undefined };
                              setDraft({ ...draft, activities: next });
                            }}
                            className="text-[11px] font-bold text-rose-600"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. EDIT AUDIO */}
          {activeTab === 'audio' && (
            <div className="space-y-5 rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-extrabold text-slate-900">
                5. Edit Audio, Suara &amp; Narasi
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-2xl bg-sky-50 p-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Aktifkan Narasi Suara</p>
                    <p className="text-xs text-slate-600">Suara pembuka, materi, dan soal</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.audio.narrationEnabled !== false}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        audio: { ...draft.audio, narrationEnabled: e.target.checked },
                      })
                    }
                    className="h-5 w-5 accent-sky-600"
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-teal-50 p-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Musik Latar Otomatis</p>
                    <p className="text-xs text-slate-600">Melodi ceria lembut</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.audio.bgMusicEnabled}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        audio: { ...draft.audio, bgMusicEnabled: e.target.checked },
                      })
                    }
                    className="h-5 w-5 accent-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Pilihan Suara</label>
                  <select
                    value={draft.audio.voiceCharacter}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        audio: { ...draft.audio, voiceCharacter: e.target.value as VoiceCharacter },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="tiki">Suara {draft.tikiName}</option>
                    <option value="bimo">Suara {draft.bimoName}</option>
                    <option value="narrator">Suara Narator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Volume Narasi ({Math.round(draft.audio.narrationVolume * 100)}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={draft.audio.narrationVolume}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        audio: { ...draft.audio, narrationVolume: Number(e.target.value) },
                      })
                    }
                    className="mt-3 w-full accent-sky-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Volume Efek ({Math.round(draft.audio.sfxVolume * 100)}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={draft.audio.sfxVolume}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        audio: { ...draft.audio, sfxVolume: Number(e.target.value) },
                      })
                    }
                    className="mt-3 w-full accent-amber-500"
                  />
                </div>
              </div>

              {/* Edit Narration Texts + Custom Audio Upload */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="font-display text-base font-extrabold text-slate-900">
                  Teks Narasi &amp; Unggah Rekaman Audio
                </h3>

                <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800">Narasi Pembuka</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          audioEngine.speak(
                            draft.introNarration,
                            draft.audio,
                            draft.audio.voiceCharacter,
                            'intro_narration'
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-900"
                      >
                        <Volume2 className="h-3.5 w-3.5" /> Tes
                      </button>
                      <label className="cursor-pointer rounded-lg bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-900">
                        Unggah MP3/WAV
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioFileUpload(e, 'intro_narration')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={draft.introNarration}
                    onChange={(e) => setDraft({ ...draft, introNarration: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                {draft.materials.map((mat, idx) => (
                  <div key={mat.id} className="rounded-2xl border border-slate-200 p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Narasi Materi {idx + 1}: {mat.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            audioEngine.speak(
                              mat.narrationText,
                              draft.audio,
                              draft.audio.voiceCharacter,
                              `material_${mat.id}`
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-900"
                        >
                          <Volume2 className="h-3.5 w-3.5" /> Tes
                        </button>
                        <label className="cursor-pointer rounded-lg bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-900">
                          Unggah Audio
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleAudioFileUpload(e, `material_${mat.id}`)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={mat.narrationText}
                      onChange={(e) => {
                        const next = [...draft.materials];
                        next[idx] = { ...mat, narrationText: e.target.value };
                        setDraft({ ...draft, materials: next });
                      }}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. EDIT JAM */}
          {activeTab === 'clock' && (
            <div className="space-y-5 rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-extrabold text-slate-900">
                6. Edit Tampilan &amp; Warna Jam Analog
              </h2>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600">Warna Wajah Jam</label>
                  <input
                    type="color"
                    value={draft.design.clockFaceColor}
                    onChange={(e) =>
                      setDraft({ ...draft, design: { ...draft.design, clockFaceColor: e.target.value } })
                    }
                    className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Warna Bingkai Jam</label>
                  <input
                    type="color"
                    value={draft.design.clockBezelColor}
                    onChange={(e) =>
                      setDraft({ ...draft, design: { ...draft.design, clockBezelColor: e.target.value } })
                    }
                    className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Warna Angka Jam</label>
                  <input
                    type="color"
                    value={draft.design.clockNumberColor}
                    onChange={(e) =>
                      setDraft({ ...draft, design: { ...draft.design, clockNumberColor: e.target.value } })
                    }
                    className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Jarum Pendek (Jam)</label>
                  <input
                    type="color"
                    value={draft.design.hourHandColor}
                    onChange={(e) =>
                      setDraft({ ...draft, design: { ...draft.design, hourHandColor: e.target.value } })
                    }
                    className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Jarum Panjang (Menit)</label>
                  <input
                    type="color"
                    value={draft.design.minuteHandColor}
                    onChange={(e) =>
                      setDraft({ ...draft, design: { ...draft.design, minuteHandColor: e.target.value } })
                    }
                    className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Ukuran Jam</label>
                  <select
                    value={draft.design.clockSize}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        design: {
                          ...draft.design,
                          clockSize: e.target.value as MediaConfig['design']['clockSize'],
                        },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="small">Kecil (245px)</option>
                    <option value="medium">Sedang (285px)</option>
                    <option value="large">Besar (330px)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600">Jenis Angka pada Jam</label>
                  <select
                    value={draft.design.clockNumberStyle}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        design: {
                          ...draft.design,
                          clockNumberStyle: e.target.value as ClockNumberStyle,
                        },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="arabic">Angka Biasa (1 – 12)</option>
                    <option value="roman">Angka Romawi (I – XII)</option>
                    <option value="dots">Titik Penanda Jam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Gaya Tampilan Jam</label>
                  <select
                    value={draft.design.clockAppearance}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        design: {
                          ...draft.design,
                          clockAppearance: e.target.value as ClockAppearance,
                        },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="classic">Klasik Jelas (Ramah Kelas 2)</option>
                    <option value="colorful">Angka Warna-warni</option>
                    <option value="playful">Lingkaran Ceria</option>
                    <option value="minimal">Minimalis Bersih</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2.5 pt-1 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={draft.design.showMinuteTicks}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      design: { ...draft.design, showMinuteTicks: e.target.checked },
                    })
                  }
                  className="h-4 w-4 accent-sky-600"
                />
                Tampilkan garis penanda 60 menit di pinggir jam
              </label>
            </div>
          )}

          {/* 7. EDIT LEVEL */}
          {activeTab === 'levels' && (
            <div className="space-y-5 rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-extrabold text-slate-900">
                7. Edit Level, Kesulitan, Waktu &amp; Reward
              </h2>

              <div className="flex flex-wrap gap-1.5">
                {draft.levels.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSelectedLevelId(lvl.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      selectedLevelId === lvl.id
                        ? 'bg-sky-600 text-white'
                        : 'bg-sky-50 text-sky-900 hover:bg-sky-100'
                    }`}
                  >
                    Area {lvl.id}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600">Nama Area Level</label>
                  <input
                    type="text"
                    value={selectedLevel.areaName}
                    onChange={(e) =>
                      updateSelectedLevel((l) => ({ ...l, areaName: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Judul Misi Game</label>
                  <input
                    type="text"
                    value={selectedLevel.gameTitle}
                    onChange={(e) =>
                      updateSelectedLevel((l) => ({ ...l, gameTitle: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Jumlah Soal Dimainkan</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={selectedLevel.questionCount}
                    onChange={(e) =>
                      updateSelectedLevel((l) => ({
                        ...l,
                        questionCount: Math.max(1, Number(e.target.value)),
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Tingkat Kesulitan</label>
                  <select
                    value={selectedLevel.difficulty}
                    onChange={(e) =>
                      updateSelectedLevel((l) => ({
                        ...l,
                        difficulty: e.target.value as DifficultyLevel,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="lanjut">Lanjut</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">
                    Batas Waktu (Menit · 0 = Tanpa Batas)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={selectedLevel.timeLimitMinutes}
                    onChange={(e) =>
                      updateSelectedLevel((l) => ({
                        ...l,
                        timeLimitMinutes: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Hadiah Koin</label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={selectedLevel.rewardCoins}
                    onChange={(e) =>
                      updateSelectedLevel((l) => ({
                        ...l,
                        rewardCoins: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Nama Lencana Reward</label>
                  <input
                    type="text"
                    value={selectedLevel.badgeName}
                    onChange={(e) =>
                      updateSelectedLevel((l) => ({ ...l, badgeName: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Warna Aksen Level</label>
                  <input
                    type="color"
                    value={selectedLevel.accentColor}
                    onChange={(e) =>
                      updateSelectedLevel((l) => ({ ...l, accentColor: e.target.value }))
                    }
                    className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600">Deskripsi Area</label>
                <input
                  type="text"
                  value={selectedLevel.description}
                  onChange={(e) =>
                    updateSelectedLevel((l) => ({ ...l, description: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600">Instruksi Permainan</label>
                <input
                  type="text"
                  value={selectedLevel.instruction}
                  onChange={(e) =>
                    updateSelectedLevel((l) => ({ ...l, instruction: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Cakupan Materi Jam Global
                </label>
                <select
                  value={draft.learning.timeScope}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      learning: {
                        ...draft.learning,
                        timeScope: e.target.value as 'exact_only' | 'exact_and_half',
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="exact_and_half">Jam Tepat &amp; Setengah Jam (.00 &amp; .30)</option>
                  <option value="exact_only">Jam Tepat Saja (.00)</option>
                </select>
              </div>
            </div>
          )}

          {/* 8. EDIT TEMA */}
          {activeTab === 'theme' && (
            <div className="space-y-5 rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-extrabold text-slate-900">
                8. Edit Tema Warna, Font &amp; Gaya Tombol
              </h2>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">Paket Tema Warna</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(THEME_PRESETS) as MediaConfig['design']['theme'][]).map((key) => {
                    const p = THEME_PRESETS[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            design: {
                              ...draft.design,
                              theme: key,
                              backgroundColor: p.bg,
                              buttonColor: p.btn,
                              clockFaceColor: p.face,
                              clockBezelColor: p.bezel,
                              hourHandColor: p.hour,
                              minuteHandColor: p.min,
                            },
                          })
                        }
                        className={`rounded-xl border p-3 text-left text-xs font-bold transition ${
                          draft.design.theme === key
                            ? 'border-sky-600 bg-sky-50 text-sky-950'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="mb-1.5 block h-3 w-full rounded-full"
                          style={{ backgroundColor: p.btn }}
                        />
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600">Warna Latar Aplikasi</label>
                  <input
                    type="color"
                    value={draft.design.backgroundColor}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        design: { ...draft.design, backgroundColor: e.target.value },
                      })
                    }
                    className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Warna Tombol Utama</label>
                  <input
                    type="color"
                    value={draft.design.buttonColor}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        design: { ...draft.design, buttonColor: e.target.value },
                      })
                    }
                    className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600">Jenis Font</label>
                  <select
                    value={draft.design.fontFamily}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        design: { ...draft.design, fontFamily: e.target.value as AppFontFamily },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="outfit">Outfit (Modern Ramah)</option>
                    <option value="fredoka">Fredoka (Kartun Anak)</option>
                    <option value="nunito">Nunito (Bulat Lembut)</option>
                    <option value="jakarta">Plus Jakarta Sans</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Ukuran Tulisan</label>
                  <select
                    value={draft.design.fontSizeScale}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        design: {
                          ...draft.design,
                          fontSizeScale: e.target.value as MediaConfig['design']['fontSizeScale'],
                        },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="small">Ringkas</option>
                    <option value="normal">Normal</option>
                    <option value="large">Besar (Proyektor)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Gaya Tombol</label>
                  <select
                    value={draft.design.buttonShape}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        design: {
                          ...draft.design,
                          buttonShape: e.target.value as MediaConfig['design']['buttonShape'],
                        },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="rounded">Bulat Sedang</option>
                    <option value="soft">Kotak Halus</option>
                    <option value="pill">Kapsul Penuh</option>
                    <option value="tactile">Tombol Game 3D</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 9. REKAP SKOR & KONTROL KELAS */}
          {activeTab === 'guide' && (
            <div className="space-y-5 rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl font-extrabold text-slate-900">
                  Rekap Skor &amp; Kontrol Kelas
                </h2>
                <button
                  type="button"
                  onClick={() => setConfirmAction('reset_progress')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset Progress Murid
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = {
                    ...draft,
                    learning: {
                      ...draft.learning,
                      unlockAllLevels: !draft.learning.unlockAllLevels,
                    },
                  };
                  setDraft(next);
                  onSaveConfig(next);
                  showToast(
                    next.learning.unlockAllLevels
                      ? 'Seluruh level dibuka untuk kelas!'
                      : 'Level kembali dikunci berurutan.'
                  );
                }}
                className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold text-white transition ${
                  draft.learning.unlockAllLevels ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              >
                {draft.learning.unlockAllLevels ? (
                  <>
                    <Unlock className="h-4 w-4" /> Semua Level Terbuka (Klik untuk Kunci Berurutan)
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Buka Seluruh Level Sekarang
                  </>
                )}
              </button>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="py-2 pr-3">Area</th>
                      <th className="py-2 pr-3">Bintang</th>
                      <th className="py-2 text-right">Skor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {draft.levels.map((lvl) => (
                      <tr key={lvl.id}>
                        <td className="py-2 pr-3 font-semibold text-slate-900">
                          {lvl.id}. {lvl.areaName}
                        </td>
                        <td className="font-mono-num py-2 pr-3 text-amber-600 font-bold">
                          {progress.levelStars[lvl.id] ?? 0} / 3
                        </td>
                        <td className="font-mono-num py-2 text-right font-bold text-slate-900">
                          {progress.levelBestScores[lvl.id] ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Live Preview Panel */}
        <aside
          className={`${
            showMobilePreview ? 'block' : 'hidden xl:block'
          } xl:col-span-4`}
        >
          <div
            className="sticky top-20 rounded-3xl border border-sky-200 p-5 shadow-sm transition-colors"
            style={
              {
                backgroundColor: draft.design.backgroundColor,
                fontFamily: previewFont,
                fontSize: `${draft.design.fontSizeScale}rem`,
                '--font-display': previewFont,
                '--font-body': previewFont,
              } as React.CSSProperties
            }
          >
            <div className="mb-3 flex items-center justify-between border-b border-slate-200/70 pb-2">
              <span className="text-xs font-extrabold text-slate-700">
                Preview Langsung Media
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Otomatis terupdate
              </span>
            </div>

            {/* Preview Title & Characters */}
            <div className="rounded-2xl border border-sky-200/80 bg-white/90 p-4 text-center shadow-xs">
              <p className="text-[11px] font-bold text-sky-700">
                {draft.subject} · {draft.className}
              </p>
              <h3 className="mt-0.5 text-lg font-extrabold text-slate-900">{draft.title}</h3>
              <p className="text-xs font-semibold text-slate-600">{draft.subtitle}</p>

              <div className="mt-3 flex items-center justify-center gap-3">
                <TikiCharacter size={64} pose="pointing" customImageUrl={draft.images.tikiImageUrl} />
                <BimoCharacter size={64} pose="excited" customImageUrl={draft.images.bimoImageUrl} />
              </div>

              <button
                type="button"
                onClick={handleSave}
                style={{ backgroundColor: draft.design.buttonColor }}
                className={`mt-3 min-h-[40px] px-5 py-2 text-xs font-extrabold text-white transition hover:brightness-110 ${previewBtnClass}`}
              >
                MULAI PETUALANGAN
              </button>
            </div>

            {/* Preview Interactive Clock */}
            <div className="mt-4 flex flex-col items-center rounded-2xl border border-sky-200/80 bg-white/95 p-4 shadow-xs">
              <p className="mb-2 text-xs font-bold text-slate-600">
                Preview Jam (Coba Putar Jarumnya!)
              </p>
              <InteractiveClock
                totalMinutes={previewMinutes}
                onChangeMinutes={setPreviewMinutes}
                interactiveDrag
                showDigital
                showControls={false}
                sizePx={210}
                clockFaceColor={draft.design.clockFaceColor}
                clockBezelColor={draft.design.clockBezelColor}
                clockNumberColor={draft.design.clockNumberColor}
                hourHandColor={draft.design.hourHandColor}
                minuteHandColor={draft.design.minuteHandColor}
                numberStyle={draft.design.clockNumberStyle}
                clockAppearance={draft.design.clockAppearance}
                showMinuteTicks={draft.design.showMinuteTicks}
                audioSettings={draft.audio}
              />
            </div>

            {/* Preview Selected Level Card */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-sky-200/80 bg-white/95 p-3.5 text-left shadow-xs">
              {selectedLevel.customImageUrl && (
                <img
                  src={selectedLevel.customImageUrl}
                  alt={selectedLevel.areaName}
                  className="h-12 w-12 shrink-0 rounded-xl object-cover border border-slate-200"
                />
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-500">
                  Preview Level {selectedLevel.id} · {selectedLevel.difficulty} ·{' '}
                  {selectedLevel.questionCount} Soal
                </p>
                <p className="truncate font-bold text-slate-900">{selectedLevel.areaName}</p>
                <p className="truncate text-xs font-semibold" style={{ color: selectedLevel.accentColor }}>
                  Misi: {selectedLevel.gameTitle}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
