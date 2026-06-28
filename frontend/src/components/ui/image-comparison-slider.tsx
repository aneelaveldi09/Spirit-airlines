import React, { useState, useRef, useCallback, useEffect } from "react";

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  altBefore?: string;
  altAfter?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const ImageComparison = ({
  beforeImage,
  afterImage,
  altBefore = "Before",
  altAfter = "After",
  beforeLabel = "WITHOUT analytics",
  afterLabel = "WITH analytics",
}: ImageComparisonProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let pos = ((clientX - rect.left) / rect.width) * 100;
      pos = Math.max(0, Math.min(100, pos));
      setSliderPosition(pos);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none rounded-xl overflow-hidden"
      style={{ boxShadow: "0 0 40px rgba(255,230,0,0.1)" }}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseLeave={handleMouseUp}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* After image (with analytics) */}
      <div
        className="absolute top-0 left-0 h-full w-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={afterImage}
          alt={altAfter}
          className="h-full w-full object-cover object-left"
          draggable="false"
        />
        {/* After label */}
        <div
          className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: "#FFE600", color: "#000", letterSpacing: 1 }}
        >
          {afterLabel}
        </div>
      </div>

      {/* Before image (without analytics) */}
      <img
        src={beforeImage}
        alt={altBefore}
        className="block h-full w-full object-cover object-left"
        draggable="false"
      />
      {/* Before label */}
      <div
        className="absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full"
        style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
      >
        {beforeLabel}
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 flex items-center justify-center cursor-ew-resize"
        style={{ left: `calc(${sliderPosition}% - 1px)`, width: 2, background: "rgba(255,230,0,0.8)" }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        <div
          className={`rounded-full flex items-center justify-center transition-transform duration-150 ${isDragging ? "scale-110" : ""}`}
          style={{
            width: 44, height: 44,
            background: "#FFE600",
            boxShadow: "0 0 20px rgba(255,230,0,0.5)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 18 3 12 9 6" transform="scale(-1,1) translate(-24,0)" />
          </svg>
        </div>
      </div>
    </div>
  );
};
