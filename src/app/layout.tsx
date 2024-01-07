import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { headers } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import Link from "next/link";
import Image from "next/image";
import { Library } from "./components/svgs/Library";
import { NowPlayingFooter } from "./components/NowPlayingFooter";
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
  },
  // {
  //   title: "Interests",
  //   path: '/interests',
  //   // image: Headshot,
  // },
  // {
  //   title: "Projects",
  //   path: '/projects',
  //   // image: Headshot,
  // },
  // {
  //   title: "Music",
  //   path: '/music',
  //   // image: Headshot,
  // },
  // {
  //   title: "Podcasts",
  //   path: '/podcasts',
  //   // image: Headshot,
  // },
  // {
  //   title: "Austin",
  //   path: '/austin',
  //   // image: Headshot,
  // },
];
const renderChild = (tile: (typeof summaryTiles)[number]) => {
  const child = (
    <Image
      src={tile.image ?? "/headshot.png"}
      alt="Headshot"
      width={50}
      height={50}
      className="rounded-md"
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
          <div className="flex h-screen flex-1 flex-col">
            <div className="lg:grid h-2/3 flex-1 grid-cols-main gap-2 px-3 pt-3">
              <section className="rounded-lg bg-dark p-5 hidden lg:block">
                <div className="flex flex-row gap-2 p-1">
                  <Library />
                  <h2 className="text-zinc-400">My Library</h2>
                </div>
                <div className="flex flex-col max-h-full">
                  {summaryTiles.map((tile) => (
                    <Link
                      href={tile.path}
                      key={tile.title}
                      className="flex flex-row gap-2 p-3"
                    >
                      {renderChild(tile)}
                      <div className="flex flex-col">
                        <h2>{tile.title}</h2>
                        <h3>{tile.author ?? "Hugh G"}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
              {children}
            </div>
            <NowPlayingFooter />
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}