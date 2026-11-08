"use client";

import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import Spinner from "@/components/Ui/Spinner";

type Variant = "primary" | "success" | "warning" | "secondary";
type Size = "sm" | "md";

const BASE =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-70";

const VARIANT: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  success: "bg-green-600 text-white hover:bg-green-700",
  warning: "bg-yellow-500 text-white hover:bg-yellow-600",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
};

const SIZE: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

const ICON_SIZE: Record<Size, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  /** Posisi icon terhadap teks. */
  iconPosition?: "start" | "end";
  fullWidth?: boolean;
  children: ReactNode;
};

const classes = (variant: Variant, size: Size, fullWidth: boolean) =>
  `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${fullWidth ? "w-full" : ""}`;

type ActionButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    /** true = spinner menggantikan icon dan tombol dinonaktifkan. */
    loading?: boolean;
  };

/** Tombol aksi. Selama `loading`, icon berganti spinner (lebar tombol tetap) dan tombol nonaktif. */
export function ActionButton({
  variant = "primary",
  size = "sm",
  icon: Icon,
  iconPosition = "start",
  fullWidth = false,
  loading = false,
  disabled,
  children,
  ...rest
}: ActionButtonProps) {
  const icon = loading ? <Spinner className={ICON_SIZE[size]} /> : Icon && <Icon className={ICON_SIZE[size]} />;

  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes(variant, size, fullWidth)}
    >
      {iconPosition === "start" && icon}
      {children}
      {iconPosition === "end" && icon}
    </button>
  );
}

/** Navigasi yang tak kunjung selesai (jaringan putus): tombol dikembalikan supaya bisa dicoba lagi. */
const PENDING_TIMEOUT_MS = 10_000;

type ActionLinkProps = CommonProps & {
  href: string;
  /** true = buka di tab baru (mis. halaman pembayaran). Tidak ada status memuat karena halaman ini tetap. */
  external?: boolean;
};

/**
 * Tautan bergaya tombol. Untuk halaman di dalam aplikasi, setelah diklik icon berganti spinner dan
 * tombol terkunci sampai halaman tujuan terbuka, supaya siswa tahu kliknya sudah diterima.
 */
export function ActionLink({
  href,
  external = false,
  variant = "primary",
  size = "sm",
  icon: Icon,
  iconPosition = "start",
  fullWidth = false,
  children,
}: ActionLinkProps) {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setPending(false), PENDING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [pending]);

  const className = classes(variant, size, fullWidth);
  const staticIcon = Icon && <Icon className={ICON_SIZE[size]} />;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {iconPosition === "start" && staticIcon}
        {children}
        {iconPosition === "end" && staticIcon}
        <span className="sr-only"> (buka di tab baru)</span>
      </a>
    );
  }

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Ctrl/⌘/Shift + klik membuka tab baru: halaman ini tetap, jadi tidak perlu status memuat.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    setPending(true);
  };

  const pendingIcon = pending ? <Spinner className={ICON_SIZE[size]} /> : staticIcon;

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      tabIndex={pending ? -1 : undefined}
      className={className}
    >
      {iconPosition === "start" && pendingIcon}
      {children}
      {iconPosition === "end" && pendingIcon}
    </Link>
  );
}
