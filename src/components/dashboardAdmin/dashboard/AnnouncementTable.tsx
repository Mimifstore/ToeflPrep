// export default function AnnouncementTable() {
//   const data: { id: string; title: string }[] = [
//     // nanti dari DB
//   ];

//   return (
//     <div className="bg-white rounded-2xl p-4 shadow-lg border-l-4 border-green-400">
//       <h3 className="font-semibold mb-3 text-gray-700">Pengumuman</h3>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm">
//           <thead className="text-left text-sm text-gray-600 border-b bg-gray-50">
//             <tr>
//               <th className="py-2 px-2">No</th>
//               <th className="py-2 px-2">Perihal</th>
//               <th className="py-2 px-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.length === 0 ? (
//               <tr>
//                 <td colSpan={3} className="py-6 text-center text-gray-500 border-b">
//                   Data Pengumuman kosong
//                 </td>
//               </tr>
//             ) : (
//               data.map((a, i) => (
//                 <tr key={a.id} className="border-b text-gray-500 text-xs font-semibold">
//                   <td className="py-2 px-2">{i + 1}</td>
//                   <td className="py-2 px-2">{a.title}</td>
//                   <td className="py-2 px-2 text-blue-600">—</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }