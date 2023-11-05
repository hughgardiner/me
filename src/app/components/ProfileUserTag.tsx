import Image from "next/image";

export interface Stat {
  name: string;
  value: number;
}
export const ProfileUserTag: React.FC<{stat?: Stat}> = ({ stat }) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <Image src="/headshot.png" alt="Headshot" className="rounded-full" width={35} height={35} />
      <p>Hugh Gardiner</p>
      {stat ? (
        <>
        •
        <p>{stat.value} {stat.name}</p>
        </>
      ) : undefined}
    </div>
  );
};
