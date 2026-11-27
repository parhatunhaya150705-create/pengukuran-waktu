import React from 'react';
import { BookOpen, GraduationCap, CheckCircle2 } from 'lucide-react';
import { MediaConfig } from '../types/media';
import { TikiCharacter, BimoCharacter } from '../components/characters/TikiBimo';

interface GuidePageProps {
  config: MediaConfig;
  onStartAdventure: () => void;
  onOpenTeacher: () => void;
}

const STUDENT_STEPS = [
  'Klik tombol MULAI PETUALANGAN di halaman depan atau pilih BELAJAR DULU.',
  'Pilih dunia atau area permainan pada Peta Petualangan.',
  'Baca atau dengarkan instruksi dari Tiki dan Bimo dengan teliti.',
  'Mainkan tantangan pada setiap area sesuai perintah.',
  'Tarik jarum pendek (biru) dan jarum panjang (oranye) untuk mengatur jam.',
  'Klik tombol PERIKSA JAWABAN untuk mengecek hasilmu.',
  'Kumpulkan bintang, koin, dan lencana penghargaan di setiap area.',
  'Selesaikan satu area untuk membuka petualangan ke area berikutnya.',
];

const TEACHER_STEPS = [
  'Buka menu MODE GURU atau EDIT MEDIA di halaman utama.',
  'Pilih materi pembelajaran atau atur ruang lingkup waktu (jam tepat / setengah jam).',
  'Atur status buka-kunci level jika ingin langsung menampilkan level tertentu di kelas.',
  'Edit teks materi, soal, pilihan jawaban, atau feedback sesuai kebutuhan kelas.',
  'Gunakan tampilan proyektor (Mode Belajar / Demonstrasi) untuk menjelaskan di depan kelas.',
  'Simpan perubahan agar otomatis tersimpan di browser perangkat ini.',
  'Pantau rekap skor dan riwayat pengerjaan murid di tab Rekap Skor.',
  'Gunakan tombol Reset Progress apabila ingin memulai sesi baru untuk murid berikutnya.',
];

export const GuidePage: React.FC<GuidePageProps> = ({
  config,
  onStartAdventure,
  onOpenTeacher,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-sky-700">Petunjuk Penggunaan Media</p>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Panduan Murid &amp; Panduan Guru
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <TikiCharacter pose="happy" size={62} />
          <BimoCharacter pose="happy" size={62} />
        </div>
      </div>

      {/* Learning Objectives */}
      <section className="rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-extrabold text-slate-900">
          Tujuan Pembelajaran ({config.className})
        </h2>
        <ul className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {config.learningObjectives.map((obj, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Panduan Murid */}
        <section className="flex flex-col justify-between rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-extrabold text-slate-900">
                Panduan untuk Murid
              </h2>
            </div>
            <ol className="space-y-2.5">
              {STUDENT_STEPS.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="font-mono-num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-900">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <button
            type="button"
            onClick={onStartAdventure}
            className="mt-6 min-h-[44px] w-full rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-sky-700"
          >
            Mulai Petualangan Sekarang
          </button>
        </section>

        {/* Panduan Guru */}
        <section className="flex flex-col justify-between rounded-3xl border border-teal-200 bg-white p-6 shadow-sm">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-extrabold text-slate-900">
                Panduan untuk Guru
              </h2>
            </div>
            <ol className="space-y-2.5">
              {TEACHER_STEPS.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="font-mono-num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-900">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <button
            type="button"
            onClick={onOpenTeacher}
            className="mt-6 min-h-[44px] w-full rounded-2xl bg-teal-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-teal-700"
          >
            Buka Mode Guru &amp; Editor
          </button>
        </section>
      </div>
    </div>
  );
};
