import React, { type ReactNode } from "react";

export const LibraryImageContainer: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <div className="items-center justify-center rounded-md bg-zinc-700">
      {children}
    </div>
  );
};
