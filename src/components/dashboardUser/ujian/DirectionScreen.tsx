"use client";

type Props = {
  title: string;
  direction?: string | null;
  onContinue: () => void;
};

export default function DirectionScreen({
  title,
  direction,
  onContinue,
}: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8">
      <div className="mb-6">
        <div className="inline-flex items-center text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full mb-3">
          <p className="w-3.5 h-3.5 " />
          Petunjuk Pengerjaan
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      <div
        className="prose max-w-none text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line [&_*]:max-w-full"
        dangerouslySetInnerHTML={{
          __html: direction || "Tidak ada petunjuk",
        }}
      />

      <div className="flex justify-center mt-10 pt-6 border-t border-gray-100">
        <button
          onClick={onContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Lanjut
        </button>
      </div>
    </div>
  );
}
