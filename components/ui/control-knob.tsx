"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, type MotionValue, useMotionValue, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

const MIN_DEG = -135;
const MAX_DEG = 135;
const TOTAL_TICKS = 40;
const DEGREES_PER_TICK = (MAX_DEG - MIN_DEG) / TOTAL_TICKS;

interface ReactorKnobProps {
  /** Controlled value 0-100 (e.g. from scroll progress). When set, knob is read-only. */
  value?: number;
  className?: string;
  /** Compact inline mode (no full-screen wrapper) */
  inline?: boolean;
}

export default function ReactorKnob({ value, className, inline = true }: ReactorKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isControlled = value !== undefined && value !== null;

  const rawRotation = useMotionValue(-135);
  const snappedRotation = useMotionValue(-135);
  const smoothRotation = useSpring(snappedRotation, {
    stiffness: 400,
    damping: 35,
    mass: 0.8,
  });

  const displayValue = useTransform(smoothRotation, [MIN_DEG, MAX_DEG], [0, 100]);
  const lightOpacity = useTransform(rawRotation, [MIN_DEG, MAX_DEG], [0.05, 0.5]);
  const lightBlur = useTransform(rawRotation, [MIN_DEG, MAX_DEG], ["0px", "20px"]);
  const indicatorGlow = useTransform(
    rawRotation,
    (r) => `0 0 ${Math.max(5, (r + 135) / 10)}px orange`
  );

  const knobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isControlled || value == null) return;
    const deg = MIN_DEG + (value / 100) * (MAX_DEG - MIN_DEG);
    rawRotation.set(deg);
    snappedRotation.set(deg);
  }, [isControlled, value, rawRotation, snappedRotation]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isControlled) return;
      setIsDragging(true);
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    },
    [isControlled]
  );

  useEffect(() => {
    if (!isDragging || isControlled) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!knobRef.current) return;

      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const x = e.clientX - centerX;
      const y = e.clientY - centerY;

      let rads = Math.atan2(y, x);
      let degs = rads * (180 / Math.PI) + 90;

      if (degs > 180) degs -= 360;
      if (degs < MIN_DEG && degs > -180) degs = MIN_DEG;
      if (degs > MAX_DEG) degs = MAX_DEG;

      rawRotation.set(degs);
      const snap = Math.round(degs / DEGREES_PER_TICK) * DEGREES_PER_TICK;
      snappedRotation.set(snap);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, isControlled, rawRotation, snappedRotation]);

  const ticks = Array.from({ length: TOTAL_TICKS + 1 });

  const knobContent = (
    <div className="relative w-48 h-48 md:w-64 md:h-64 select-none">
      <motion.div
        className="absolute inset-0 bg-orange-500 rounded-full blur-3xl transition-opacity duration-75"
        style={{ opacity: lightOpacity }}
      />

      <div className="absolute inset-0 pointer-events-none">
        {ticks.map((_, i) => {
          const angle = (i / TOTAL_TICKS) * (MAX_DEG - MIN_DEG) + MIN_DEG;
          return (
            <div
              key={i}
              className="absolute top-0 left-1/2 w-1 h-full -translate-x-1/2"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <TickMark currentRotation={smoothRotation} angle={angle} />
            </div>
          );
        })}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-40 md:h-40">
        <motion.div
          ref={knobRef}
          className={cn(
            "relative w-full h-full rounded-full touch-none z-20",
            !isControlled && (isDragging ? "cursor-grabbing" : "cursor-grab")
          )}
          style={{ rotate: smoothRotation }}
          onPointerDown={handlePointerDown}
          whileHover={!isControlled ? { scale: 1.02 } : undefined}
          whileTap={!isControlled ? { scale: 0.98 } : undefined}
        >
          <div className="w-full h-full rounded-full bg-neutral-900 shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-neutral-800 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_50%),conic-gradient(from_0deg,transparent_0deg,#000_360deg)]" />

            <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-neutral-950 shadow-[inset_0_2px_5px_rgba(0,0,0,1)] border border-neutral-800/50 flex items-center justify-center">
              <motion.div
                className="absolute top-1.5 md:top-3 w-1 md:w-1.5 h-3 md:h-5 bg-orange-500 rounded-full"
                style={{ boxShadow: indicatorGlow }}
              />
              <div className="flex flex-col items-center mt-2 md:mt-4 opacity-50">
                <span className="font-mono text-[8px] md:text-[10px] text-neutral-500 tracking-widest">
                  LEVEL
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        <span className="text-[8px] md:text-[10px] text-neutral-600 font-mono tracking-[0.2em] mb-1">
          OUTPUT
        </span>
        <DisplayValue value={isControlled ? value! : displayValue} controlled={isControlled} />
      </div>
    </div>
  );

  if (!inline) {
    return (
      <div className="fixed inset-0 w-full h-full bg-neutral-950 flex flex-col items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
        <div className="relative z-10 scale-125 md:scale-150">{knobContent}</div>
      </div>
    );
  }

  return (
    <div className={cn("relative scale-90 md:scale-100", className)}>
      <div
        className="absolute -inset-4 opacity-10 pointer-events-none rounded-full"
        style={{
          backgroundImage:
            "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      {knobContent}
    </div>
  );
}

function TickMark({
  currentRotation,
  angle,
}: {
  currentRotation: MotionValue<number>;
  angle: number;
}) {
  const opacity = useTransform(currentRotation, (r: number) => (r >= angle ? 1 : 0.2));
  const color = useTransform(currentRotation, (r: number) =>
    r >= angle ? "#f97316" : "#404040"
  );
  const boxShadow = useTransform(currentRotation, (r: number) =>
    r >= angle ? "0 0 8px rgba(249, 115, 22, 0.6)" : "none"
  );

  return (
    <motion.div
      style={{ backgroundColor: color, opacity, boxShadow }}
      className="w-1 h-2.5 rounded-full transition-colors duration-75"
    />
  );
}

function DisplayValue({
  value,
  controlled,
}: {
  value: number | MotionValue<number>;
  controlled: boolean;
}) {
  const [display, setDisplay] = useState(0);

  if (controlled && typeof value === "number") {
    return (
      <div className="relative">
        <span className="absolute inset-0 blur-sm text-orange-500/50 font-mono text-2xl md:text-3xl font-black tabular-nums tracking-widest">
          {Math.round(value)
            .toString()
            .padStart(3, "0")}
        </span>
        <span className="relative font-mono text-2xl md:text-3xl text-orange-500 font-black tabular-nums tracking-widest">
          {Math.round(value)
            .toString()
            .padStart(3, "0")}
          <span className="text-xs md:text-sm text-neutral-600 ml-1">%</span>
        </span>
      </div>
    );
  }

  useMotionValueEvent(value as MotionValue<number>, "change", (latest) =>
    setDisplay(Math.round(latest))
  );

  return (
    <div className="relative">
      <span className="absolute inset-0 blur-sm text-orange-500/50 font-mono text-2xl md:text-3xl font-black tabular-nums tracking-widest">
        {display.toString().padStart(3, "0")}
      </span>
      <span className="relative font-mono text-2xl md:text-3xl text-orange-500 font-black tabular-nums tracking-widest">
        {display.toString().padStart(3, "0")}
        <span className="text-xs md:text-sm text-neutral-600 ml-1">%</span>
      </span>
    </div>
  );
}
