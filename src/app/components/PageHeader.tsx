import Image from "next/image";
import { LibraryImageContainer } from "./LibaryImageContainer";
import { ProfileUserTag, type Stat } from "./ProfileUserTag";

interface PageProps {
  pageName: string;
  stat?: Stat;
  pageImagePath: string;
}
export const PageHeader: React.FC<PageProps> = ({
  stat,
  pageName,
  pageImagePath,
}) => {
  return (
    <div className="flex gap-4">
      <div className="shadow-album">
        <LibraryImageContainer>
          <Image
            src={pageImagePath}
            alt={`${pageName} Image`}
            className="rounded-lg"
            width={200}
            height={200}
          />
        </LibraryImageContainer>
      </div>
      <div className="flex flex-col items-start justify-start">
        <h1>{pageName}</h1>
        <ProfileUserTag stat={stat} />
      </div>
    </div>
  );
};
