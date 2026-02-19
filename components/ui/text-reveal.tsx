"use client";

import { FC, ReactNode, useRef } from "react";
import { motion, type MotionValue, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextRevealByWordProps {
  text: string;
  className?: string;
  /** When provided, reveal is driven by this 0-1 progress (e.g. meter) instead of scroll */
  progress?: MotionValue<number>;
  /** Optional wrapper class for the sticky inner block */
  innerClassName?: string;
  /** Optional class for the paragraph */
  paragraphClassName?: string;
}

const TextRevealByWord: FC<TextRevealByWordProps> = ({
  text,
  className,
  progress: controlledProgress,
  innerClassName,
  paragraphClassName,
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const scrollProgress = useScroll({
    target: targetRef,
  }).scrollYProgress;

  const progress = controlledProgress ?? scrollProgress;
  const words = text.split(" ");

  const content = (
    <p
      className={cn(
        "flex flex-wrap p-0 text-2xl font-bold text-foreground/20 md:text-3xl lg:text-4xl xl:text-5xl",
        paragraphClassName
      )}
    >
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} progress={progress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );

  if (controlledProgress !== undefined) {
    return (
      <div ref={targetRef} className={cn("relative z-0", className)}>
        <div
          className={cn(
            "flex max-w-xl items-center bg-transparent",
            innerClassName
          )}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div ref={targetRef} className={cn("relative z-0 h-[200vh]", className)}>
      <div
        className={cn(
          "sticky top-0 mx-auto flex h-[50%] max-w-4xl items-center bg-transparent px-[1rem] py-[5rem]",
          innerClassName
        )}
      >
        {content}
      </div>
    </div>
  );
};

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative mx-1 lg:mx-2.5">
      <span className="absolute opacity-30" aria-hidden>
        {children}
      </span>
      <motion.span style={{ opacity }} className="text-foreground">
        {children}
      </motion.span>
    </span>
  );
};

export { TextRevealByWord };
