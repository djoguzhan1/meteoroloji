"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { atmosUiSfx } from "@/lib/ui-sfx";

/**
 * Rota değişimlerinde üst kenardan akan atmosferik tarama ışını (scan beam)
 * ve 340ms irtifa-derinliği (scale + blur + y) sayfa girişi.
 */
export default function RouteTransitionStage({
  children
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    atmosUiSfx.playNavTick();
  }, [pathname]);

  return (
    <>
      {/* Rota Değişim Tarama Işını */}
      <div
        key={`beam-${pathname}`}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-[53px] z-50 h-[2px] overflow-hidden"
      >
        <div
          className="atmos-scan-beam h-full w-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--atmos-accent), rgba(255,255,255,0.92), transparent)",
            boxShadow: "0 0 18px var(--atmos-accent)"
          }}
        />
      </div>

      {/* Derinlikli Sayfa Sahnesi */}
      <div key={pathname} className="atmos-route-enter">
        {children}
      </div>
    </>
  );
}
