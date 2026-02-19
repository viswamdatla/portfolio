"use client";

import {
  type HTMLMotionProps,
  motion,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import React from "react";

interface SpringConfig {
  damping: number;
  stiffness: number;
}

interface WavyTextsConfig {
  baseOffsetFactor: number;
  baseExtra: number;
  baseAmplitude: number;
  lengthEffect: number;
  frequency: number;
  progressScale: number;
  phaseShiftDeg: number;
  spring: SpringConfig;
}

interface WavyBlockItemProps extends HTMLMotionProps<"div"> {
  index: number;
  config?: WavyTextsConfig;
}

interface WavyBlockContextValue {
  scrollYProgress: MotionValue<number>;
  maxLen: number;
}

const WavyBlockContext = React.createContext<WavyBlockContextValue | undefined>(undefined);

function useWavyBlockContext() {
  const context = React.useContext(WavyBlockContext);
  if (context === undefined) {
    throw new Error("useWavyBlockContext must be used within a WavyBlock");
  }
  return context;
}

const toRadian = (deg: number) => (deg * Math.PI) / 180;

export function WavyBlockItem({
  index,
  config = {
    baseOffsetFactor: 0.1,
    baseExtra: 0,
    baseAmplitude: 160,
    lengthEffect: 0.6,
    frequency: 35,
    progressScale: 6,
    phaseShiftDeg: -180,
    spring: { damping: 22, stiffness: 300 },
  },
  style,
  ...props
}: WavyBlockItemProps) {
  const { scrollYProgress, maxLen } = useWavyBlockContext();
  const reducedMotion = useReducedMotion();
  const lengthFactor = Math.min(1, Math.max(0, maxLen / (maxLen || 1)));

  const [isMounted, setIsMounted] = React.useState(false);

  const calculateX = React.useCallback(
    (p: number, windowWidth?: number) => {
      const phase = config.progressScale * p;

      const width =
        windowWidth ?? (typeof window !== "undefined" ? window.innerWidth : 1200);
      const baseOffset = config.baseOffsetFactor * width + config.baseExtra;

      const amplitudeScale = 1 - config.lengthEffect * lengthFactor;
      const amplitude = config.baseAmplitude * amplitudeScale;

      const angle =
        toRadian(config.frequency * index) + phase + toRadian(config.phaseShiftDeg);

      return baseOffset + amplitude * Math.cos(angle);
    },
    [config, lengthFactor, index]
  );

  const initialX = calculateX(0, 1200);
  const rawX = useMotionValue(initialX);
  const springX = useSpring(rawX, config.spring);
  const x = reducedMotion ? rawX : springX;

  React.useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!scrollYProgress || !isMounted) return;

    const unsub = scrollYProgress.on("change", (p) => {
      const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
      const newX = calculateX(p, windowWidth);
      rawX.set(newX);
    });

    return () => unsub();
  }, [scrollYProgress, rawX, calculateX, isMounted]);

  return <motion.div style={{ x, ...style }} suppressHydrationWarning {...props} />;
}

export function WavyBlock({
  offset = ["start end", "end start"],
  ...props
}: React.ComponentPropsWithRef<"div"> & { offset?: [string, string] }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [maxLen, setMaxLen] = React.useState(1);

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el?.children?.length) return;
    const childrenArray = Array.from(el.children);
    const len = Math.max(
      ...childrenArray.map((child) => (child?.textContent?.length ?? 0) || 0)
    );
    setMaxLen(len || 1);
  }, [props.children]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset,
  });

  return (
    <WavyBlockContext.Provider value={{ scrollYProgress, maxLen }}>
      <div ref={containerRef} {...props} />
    </WavyBlockContext.Provider>
  );
}
