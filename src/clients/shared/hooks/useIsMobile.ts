"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if the current device is mobile
 * Based on screen width (< 768px)
 */
export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Initial check
    checkIsMobile();

    // Listen for resize events
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, [breakpoint]);

  // Return false during SSR to avoid hydration mismatch
  return { isMobile: isClient ? isMobile : false, isClient };
}
