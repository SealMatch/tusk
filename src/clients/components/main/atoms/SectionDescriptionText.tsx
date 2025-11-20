import React from "react";

export const SectionDescriptionText = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto"
      {...props}>
      {children}
    </p>
  );
};
