import Link from "next/link";
import Image from "next/image";
import FormLogin from "@/components/auth/form-login";

const Login = ({ searchParams }: { searchParams?: { error?: string } }) => {
  const params = searchParams?.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* LOGO */}
        <div className="flex justify-center">
          <Link href="/">
            <Image src="/images/logo.png" alt="logo" width={120} height={40} />
          </Link>
        </div>

        {params === "OAuthAccountNotLinked" ? (
          <div
            className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            role="alert"
          >
            Akun ini sudah terhubung dengan provider login lain.
          </div>
        ) : null}

        <FormLogin />
      </div>
    </div>
  );
};

export default Login;