import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { fetchWeatherBundle } from "@/lib/weather";
import { DEFAULT_LOCATION } from "@/lib/weather-client";
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
  title: "ATMOS v5.0 — Sıfır-Sapma Hibrit Meteoroloji, 19-İlçe MGM & Radar",
  description:
    "ATMOS-Core v5.0: Bursa 19-ilçe MGM + 17.472 saatlik EMOS/GBDT + 10 NWP/AI model + 212 üyeli ensemble tahmin, Zoom-8 G/R kalibreli Doppler radar, 1000–300 hPa Skew-T sondaj ve dProg/dt koşu kilidi.",
  openGraph: {
    title: "ATMOS v5.0 — 10-Model + 212-Üye Hibrit Meteoroloji & Radar",
    description:
      "19-ilçe MGM & METAR doğrulamalı 10-model + 212-üye hibrit tahmin, Zoom-8 Doppler radar nowcast, Skew-T Log-P radyosonda ve dProg/dt anti-flip-flop kilidi.",
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
