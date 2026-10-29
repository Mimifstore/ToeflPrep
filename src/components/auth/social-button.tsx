import { IoLogoGoogle, IoLogoGithub } from "react-icons/io5";
import { signInWithGoogle, signInWithGithub } from "../../actions/auth-actions";

export const GoogleButton = () => {
  return (
    <form action={signInWithGoogle}>
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