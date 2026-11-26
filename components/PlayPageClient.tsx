"use client";

import dynamic from "next/dynamic";

const CumulusGameView = dynamic(() => import("./CumulusGameView"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center font-mono text-xs tracking-widest text-ink-muted">
      CUMULUS MOTORU YÜKLENİYOR...
    </div>
  )
});

export default function PlayPageClient() {
  return <CumulusGameView />;
}
