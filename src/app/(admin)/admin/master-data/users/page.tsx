"use client";

import { useEffect, useState } from "react";
import UsersTable from "@/components/dashboardAdmin/masterData/UsersTable";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  //  FETCH USERS
  const fetchUsers = async () => {
    const res = await fetch("/api/user");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  //  DELETE USER
  const deleteUser = async (id: string) => {
    await fetch(`/api/user/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  //  CHANGE ROLE
  const changeRole = async (id: string, role: string) => {
    await fetch("/api/user/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ userId: id, role }),
    });
    fetchUsers();
  };

  //  TOGGLE 
  const toggleStatus = async (id: string) => {
    await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });

    fetchUsers();
  };

  return (
    <section className="space-y-6">
      <h1 className="text-lg font-bold text-gray-700">
        Data User
      </h1>

      <UsersTable
        users={users}
        onDelete={deleteUser}
        onRoleChange={changeRole}
        onToggle={toggleStatus} 
      />
    </section>
  );
}

