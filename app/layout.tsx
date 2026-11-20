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
  title: "ATMOS — Sinematik 3D Hava Durumu & Meteoroloji Laboratuvarı",
  description:
    "Gerçek zamanlı 3D WebGL atmosfer sahnesi, interaktif 3D dünya küresi, çoklu şehir panosu ve canlı Skew-T Log-P / CAPE konvektif analiz laboratuvarı.",
  openGraph: {
    title: "ATMOS — Sinematik 3D Hava Durumu & Meteoroloji Laboratuvarı",
    description:
      "Canlı atmosfer verileri, 3D Dünya Küresi, 24s zaman kaydırıcısı ve CAPE/Skew-T meteoroloji laboratuvarı.",
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
  const initialBundle = await fetchWeatherBundle(DEFAULT_LOCATION);

  return (
    <html
      lang="tr"
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-night-950 text-neon-white antialiased">
        <WeatherProvider initialBundle={initialBundle}>
          <AppShell>{children}</AppShell>
        </WeatherProvider>
      </body>
    </html>
  );
}
