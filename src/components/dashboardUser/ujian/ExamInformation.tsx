import { EXAM_INFORMATION } from "@/constants/exam-information";

export default function ExamInformation() {
  return (
    <div className="border rounded-md overflow-hidden shadow-sm">
      <div className="bg-blue-600 px-4 py-2">
        <h2 className="text-white font-semibold text-sm md:text-base">
          Informasi
        </h2>
      </div>

      <div className="bg-white p-5">
        <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 italic leading-relaxed">
          {EXAM_INFORMATION.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
