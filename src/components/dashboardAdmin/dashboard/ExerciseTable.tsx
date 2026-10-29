// export default function ExerciseTable() {
//   const data: any[] = [
//     // nanti dari DB
//   ];

//   return (
//     <div className="bg-white rounded-2xl p-4 shadow-lg border-l-4 border-red-400">
//       <h3 className="font-semibold mb-3 text-gray-700">Summary Latihan Terakhir</h3>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm">
//           <thead className="text-left text-sm text-gray-600 border-b bg-gray-50">
//             <tr>
//               <th className="py-2 px-2">No</th>
//               <th className="py-2 px-2">Kategori</th>
//               <th className="py-2 px-2">Judul Ujian</th>
//               <th className="py-2 px-2">Waktu Mulai</th>
//               <th className="py-2 px-2">Waktu Selesai</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.length === 0 ? (
//               <tr>
//                 <td colSpan={5} className="py-6 text-center text-gray-500 border-b">
//                   Tidak ada riwayat latihan soal
//                 </td>
//               </tr>
//             ) : null}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }