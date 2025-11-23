"use client";

import { Galaxy } from "@/clients/components/main/atoms";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export function MobileWarning() {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        {
          y: 250,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 2.5,
          ease: "elastic.out(1, 0.3)",
        }
      );
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Galaxy
          mouseRepulsion={false}
          mouseInteraction={false}
          density={1.5}
          glowIntensity={0.5}
          saturation={0.8}
          hueShift={240}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-lg w-full mx-4">
        <div
          ref={cardRef}
          className="bg-black/40 backdrop-blur-md rounded-3xl shadow-2xl p-10 text-center space-y-8 border border-white/10"
        >
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-linear-to-br from-blue-500/30 to-purple-500/20 rounded-2xl flex items-center justify-center transform rotate-6">
                <svg
                  className="w-14 h-14 text-blue-400 transform -rotate-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              {/* Decorative dots */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75"></div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Hey there!</h1>
            <p className="text-sm text-gray-400 font-medium">
              We&apos;re better on bigger screens
            </p>
          </div>

          {/* Description */}
          <div className="space-y-4 py-4">
            <p className="text-base text-gray-200 leading-relaxed">
              Tusk works best on desktop or laptop computers.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Switch to a larger screen to get the full experience.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-300">
                Wide screen workspace
              </span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-300">
                Enhanced features & controls
              </span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-300">Better performance</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-xs text-gray-400">
              Minimum screen width:{" "}
              <span className="font-semibold text-blue-400">1000px</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
