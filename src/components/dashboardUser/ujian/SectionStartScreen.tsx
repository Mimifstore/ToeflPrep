"use client";

type Props = {
  title: string;
  onStart: () => void;
};

export default function SectionStartScreen({ title, onStart }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 text-center">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-2">
        Klik tombol di bawah untuk memulai section ini.
      </p>

      <div className="flex justify-center mt-10 pt-6 border-t border-gray-100">
        <button
          onClick={onStart}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Mulai Section
        </button>
      </div>
    </div>
  );
}
