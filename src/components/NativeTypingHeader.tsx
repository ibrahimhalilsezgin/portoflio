'use client';
import { useState, useEffect } from 'react';

interface NativeTypingHeaderProps {
  lines?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export default function NativeTypingHeader({
  lines = [
    'Hi 👋, welcome to my profile!',
    'I am a Full-Stack Developer',
    'Building modern web and SaaS apps'
  ],
  typingSpeed = 70,
  deletingSpeed = 40,
  pauseDuration = 2000,
}: NativeTypingHeaderProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (lines.length === 0) return;

    const currentLine = lines[textIndex];

    if (isDeleting) {
      if (subIndex === 0) {
        // Schedule state updates in the next tick
        setTimeout(() => {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % lines.length);
        }, 0);
        return;
      }

      const timeout = setTimeout(() => {
        setSubIndex((prev) => prev - 1);
      }, deletingSpeed);

      return () => clearTimeout(timeout);
    } else {
      if (subIndex === currentLine.length) {
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);

        return () => clearTimeout(timeout);
      }

      const timeout = setTimeout(() => {
        setSubIndex((prev) => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timeout);
    }
  }, [subIndex, isDeleting, textIndex, lines, typingSpeed, deletingSpeed, pauseDuration]);

  const currentText = lines[textIndex]?.substring(0, subIndex) || '';

  return (
    <div className="flex items-center min-h-[32px] max-w-full overflow-hidden">
      <span className="mono text-sm sm:text-base md:text-lg text-brand font-medium tracking-wide break-words">
        {currentText}
      </span>
      <span className="w-[2px] h-5 bg-brand ml-1 animate-pulse" aria-hidden="true" />
    </div>
  );
}
