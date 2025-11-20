"use client";
import { Button } from "@/clients/shared/ui/button";
import { ConnectModal, useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";
import React, { useState } from "react";

interface CallToActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href: string;
}

export const CallToActionButton = ({
  children,
  href,
  ...props
}: CallToActionButtonProps) => {
  const currentAccount = useCurrentAccount();
  const [open, setOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!currentAccount) {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <>
      <Button
        asChild={!!currentAccount}
        variant="secondary"
        size="lg"
        className="font-bold flex"
        onClick={!currentAccount ? handleClick : undefined}
        {...props}>
        {currentAccount ? (
          <Link className="flex items-center gap-2" href={href}>
            {children}
          </Link>
        ) : (
          <div className="flex items-center gap-2">{children}</div>
        )}
      </Button>
      <ConnectModal trigger={<div />} open={open} onOpenChange={setOpen} />
    </>
  );
};
