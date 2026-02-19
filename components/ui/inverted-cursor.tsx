"use client";

import React, { useState, useEffect, useRef } from "react";

interface CursorProps {
  size?: number;
}

export const Cursor: React.FC<CursorProps> = ({ size = 60 }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const previousPos = useRef({ x: -size, y: -size });
  const positionRef = useRef({ x: -size, y: -size });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setVisible(true);
      positionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    document.body.style.cursor = "none";

    const animate = () => {
      if (!cursorRef.current) {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }

      const currentX = previousPos.current.x;
      const currentY = previousPos.current.y;
      const targetX = positionRef.current.x - size / 2;
      const targetY = positionRef.current.y - size / 2;

      const deltaX = (targetX - currentX) * 0.2;
      const deltaY = (targetY - currentY) * 0.2;

      const newX = currentX + deltaX;
      const newY = currentY + deltaY;

      previousPos.current = { x: newX, y: newY };
      cursorRef.current.style.transform = `translate(${newX}px, ${newY}px)`;

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      document.body.style.cursor = "auto";
    };
  }, [size]);

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none rounded-full bg-white mix-blend-difference z-50 transition-opacity duration-300"
      style={{
        width: size,
        height: size,
        opacity: visible ? 1 : 0,
      }}
      aria-hidden="true"
    />
  );
};

export default Cursor;
