import Link from "next/link";

export const NavigationLink = ({
  href,
  isCurrentPath,
  children,
}: {
  href: string;
  isCurrentPath: boolean;
  children: React.ReactNode;
}) => {
  return (
    <Link
      href={href}
      className={`relative transition-all duration-300 
    after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:transition-all after:duration-300
    ${
      isCurrentPath
        ? "font-semibold text-white after:bg-white"
        : "text-white/70 hover:text-white after:bg-transparent hover:after:bg-white"
    }`}>
      {children}
    </Link>
  );
};
