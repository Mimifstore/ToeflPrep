"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { signInCredentials } from "@/libs/actions";
import { LoginButton } from "../button";
import { GithubButton, GoogleButton } from "./social-button";
import AuthPendingOverlay from "./pending-overlay";

const FormLogin = () => {
  const [state, formAction] = useFormState(signInCredentials, null);

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Selamat datang kembali
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Masuk untuk melanjutkan ke dashboard kamu
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <AuthPendingOverlay />
        {state?.message ? (
          <div
            className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            role="alert"
          >
            {state.message}
          </div>
        ) : null}

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
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
            <span className="mt-1.5 block text-xs text-red-500">
              {state?.error?.email}
            </span>
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
          </div>

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
            <span className="mt-1.5 block text-xs text-red-500">
              {state?.error?.password}
            </span>
          </div>
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Ingat saya
        </label>

        {/* Submit Button */}
        <div className="[&_button]:w-full [&_button]:rounded-lg [&_button]:bg-blue-600 [&_button]:py-2.5 [&_button]:text-sm [&_button]:font-medium [&_button]:text-white [&_button]:transition-colors [&_button]:hover:bg-blue-700">
          <LoginButton />
        </div>
      </form>

      {/* DIVIDER */}
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-100" />
        <span className="text-xs font-medium text-gray-400">atau lanjutkan dengan</span>
        <span className="h-px flex-1 bg-gray-100" />
      </div>

      {/* SOCIAL LOGIN */}
      <div className="space-y-2.5">
        <GoogleButton />
        <GithubButton />
      </div>

      {/* FOOTER */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          Daftar di sini
        </Link>
      </p>
    </div>
  );
};

export default FormLogin;