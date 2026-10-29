"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { User, Mail, Lock, ShieldCheck } from "lucide-react";
import { signUpCredentials } from "@/libs/actions";
import { RegisterButton } from "../button";

const FormRegister = () => {
  const [state, formAction] = useFormState(signUpCredentials, null);

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Buat akun baru</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Daftar untuk mulai menggunakan platform
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        {state?.message ? (
          <div
            className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            role="alert"
          >
            {state.message}
          </div>
        ) : null}

        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
            Nama
          </label>
          <div className="flex items-center rounded-lg border border-gray-200 px-3.5 transition-colors focus-within:border-blue-500">
            <User className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Masukkan nama lengkap"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>
          <div aria-live="polite" aria-atomic="true">
            <span className="mt-1.5 block text-xs text-red-500">{state?.error?.name}</span>
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="flex items-center rounded-lg border border-gray-200 px-3.5 transition-colors focus-within:border-blue-500">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              id="email"
              type="email"
              name="email"
              placeholder="nama@email.com"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>
          <div aria-live="polite" aria-atomic="true">
            <span className="mt-1.5 block text-xs text-red-500">{state?.error?.email}</span>
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="flex items-center rounded-lg border border-gray-200 px-3.5 transition-colors focus-within:border-blue-500">
            <Lock className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>
          <div aria-live="polite" aria-atomic="true">
            <span className="mt-1.5 block text-xs text-red-500">{state?.error?.password}</span>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
            Konfirmasi Password
          </label>
          <div className="flex items-center rounded-lg border border-gray-200 px-3.5 transition-colors focus-within:border-blue-500">
            <ShieldCheck className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              id="confirmPassword"
              type="password"
              name="ConfirmPassword"
              placeholder="••••••••"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>
          <div aria-live="polite" aria-atomic="true">
            <span className="mt-1.5 block text-xs text-red-500">{state?.error?.ConfirmPassword}</span>
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            name="terms"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Saya setuju dengan{" "}
          <span className="font-medium text-blue-600">Syarat &amp; Ketentuan</span>
        </label>

        {/* Submit Button */}
        <div className="[&_button]:w-full [&_button]:rounded-lg [&_button]:bg-blue-600 [&_button]:py-2.5 [&_button]:text-sm [&_button]:font-medium [&_button]:text-white [&_button]:transition-colors [&_button]:hover:bg-blue-700">
          <RegisterButton />
        </div>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
};

export default FormRegister;