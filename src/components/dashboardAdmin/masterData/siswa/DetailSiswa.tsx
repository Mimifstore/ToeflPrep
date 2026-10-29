"use client";

type Props = {
  data: any;
  onBack: () => void;
};

export default function DetailSiswa({ data, onBack }: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow border space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-700">Detail Siswa</h1>

        <button
          onClick={onBack}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Kembali
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3 font-bold w-1/3">Nama</td>
              <td className="w-2 p-2 text-center">:</td>
              <td className="px-4 py-3 font-medium">{data.name || "-"}</td>
            </tr>

            <tr className="border-b">
              <td className="px-4 py-3 font-bold">Email</td>
              <td className="w-2 p-2 text-center">:</td>
              <td className="px-4 py-3 font-medium">{data.user?.email}</td>
            </tr>

            <tr className="border-b">
              <td className="px-4 py-3 font-bold">No HP</td>
              <td className="w-2 p-2 text-center">:</td>
              <td className="px-4 py-3 font-medium">{data.phone || "-"}</td>
            </tr>

            <tr className="border-b">
              <td className="px-4 py-3 font-bold">Gender</td>
              <td className="w-2 p-2 text-center">:</td>
              <td className="px-4 py-3 font-medium">{data.gender || "-"}</td>
            </tr>

            <tr className="border-b">
              <td className="px-4 py-3 font-bold">Provinsi</td>
              <td className="w-2 p-2 text-center">:</td>
              <td className="px-4 py-3 font-medium">{data.province || "-"}</td>
            </tr>

            <tr className="border-b">
              <td className="px-4 py-3 font-bold">Kota</td>
              <td className="w-2 p-2 text-center">:</td>
              <td className="px-4 py-3 font-medium">{data.city || "-"}</td>
            </tr>

            <tr className="border-b">
              <td className="px-4 py-3 font-bold">Kecamatan</td>
              <td className="w-2 p-2 text-center">:</td>
              <td className="px-4 py-3 font-medium">{data.district || "-"}</td>
            </tr>

            <tr className="border-b">
              <td className="px-4 py-3 font-bold">Desa</td>
              <td className="w-2 p-2 text-center">:</td>
              <td className="px-4 py-3 font-medium">{data.village || "-"}</td>
            </tr>

            <tr className="border-b">
              <td className="px-4 py-3 font-bold">Alamat</td>
              <td className="w-2 p-2 text-center">:</td>
              <td className="px-4 py-3 font-medium">{data.address || "-"}</td>
            </tr>

            <tr className="border-b">
              <td className="px-4 py-3 font-bold">Status Member</td>
              <td className="w-2 p-2 text-center">:</td>
              <td className="px-4 py-3 font-medium">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    data.isMember
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {data.isMember ? "Member" : "-"}
                </span>
              </td>
            </tr>

            <tr>
              <td className="px-4 py-3 font-bold">Status Akun</td>
              <td className="w-2 p-2 text-center">:</td>
              <td className="px-4 py-3 font-medium">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    data.user?.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {data.user?.isActive ? "Aktif" : "Non Aktif"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
