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
  title: "ATMOS — Canlı Hava Durumu, Radar & Atmosferik Sondaj",
  description:
    "Gerçek zamanlı meteoroloji gözlemi, RainViewer canlı yağış radarı, ECMWF · GFS · ICON model karşılaştırması ve 1000–300 hPa Skew-T Log-P radyosonda analizi.",
  openGraph: {
    title: "ATMOS — Canlı Hava Durumu, Radar & Atmosferik Sondaj",
    description:
      "Canlı gözlem, küresel yağış radarı, ECMWF/GFS/ICON modelleri ve üst atmosfer radyosonda analizi.",
    type: "website",
    locale: "tr_TR"
  }
};

export const dynamic = "force-dynamic";

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
