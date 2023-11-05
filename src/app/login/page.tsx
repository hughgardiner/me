import { api } from "~/trpc/server";

export default async function Login({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const code = searchParams.code ?? null;

  const login = await api.spotify.login.query({
    code: typeof code === "string" ? code : null,
  });

  return (
    <section className="rounded-lg bg-gradient-to-b from-purple-700 to-black p-4">
      {/* Spotify Branded Login Button */}

      <a href={login}>
        <button className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700">
          Login with Spotify
        </button>
      </a>
    </section>
  );
}
