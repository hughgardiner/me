import Image from "next/image";
import { Heart } from "./svgs/Heart";
import { api } from "~/trpc/server";

export const NowPlayingFooter = async () => {
  const data = await api.spotify.getNowPlaying.query();

  return (
    <div className="min-h-[5vh] flex flex-row justify-between items-center">
      <div className="flex-1 flex flex-row p-3">
        <div className="flex flex-row justify-between items-center gap-4">
          <Image
            src={data.albumImageUrl || '/true.png'}
            className="rounded-md"
            alt="Headshot"
            width={70}
            height={70}
          />
          <div>
            <h2>{data.song ?? 'Hugh Gardiner'}</h2>
            <h3>{data.artist ?? 'NotSureYet'}</h3>
          </div>
          <Heart />
        </div>
      </div>
      <div className="flex-1"></div>
      <div className="flex-1"></div>
    </div>
  );
};
