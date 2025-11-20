import { Button } from "@/clients/shared/ui/button";
import Link from "next/link";
import React from "react";

interface CallToActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href: string;
}

export const CallToActionButton = ({
  children,
  href,
  ...props
}: CallToActionButtonProps) => {
  return (
    <Button
      asChild
      variant="secondary"
      size="lg"
      className="font-bold"
      {...props}>
      <Link href={href}>{children}</Link>
    </Button>
  );
};
