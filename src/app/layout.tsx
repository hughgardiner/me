import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { headers } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import Link from "next/link";
import Image from "next/image";
import { Library } from "./components/svgs/Library";
import { LibraryImageContainer } from "./components/LibaryImageContainer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Hugh Gardiner",
  description: "Personal website of Hugh Gardiner",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const summaryTiles = [
  {
    title: "About Me",
    path: "/about",
    needsContainer: false,
    image: "/aboutMe.png",
    author: "Hugh Gardiner",
  },
  {
    title: "Skills",
    image: "/skills.png",
    needsContainer: true,
    path: "/skills",
    author: "Software Engineer",
  },
];
const renderChild = (tile: (typeof summaryTiles)[number]) => {
  const child = (
    <Image
      src={tile.image ?? "/headshot.png"}
      alt="Headshot"
      width={50}
      height={50}
      className="rounded-md self-center"
    />
  );
  return tile.needsContainer ? (
    <LibraryImageContainer>{child}</LibraryImageContainer>
  ) : (
    child
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider headers={headers()}>
          <div className="flex min-h-screen flex-col">
            <div className="flex flex-1 flex-col">
              <div className="h-2/3 flex-1 grid-cols-main gap-2 px-3 pt-3 lg:grid">
                <section className="hidden rounded-lg bg-dark p-5 lg:block">
                  <div className="flex flex-row gap-2 p-1">
                    <Library />
                    <h2 className="text-zinc-400">My Library</h2>
                  </div>
                  <div className="flex max-h-full flex-col">
                    {summaryTiles.map((tile) => (
                      <Link
                        href={tile.path}
                        key={tile.title}
                        className="flex flex-row gap-2 p-3"
                      >
                        {renderChild(tile)}
                        <div className="flex flex-col">
                          <h2>{tile.title}</h2>
                          <h3>{tile.author}</h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
                <div className="flex-1 overflow-y-auto">{children}</div>
              </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 lg:hidden">
              <div className="flex items-center justify-around py-2 bg-dark">
                {summaryTiles.map((tile) => (
                  <Link
                    href={tile.path}
                    key={tile.title}
                    className="flex flex-col self-center"
                  >
                    {renderChild(tile)}
                    <span className="text-zinc-400 self-center">{tile.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
