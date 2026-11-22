"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Activity,
  Cloud,
  CloudLightning,
  LayoutList,
  Radar,
  Volume2,
  VolumeX
} from "lucide-react";
import { useWeather } from "@/context/WeatherContext";
import CitySearch from "./CitySearch";
import AtmosphereAudio from "./AtmosphereAudio";

const StormScene = dynamic(() => import("./StormScene"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-obsidian-950" />
});

const NAV_TABS = [
  { href: "/", label: "Hava Durumu", icon: Cloud },
  { href: "/world", label: "Radar & Küre", icon: Radar },
  { href: "/dashboard", label: "İstasyonlar", icon: LayoutList },
  { href: "/lab", label: "Sondaj & Modeller", icon: Activity },
  { href: "/play", label: "Bulut Savaşı", icon: CloudLightning }
] as const;

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    activeLocation,
    setActiveLocation,
    unit,
    setUnit,
    audioEnabled,
    setAudioEnabled,
    searchOpen,
    setSearchOpen,
    atmosphere
  } = useWeather();

  const skipSkyBackdrop = pathname === "/world" || pathname === "/play";

  return (
    <div className="relative min-h-screen">
      {/* Gerçek fiziksel gökyüzü sahnesi */}
      {!skipSkyBackdrop ? (
        <StormScene atmosphere={atmosphere} />
      ) : (
        <div className="fixed inset-0 z-0 bg-[#05080f]" />
      )}

      {/* Opsiyonel ortam sesi (varsayılan kapalı) */}
      <AtmosphereAudio
        atmosphere={atmosphere}
        enabled={audioEnabled}
        volume={0.45}
        muffled={searchOpen}
      />

      {/* Minimalist Üst Bar */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.08] bg-[#06090f]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-base font-bold tracking-[0.12em] text-ink-primary"
            >
              <span>ATMOS</span>
            </Link>

            <nav aria-label="Ana sekmeler" className="hidden md:flex items-center gap-1">
              {NAV_TABS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-white/[0.10] text-ink-primary"
                        : "text-ink-secondary hover:bg-white/[0.04] hover:text-ink-primary"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 opacity-80" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden sm:block w-full max-w-xs lg:max-w-sm">
            <CitySearch
              onSelect={setActiveLocation}
              onOpenChange={setSearchOpen}
              placeholder={`${activeLocation.name} · Şehir ara...`}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setAudioEnabled(!audioEnabled)}
              aria-label={audioEnabled ? "Ortam sesini kapat" : "Ortam sesini aç"}
              title={audioEnabled ? "Ortam sesini kapat" : "Ortam sesini aç"}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                audioEnabled
                  ? "border-signal-sky/45 bg-signal-sky/15 text-signal-sky"
                  : "border-white/10 bg-white/[0.04] text-ink-secondary hover:text-ink-primary"
              }`}
            >
              {audioEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setUnit(unit === "metric" ? "imperial" : "metric")}
              aria-label="Sıcaklık birimini değiştir"
              className="flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3 font-mono text-xs font-medium text-ink-primary hover:bg-white/[0.08] transition-colors"
            >
              {unit === "metric" ? "°C" : "°F"}
            </button>
          </div>
        </div>

        {/* Mobil Arama */}
        <div className="px-4 pb-2.5 sm:hidden">
          <CitySearch
            onSelect={setActiveLocation}
            onOpenChange={setSearchOpen}
            placeholder={`${activeLocation.name} · Şehir ara...`}
          />
        </div>
      </header>

      {/* İçerik */}
      <main className="relative z-10 pb-24 pt-28 sm:pt-20 md:pb-14">
        {children}
      </main>

      {/* Mobil Alt Navigasyon */}
      <nav
        aria-label="Mobil sekmeler"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#06090f]/95 backdrop-blur-2xl md:hidden"
      >
        <div className="grid grid-cols-5 gap-1 px-2 py-1.5">
          {NAV_TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium transition-colors ${
                  active ? "bg-white/10 text-ink-primary" : "text-ink-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
