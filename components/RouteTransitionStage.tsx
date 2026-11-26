"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { atmosUiSfx } from "@/lib/ui-sfx";

/**
 * Rota değişimlerinde üst barın tam alt sınırından (mobilde 98px, masaüstünde 53px)
 * akan atmosferik tarama ışını ve yumuşak irtifa-derinliği sayfa girişi.
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
      {/* Rota Değişim Tarama Işını (Mobil arama kutusuna binmemesi için duyarlı üst konum) */}
      <div
        key={`beam-${pathname}`}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-[98px] sm:top-[53px] z-[55] h-[2px] overflow-hidden"
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
