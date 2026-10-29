"use client";

import { useState } from "react";
import { Trash2, Eye, EyeOff } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

export default function UsersTable({
  users,
  onDelete,
  onRoleChange,
  onToggle,
}: any) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const perPage = 5;

  const filtered = users.filter(
    (u: User) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between gap-3 mb-4">
        <input
          placeholder="Cari nama / email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded-lg text-sm w-full md:w-64"
        />
      </div>

      {/* 🔥 MOBILE */}
      <div className="md:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            Tidak ada data
          </div>
        ) : (
          paginated.map((user: User, i: number) => (
            <div
              key={user.id}
              className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-gray-400">
                    #{(page - 1) * perPage + i + 1}
                  </div>

                  <div className="font-semibold text-sm mt-1">
                    {user.name}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {user.email}
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                    user.role === "ADMIN"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user.role}
                </span>
              </div>

              <div className="mt-3 text-xs">
                <span
                  className={`px-2 py-1 rounded-full ${
                    user.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {user.isActive ? "Active" : "Non-active"}
                </span>
              </div>

              {/* ACTION */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                {/* TOGGLE */}
                <button
                  onClick={() => onToggle(user.id)}
                  className="p-2 bg-gray-100 rounded-lg"
                >
                  {user.isActive ? (
                    <Eye size={14} className="text-green-600" />
                  ) : (
                    <EyeOff size={14} className="text-red-500" />
                  )}
                </button>

                {/* ROLE */}
                <select
                  value={user.role}
                  onChange={(e) => onRoleChange(user.id, e.target.value)}
                  className="text-xs border rounded px-2 py-1 bg-white"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>

                {/* DELETE */}
                <button
                  onClick={() => onDelete(user.id)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-red-100 transition group"
                >
                  <Trash2
                    size={14}
                    className="group-hover:text-red-600"
                    strokeWidth={2.5}
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔥 DESKTOP (TIDAK DIUBAH) */}
      <div className="hidden md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b text-left text-gray-600">
            <tr>
              <th className="px-3 py-3 w-12">No</th>
              <th className="px-3 py-3">Nama</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3 w-32">Level</th>
              <th className="px-3 py-3 w-32">Status</th>
              <th className="px-3 py-3 w-40">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              paginated.map((user: User, i: number) => (
                <tr
                  key={user.id}
                  className="border-b text-xs md:text-sm font-medium"
                >
                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {(page - 1) * perPage + i + 1}
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {user.name}
                  </td>
                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    {user.email}
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "ADMIN"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-xs md:text-sm font-medium">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {user.isActive ? "Active" : "Non-active"}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggle(user.id)}
                        className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition"
                      >
                        {user.isActive ? (
                          <Eye size={16} className="text-green-600" />
                        ) : (
                          <EyeOff size={16} className="text-red-500" />
                        )}
                      </button>

                      <select
                        value={user.role}
                        onChange={(e) =>
                          onRoleChange(user.id, e.target.value)
                        }
                        className="text-xs md:text-sm border rounded-md px-2 py-1 bg-white"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>

                      <button
                        onClick={() => onDelete(user.id)}
                        className="p-1.5 rounded-md bg-gray-100 hover:bg-red-100 transition group"
                      >
                        <Trash2
                          size={14}
                          className="text-gray-600 group-hover:text-red-600"
                          strokeWidth={2.5}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between md:justify-end mt-4 gap-2 text-xs md:text-sm">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-2 py-1 md:px-3 md:py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="bg-blue-600 text-white px-2 md:px-3 py-1 rounded">
          {page}
        </span>

        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          className="px-2 py-1 md:px-3 md:py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}