"use client";

import { ArrowUp } from "lucide-react";

const SCROLL_CONTAINER_ID = "dashboard-scroll-area";

export function BackToTopButton(): React.JSX.Element {
  const handleClick = (): void => {
    document.getElementById(SCROLL_CONTAINER_ID)?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      className="fixed bottom-24 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full
                bg-[#232B2B] text-white shadow-lg transition-all duration-200
                hover:scale-105 hover:bg-[#ED017F]
                lg:bottom-8"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
