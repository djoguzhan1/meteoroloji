import type { Metadata } from "next";
import CumulusGameView from "@/components/CumulusGameView";

export const metadata: Metadata = {
  title: "CUMULUS · Bulut Savaşı | ATMOS",
  description:
    "Buluttan buluta bulutçuk fırlat, kendi bulutlarını besleyip Kümülonimbus ve Süper Hücre'ye evrimleştir, canlı rüzgarla gökyüzünü fethet."
};

export default function PlayPage() {
  return <CumulusGameView />;
}
