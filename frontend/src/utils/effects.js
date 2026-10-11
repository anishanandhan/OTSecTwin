import { useState, useEffect, useRef } from "react";

// ━━ TEXT SCRAMBLE HOOK (LAYER 6 OPTION B) ━━
export function useScrambleText(originalText) {
  const [displayText, setDisplayText] = useState(originalText);
  const isScrambling = useRef(false);
  const chars = "!<>-_\\/[]{}—=+*^?#________";

  const triggerScramble = () => {
    if (isScrambling.current) return;
    isScrambling.current = true;
    let iteration = 0;
    const maxIterations = originalText.length;

    const interval = setInterval(() => {
      setDisplayText(
        originalText
          .split("")
          .map((letter, index) => {
            if (letter === " ") return " ";
            if (index < iteration) {
              return originalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(originalText);
        isScrambling.current = false;
      }

      iteration += 1 / 2;
    }, 35);
  };

  return { displayText, triggerScramble };
}

// ━━ CURRENTLY CYCLING TYPEWRITER HOOK (LAYER 6 OPTION C & LAYER 9) ━━
export function useCurrentlyCycle(items, intervalMs = 3500) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = items[currentIndex];
    let timer;

    if (!isDeleting) {
      if (text.length < fullText.length) {
        timer = setTimeout(() => {
          setText(fullText.substring(0, text.length + 1));
        }, 30);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, intervalMs);
      }
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => {
          setText(fullText.substring(0, text.length - 1));
        }, 15);
      } else {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, currentIndex, items, intervalMs]);

  return text;
}

// ━━ COUNT UP NUMBER HOOK (LAYER 6) ━━
export function useCountUp(targetNumber, durationMs = 1200, decimals = 1) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // easeOutQuad: 1 - (1 - progress) * (1 - progress)
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const currentVal = easeProgress * targetNumber;
      setCount(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(targetNumber);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetNumber, durationMs]);

  return count.toFixed(decimals);
}
