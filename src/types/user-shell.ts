export type UserShellUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isMember: boolean;
};

export type UserShellSession = { user: UserShellUser } | null;
