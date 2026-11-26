"use client";

import { memo } from "react";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function DigitReel({ digit }: { digit: number }) {
  return (
    <span
      className="relative inline-block h-[1.08em] w-[0.62em] overflow-hidden align-baseline"
      aria-hidden="true"
    >
      <span
        className="flex flex-col items-center leading-[1.08em] will-change-transform motion-reduce:transition-none"
        style={{
          transform: `translate3d(0, -${digit * 10}%, 0)`,
          transition: "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)"
        }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="block h-[1.08em] leading-[1.08em]">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * İsviçre Mekanik Odometre Rakam Gösterici
 * Her rakam kendi dikey makarasında GPU transform ile yaylı kayar;
 * ekran okuyucular için tam metni erişilebilir (sr-only) sunar.
 */
function AnimatedNumberBase({
  value,
  className = ""
}: {
  value: string | number;
  className?: string;
}) {
  const str = String(value);
  const chars = str.split("");

  return (
    <span className={`inline-flex items-baseline tabular ${className}`}>
      <span className="sr-only">{str}</span>
      {chars.map((ch, idx) => {
        const code = ch.charCodeAt(0);
        const isDigit = code >= 48 && code <= 57;
        // Sağdan indeksleme sayesinde 9 -> 10 geçişinde birler basamağı makarasını korur
        const key = `${chars.length - idx}-${isDigit ? "d" : ch}`;
        if (isDigit) {
          return <DigitReel key={key} digit={code - 48} />;
        }
        return (
          <span key={key} aria-hidden="true" className="inline-block">
            {ch === " " ? "\u00A0" : ch}
          </span>
        );
      })}
    </span>
  );
}

const AnimatedNumber = memo(AnimatedNumberBase);
export default AnimatedNumber;
