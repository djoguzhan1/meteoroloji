"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Activity,
  CloudLightning,
  Globe,
  LayoutGrid,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  X
} from "lucide-react";
import { SCENARIO_META, useWeather } from "@/context/WeatherContext";
import type { PerformanceMode, ScenarioKey } from "@/lib/weather-types";
import CitySearch from "./CitySearch";
import AtmosphereAudio from "./AtmosphereAudio";

const StormScene = dynamic(() => import("./StormScene"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-night-950" />
});

const NAV_TABS = [
  { href: "/", label: "Sahne", icon: CloudLightning },
  { href: "/world", label: "3D Küre", icon: Globe },
  { href: "/dashboard", label: "Panom", icon: LayoutGrid },
  { href: "/lab", label: "CAPE Lab", icon: Activity }
] as const;

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    activeLocation,
    setActiveLocation,
    unit,
    setUnit,
    scenario,
    setScenario,
    audioEnabled,
    setAudioEnabled,
    audioVolume,
    setAudioVolume,
    controlOpen,
    setControlOpen,
    searchOpen,
    setSearchOpen,
    performanceMode,
    setPerformanceMode,
    atmosphere,
    loading
  } = useWeather();

  const isWorldRoute = pathname === "/world";

  return (
    <div className="relative min-h-screen">
      {/* Kalıcı 3D Atmosfer Arka Planı (3D Küre sayfasında kendi WebGL Canvas'ı olduğu için sadece hafif arka fon) */}
      {!isWorldRoute ? (
        <StormScene
          atmosphere={atmosphere}
          performanceMode={performanceMode}
        />
      ) : (
        <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_#0f1b3d_0%,_#040714_65%,_#02040b_100%)]" />
      )}

      {/* Yumuşak sinematik renk katmanı */}
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_50%),radial-gradient(circle_at_bottom_right,_rgba(255,138,60,0.12),_transparent_52%)]" />

      {/* Prosedürel Web Audio motoru */}
      <AtmosphereAudio
        atmosphere={atmosphere}
        enabled={audioEnabled}
        volume={audioVolume}
        muffled={controlOpen || searchOpen}
      />

      {/* Sabit Üst Navigasyon */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-night-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Sol: Marka & 4 Ana Sekme */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-neon-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan/30 to-neon-orange/35 border border-white/20">
                <CloudLightning className="h-4 w-4 text-neon-orange" />
              </span>
              <span>ATMOS</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  loading
                    ? "animate-pulse bg-neon-cyan"
                    : scenario === "live"
                      ? "bg-emerald-400"
                      : "bg-neon-orange"
                }`}
                title={scenario === "live" ? "Canlı veri aktif" : "Simülasyon aktif"}
              />
            </Link>

            <nav aria-label="Ana sekmeler" className="hidden md:flex items-center gap-1">
              {NAV_TABS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-white/15 text-neon-white shadow-inner"
                        : "text-neon-white/70 hover:bg-white/5 hover:text-neon-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-neon-orange" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Orta: Şehir Arama */}
          <div className="hidden sm:block w-full max-w-xs lg:max-w-sm">
            <CitySearch
              compact
              onSelect={setActiveLocation}
              onOpenChange={setSearchOpen}
              placeholder={`${activeLocation.name} · Şehir ara...`}
            />
          </div>

          {/* Sağ: Ses, Birim ve Kontrol Merkezi */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAudioEnabled(!audioEnabled)}
              aria-label={audioEnabled ? "Atmosfer sesini kapat" : "Atmosfer sesini aç"}
              title={audioEnabled ? "Sesi kapat" : "Atmosfer sesini aç"}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm transition-colors ${
                audioEnabled
                  ? "border-neon-cyan/50 bg-neon-cyan/15 text-neon-cyan"
                  : "border-white/15 bg-white/5 text-neon-white/70 hover:text-neon-white"
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
              className="flex h-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 font-mono text-xs font-semibold text-neon-white/85 hover:bg-white/10 transition-colors"
            >
              {unit === "metric" ? "°C" : "°F"}
            </button>

            <button
              type="button"
              onClick={() => setControlOpen(!controlOpen)}
              aria-label="Atmosfer kontrol merkezi"
              className={`flex h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-medium transition-colors ${
                controlOpen
                  ? "border-neon-orange/60 bg-neon-orange/20 text-neon-white"
                  : "border-white/15 bg-white/5 text-neon-white/85 hover:bg-white/10"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4 text-neon-orange" />
              <span className="hidden lg:inline">Kontrol</span>
            </button>
          </div>
        </div>

        {/* Mobil Şehir Arama Şeridi */}
        <div className="px-4 pb-2.5 sm:hidden">
          <CitySearch
            compact
            onSelect={setActiveLocation}
            onOpenChange={setSearchOpen}
            placeholder={`${activeLocation.name} · Şehir ara...`}
          />
        </div>
      </header>

      {/* Sağ Üst Kontrol Merkezi Çekmecesi */}
      {controlOpen && (
        <aside
          aria-label="Atmosfer Kontrol Merkezi"
          className="fixed right-4 top-20 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-3xl border border-white/15 bg-night-900/92 p-5 shadow-glass backdrop-blur-2xl space-y-5 sm:right-6"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-sm font-semibold text-neon-white">
                Atmosfer Kontrol Merkezi
              </h2>
              <p className="text-xs text-neon-orange">
                {audioEnabled
                  ? "Low-Pass Filtre Aktif (620 Hz)"
                  : "Anlık 3D sahne ve ses ayarları"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setControlOpen(false)}
              aria-label="Kontrol merkezini kapat"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-neon-white/75 hover:bg-white/10 hover:text-neon-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 6 Sahne Simülasyonu */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-neon-white/65">Sahne Modu</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(SCENARIO_META) as ScenarioKey[]).map((key) => {
                const active = scenario === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setScenario(key)}
                    className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors ${
                      active
                        ? "border-neon-orange/70 bg-neon-orange/20 text-neon-white"
                        : "border-white/10 bg-white/5 text-neon-white/75 hover:bg-white/10 hover:text-neon-white"
                    }`}
                  >
                    {SCENARIO_META[key].label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-neon-white/55">
              {SCENARIO_META[scenario].shortDesc}
            </p>
          </div>

          {/* Ses Seviyesi */}
          <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-neon-white/75">
                Mekansal Atmosfer Sesi
              </span>
              <button
                type="button"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="font-mono text-xs text-neon-cyan hover:underline"
              >
                {audioEnabled ? "Açık" : "Kapalı"}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audioVolume}
              onChange={(e) => {
                setAudioVolume(Number(e.target.value));
                if (!audioEnabled) setAudioEnabled(true);
              }}
              aria-label="Atmosfer ses düzeyi"
              className="atmos-range w-full"
            />
          </div>

          {/* Performans Modu */}
          <div className="space-y-2 border-t border-white/10 pt-4">
            <p className="text-xs font-medium text-neon-white/65">3D Performans</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["auto", "Otomatik"],
                  ["high", "Yüksek 3D"],
                  ["low", "Düşük Güç"]
                ] as Array<[PerformanceMode, string]>
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPerformanceMode(mode)}
                  className={`rounded-xl border px-2 py-2 text-xs font-medium transition-colors ${
                    performanceMode === mode
                      ? "border-neon-cyan/60 bg-neon-cyan/15 text-neon-cyan"
                      : "border-white/10 bg-white/5 text-neon-white/70 hover:text-neon-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Sayfa İçeriği */}
      <main className="relative z-10 pb-24 pt-28 sm:pt-20 md:pb-12">
        {children}
      </main>

      {/* Mobil Alt Navigasyon */}
      <nav
        aria-label="Mobil sekmeler"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-night-950/90 backdrop-blur-xl md:hidden"
      >
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {NAV_TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium transition-colors ${
                  active
                    ? "bg-white/12 text-neon-orange"
                    : "text-neon-white/65 hover:text-neon-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
