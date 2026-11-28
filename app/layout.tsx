import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { ATMOS_LOCATION_COOKIE } from "@/lib/location-url";
import { resolveInitialServerLocation } from "@/lib/geocode-server";
import {
  resolveProvinceCode,
  TR_PROVINCE_NAMES_BY_CODE
} from "@/lib/provinces/geo-adm1-resolver";
import { isTrProvinceCode, type TrProvinceCode } from "@/lib/provinces/types";
import { fetchWeatherBundle } from "@/lib/weather";
import type { GeoLocation } from "@/lib/weather-types";
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

const BURSA_FROZEN_METADATA: Metadata = {
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

async function readActiveRequestContext(): Promise<{
  searchStr: string | null;
  cookieVal: string | null;
}> {
  try {
    const hdrs = await headers();
    const ck = await cookies();
    return {
      searchStr: hdrs.get("x-atmos-search"),
      cookieVal: ck.get(ATMOS_LOCATION_COOKIE)?.value ?? null
    };
  } catch {
    return { searchStr: null, cookieVal: null };
  }
}

function buildMetadataForLocation(location: GeoLocation): Metadata {
  const resolvedCode =
    location.provinceCode ??
    resolveProvinceCode({
      lat: location.lat,
      lon: location.lon,
      admin1: location.admin1,
      countryCode: location.countryCode
    }).provinceCode;

  if (resolvedCode === "TR-16") {
    return BURSA_FROZEN_METADATA;
  }

  if (isTrProvinceCode(resolvedCode)) {
    const provinceName =
      TR_PROVINCE_NAMES_BY_CODE[resolvedCode as TrProvinceCode] ?? "Türkiye";
    const cityLabel = location.name?.trim() || provinceName;
    const isSameAsProvince =
      cityLabel.toLocaleLowerCase("tr-TR") ===
      provinceName.toLocaleLowerCase("tr-TR");
    const parentLabel = isSameAsProvince ? "Türkiye" : provinceName;
    const title = `ATMOS v5.0 — ${cityLabel} (${parentLabel}) Hibrit Meteoroloji, MGM & Radar`;
    const description = `ATMOS-Core v5.0: ${cityLabel} (${parentLabel}) MGM & METAR doğrulamalı 10 NWP/AI model + 212 üyeli ensemble tahmin, Zoom-8 G/R kalibreli Doppler radar, 1000–300 hPa Skew-T sondaj ve dProg/dt koşu kilidi.`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        locale: "tr_TR"
      }
    };
  }

  const cityLabel = location.name?.trim() || "Küresel İstasyon";
  const countryLabel =
    location.country?.trim() || location.countryCode?.trim() || "Küresel";
  const title = `ATMOS v5.0 — ${cityLabel} (${countryLabel}) Hibrit Meteoroloji, MGM & Radar`;
  const description = `ATMOS-Core v5.0: ${cityLabel} (${countryLabel}) METAR doğrulamalı 10 NWP/AI model + 212 üyeli ensemble tahmin, Zoom-8 Doppler radar nowcast, 1000–300 hPa Skew-T sondaj ve dProg/dt koşu kilidi.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "tr_TR"
    }
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { searchStr, cookieVal } = await readActiveRequestContext();
  const { location } = await resolveInitialServerLocation({
    searchStr,
    cookieVal
  });
  return buildMetadataForLocation(location);
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { searchStr, cookieVal } = await readActiveRequestContext();

  const { location: initialLocation } = await resolveInitialServerLocation({
    searchStr,
    cookieVal
  });

  let initialBundle = null;
  let initialError: string | null = null;
  try {
    initialBundle = await fetchWeatherBundle(initialLocation);
  } catch {
    initialError = "Meteoroloji veri servisine şu an ulaşılamıyor.";
  }

  return (
    <html
      lang="tr"
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-obsidian-950 text-ink-primary antialiased">
        <WeatherProvider
          initialBundle={initialBundle}
          initialLocation={initialLocation}
          initialError={initialError}
        >
          <AppShell>{children}</AppShell>
        </WeatherProvider>
      </body>
    </html>
  );
}
