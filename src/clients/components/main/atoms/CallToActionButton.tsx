import { Button } from "@/clients/shared/ui/button";
import React from "react";

export const CallToActionButton = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <Button variant="secondary" size="lg" className="font-bold" {...props}>
      {children}
    </Button>
  );
};
