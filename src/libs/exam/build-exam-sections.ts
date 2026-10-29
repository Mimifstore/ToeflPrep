// Satu-satunya tempat yang menyusun section + soal + direction untuk halaman ujian peserta.

type RawQuestion = {
  id: string;
  type: string;
  order: number;
  questionText: string | null;
  directionText: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  audioPlayLimit: number | null;
  options: { label: string; text: string }[];
  section: {
    id: string;
    title: string;
    direction: string | null;
    order: number;
  } | null;
};

type SessionItem = { order: number; question: RawQuestion };

// Kalau ada beberapa direction berurutan sebelum satu soal, ditampilkan sekaligus
const DIRECTION_SEPARATOR = '<hr class="my-6 border-gray-200" />';

export function buildExamSections(
  items: SessionItem[],
  answerMap: Map<string, string | null>,
  playCountMap: Map<string, number>,
) {
  const sectionsMap = new Map<string, any>();
  // status direction per section, dibaca berurutan sesuai urutan sesi
  const state = new Map<
    string,
    { pending: string[]; current: string | null }
  >();

  const sorted = [...items].sort((a, b) => a.order - b.order);

  for (const item of sorted) {
    const q = item.question;
    const section = q.section;
    if (!section) continue;

    if (!sectionsMap.has(section.id)) {
      sectionsMap.set(section.id, {
        id: section.id,
        title: section.title,
        direction: section.direction ?? null,
        order: section.order,
        questions: [],
      });
      state.set(section.id, { pending: [], current: null });
    }

    const sec = sectionsMap.get(section.id);
    const st = state.get(section.id)!;

    // DIRECTION tidak jadi soal: dikumpulkan dulu, lalu menempel ke soal berikutnya
    if (q.type === "DIRECTION") {
      const text = q.directionText?.trim() || q.questionText?.trim() || null;
      if (text) st.pending.push(text);
      continue;
    }

    // directionBefore: direction yang muncul TEPAT sebelum soal ini (awal sebuah blok)
    let directionBefore: string | null = null;
    if (st.pending.length > 0) {
      directionBefore = st.pending.join(DIRECTION_SEPARATOR);
      st.current = directionBefore;
      st.pending = [];
    }

    sec.questions.push({
      id: q.id,
      order: sec.questions.length + 1, // nomor urut tanpa menghitung DIRECTION
      type: q.type,
      question: q.questionText,
      audio: q.audioUrl,
      image: q.imageUrl,
      audioPlayLimit: q.audioPlayLimit,
      playCount: playCountMap.get(q.id) || 0,
      answer: answerMap.get(q.id) || "",
      directionBefore,
      // direction yang berlaku untuk blok soal ini (buat tombol "Lihat petunjuk")
      passageDirection: st.current,
      options: [...q.options]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((o) => ({ id: o.label, text: o.text })),
    });
  }

  return Array.from(sectionsMap.values()).sort(
    (a: any, b: any) => a.order - b.order,
  );
}
