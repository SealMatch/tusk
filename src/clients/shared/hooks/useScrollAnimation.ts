"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  stagger?: number;
  start?: string;
  toggleActions?: string;
}

export const useScrollAnimation = <T extends Element = HTMLElement>(
  options: ScrollAnimationOptions = {}
) => {
  const elementsRef = useRef<(T | null)[]>([]);

  const {
    from = { opacity: 0, y: 60, scale: 0.95 },
    to = { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
    stagger = 0.2,
    start = "top 85%",
    toggleActions = "play none none none",
  } = options;

  useEffect(() => {
    const elements = elementsRef.current.filter(Boolean) as T[];

    elements.forEach((element, index) => {
      gsap.fromTo(element, from, {
        ...to,
        scrollTrigger: {
          trigger: element,
          start,
          toggleActions,
        },
        delay: index * stagger,
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [from, to, stagger, start, toggleActions]);

  return elementsRef;
};
