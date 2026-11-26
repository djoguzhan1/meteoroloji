import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { DEFAULT_LOCATION, fetchWeatherBundle } from "@/lib/weather";
import { WeatherProvider } from "@/context/WeatherContext";
import AppShell from "@/components/AppShell";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "ATMOS — Canlı Meteoroloji, 7-Model Hibrit v3, Radar & Bulut Savaşı",
  description:
    "ATMOS-Core v3.0: Gerçek zamanlı çoklu ICAO METAR Kalman/MOS doğrulamalı 7 Tier-1 model + 122 ensemble tahmin, canlı Doppler radar & 3D küre, 1000–300 hPa Skew-T sondaj ve CUMULUS Bulut Savaşı.",
  openGraph: {
    title: "ATMOS — Canlı Meteoroloji, 7-Model Hibrit v3 & Radar",
    description:
      "Gerçek zamanlı çoklu METAR doğrulamalı 7-model + 122 ensemble hibrit tahmin, canlı Doppler radar + rüzgar akımı, Skew-T Log-P radyosonda ve CUMULUS Bulut Savaşı.",
    type: "website",
    locale: "tr_TR"
  }
};

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  let initialBundle = null;
  let initialError: string | null = null;
  try {
    initialBundle = await fetchWeatherBundle(DEFAULT_LOCATION);
  } catch {
    initialError = "Meteoroloji veri servisine şu an ulaşılamıyor.";
  }

  return (
    <html
      lang="tr"
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-obsidian-950 text-ink-primary antialiased">
        <WeatherProvider initialBundle={initialBundle} initialError={initialError}>
          <AppShell>{children}</AppShell>
        </WeatherProvider>
      </body>
    </html>
  );
}
