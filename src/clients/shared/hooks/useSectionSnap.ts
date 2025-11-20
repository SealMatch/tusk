"use client";
import { useEffect, useRef } from "react";

export const useSectionSnap = () => {
  const isScrolling = useRef(false);
  const currentSectionIndex = useRef(0);
  const accumulatedDelta = useRef(0);
  const lastWheelTime = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    const SCROLL_THRESHOLD = 100;
    const RESET_TIME = 200;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrolling.current) {
        return;
      }

      const now = Date.now();

      if (now - lastWheelTime.current > RESET_TIME) {
        accumulatedDelta.current = 0;
      }
      lastWheelTime.current = now;

      accumulatedDelta.current += e.deltaY;

      if (Math.abs(accumulatedDelta.current) >= SCROLL_THRESHOLD) {
        const sections = Array.from(document.querySelectorAll("section"));
        if (sections.length === 0) return;

        let targetIndex = currentSectionIndex.current;

        if (
          accumulatedDelta.current > 0 &&
          currentSectionIndex.current < sections.length - 1
        ) {
          targetIndex = currentSectionIndex.current + 1;
        } else if (
          accumulatedDelta.current < 0 &&
          currentSectionIndex.current > 0
        ) {
          targetIndex = currentSectionIndex.current - 1;
        }

        if (targetIndex !== currentSectionIndex.current) {
          isScrolling.current = true;
          currentSectionIndex.current = targetIndex;
          accumulatedDelta.current = 0;

          const targetSection = sections[targetIndex];
          const moveTop =
            window.pageYOffset + targetSection.getBoundingClientRect().top;

          window.scrollTo({ top: moveTop, left: 0, behavior: "smooth" });

          setTimeout(() => {
            isScrolling.current = false;
          }, 1200);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isScrolling.current) {
        e.preventDefault();
        return;
      }

      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY.current - touchEndY;

      accumulatedDelta.current += deltaY;

      if (Math.abs(accumulatedDelta.current) >= SCROLL_THRESHOLD) {
        const sections = Array.from(document.querySelectorAll("section"));
        if (sections.length === 0) return;

        let targetIndex = currentSectionIndex.current;

        if (
          accumulatedDelta.current > 0 &&
          currentSectionIndex.current < sections.length - 1
        ) {
          targetIndex = currentSectionIndex.current + 1;
        } else if (
          accumulatedDelta.current < 0 &&
          currentSectionIndex.current > 0
        ) {
          targetIndex = currentSectionIndex.current - 1;
        }

        if (targetIndex !== currentSectionIndex.current) {
          isScrolling.current = true;
          currentSectionIndex.current = targetIndex;
          accumulatedDelta.current = 0;

          const targetSection = sections[targetIndex];
          const moveTop =
            window.pageYOffset + targetSection.getBoundingClientRect().top;

          window.scrollTo({ top: moveTop, left: 0, behavior: "smooth" });

          setTimeout(() => {
            isScrolling.current = false;
          }, 1200);
        }
      }

      touchStartY.current = touchEndY;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return {};
};
