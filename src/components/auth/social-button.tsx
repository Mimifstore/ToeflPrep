import { IoLogoGoogle, IoLogoGithub } from "react-icons/io5";
import { signInWithGoogle, signInWithGithub } from "../../actions/auth-actions";
import AuthPendingOverlay from "./pending-overlay";

export const GoogleButton = () => {
  return (
    <form action={signInWithGoogle}>
      <AuthPendingOverlay />
      <button
        type="submit"
        className="flex items-center justify-center gap-1 py-2.5 rounded-lg uppercase text-white font-medium text-sm bg-blue-500 w-full"
      >
        <IoLogoGoogle />
        Sign In With Google
      </button>
    </form>
  );
};

export const GithubButton = () => {
  return (
    <form action={signInWithGithub}>
      <AuthPendingOverlay />
      <button
        type="submit"
        className="flex items-center justify-center gap-1 py-2.5 rounded-lg uppercase text-white font-medium text-sm bg-gray-500 w-full"
      >
        <IoLogoGithub />
        Sign In With Github
      </button>
    </form>
  );
};