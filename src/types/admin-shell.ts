export type TopbarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

export type TopbarSession = { user: TopbarUser } | null;
