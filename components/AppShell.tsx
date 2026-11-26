"use client";

import {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Activity,
  Cloud,
  CloudLightning,
  Command,
  LayoutList,
  Radar,
  VolumeX
} from "lucide-react";
import { useWeatherData, useWeatherScrub } from "@/context/WeatherContext";
import { atmosUiSfx } from "@/lib/ui-sfx";
import CitySearch from "./CitySearch";
import AtmosphereAudio from "./AtmosphereAudio";
import WeatherThemeSync from "./WeatherThemeSync";
import RouteTransitionStage from "./RouteTransitionStage";
import ForecastFreshnessBanner from "./ForecastFreshnessBanner";

const StormScene = dynamic(() => import("./StormScene"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-obsidian-950" />
});

const CommandPalette = dynamic(() => import("./CommandPalette"), {
  ssr: false
});

const NAV_TABS = [
  { href: "/", label: "Hava", icon: Cloud },
  { href: "/world", label: "Radar", icon: Radar },
  { href: "/dashboard", label: "İstasyonlar", icon: LayoutList },
  { href: "/lab", label: "Modeller", icon: Activity },
  { href: "/play", label: "Bulut Savaşı", icon: CloudLightning }
] as const;

/** İzole marka amblemi: yalnızca kendisi rüzgar hızını dinler; AppShell yeniden çizilmez! */
const AtmosBrandMark = memo(function AtmosBrandMark() {
  const { atmosphere } = useWeatherScrub();
  const durSec = Math.max(5.5, Math.min(20, 22 - atmosphere.windSpeed * 0.25));
  return (
    <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
      <svg
        viewBox="0 0 28 28"
        className="h-6 w-6"
        style={{ animation: `atmosIsobarSpin ${durSec.toFixed(1)}s linear infinite` }}
        aria-hidden="true"
      >
        <circle
          cx="14"
          cy="14"
          r="11"
          fill="none"
          stroke="rgba(var(--atmos-rim-rgb), 0.28)"
          strokeWidth="1.2"
          strokeDasharray="16 9"
        />
        <path
          d="M 14 4.5 A 9.5 9.5 0 0 1 23.2 11.8"
          fill="none"
          stroke="var(--atmos-accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 14 23.5 A 9.5 9.5 0 0 1 4.8 16.2"
          fill="none"
          stroke="rgba(var(--atmos-rim-rgb), 0.72)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute h-2 w-2 rounded-full"
        style={{
          backgroundColor: "var(--atmos-accent)",
          boxShadow: "0 0 10px var(--atmos-accent)"
        }}
      />
    </span>
  );
});

/** İzole arka plan sahne & ses köprüsü: zaman kaydırıcısı hareket ettiğinde üst menü ve sayfa kabuğu 0 kez render olur! */
const AtmosSkyAndAudioStage = memo(function AtmosSkyAndAudioStage({
  skipSkyBackdrop,
  audioEnabled,
  muffled
}: {
  skipSkyBackdrop: boolean;
  audioEnabled: boolean;
  muffled: boolean;
}) {
  const { atmosphere } = useWeatherScrub();
  return (
    <>
      {!skipSkyBackdrop ? (
        <StormScene atmosphere={atmosphere} />
      ) : (
        <div className="fixed inset-0 z-0 bg-[#05080f]" />
      )}
      <AtmosphereAudio
        atmosphere={atmosphere}
        enabled={audioEnabled}
        volume={0.45}
        muffled={muffled}
      />
    </>
  );
});

function LiveAudioEq() {
  return (
    <span className="flex h-4 items-end gap-[2.5px]" aria-hidden="true">
      <span className="atmos-eq-1 h-3.5 w-[2.5px] origin-bottom rounded-full bg-[var(--atmos-accent)]" />
      <span className="atmos-eq-2 h-4 w-[2.5px] origin-bottom rounded-full bg-[var(--atmos-accent)]" />
      <span className="atmos-eq-3 h-3 w-[2.5px] origin-bottom rounded-full bg-[var(--atmos-accent)]" />
      <span className="atmos-eq-4 h-3.5 w-[2.5px] origin-bottom rounded-full bg-[var(--atmos-accent)]" />
    </span>
  );
}

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
    setSearchOpen
  } = useWeatherData();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteMounted, setPaletteMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const openPalette = useCallback(() => {
    setPaletteMounted(true);
    setPaletteOpen(true);
  }, []);

  const navContainerRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [pill, setPill] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false
  });

  const measureActivePill = useCallback(() => {
    const container = navContainerRef.current;
    const activeEl = tabRefs.current[pathname];
    if (!container || !activeEl) return;
    const cRect = container.getBoundingClientRect();
    const aRect = activeEl.getBoundingClientRect();
    setPill({
      left: aRect.left - cRect.left,
      width: aRect.width,
      ready: aRect.width > 0
    });
  }, [pathname]);

  useLayoutEffect(() => {
    const raf = window.requestAnimationFrame(() => measureActivePill());
    return () => window.cancelAnimationFrame(raf);
  }, [measureActivePill]);

  useEffect(() => {
    const onResize = () => measureActivePill();
    window.addEventListener("resize", onResize, { passive: true });
    const navEl = navContainerRef.current;
    const ro = navEl ? new ResizeObserver(() => measureActivePill()) : null;
    if (navEl && ro) ro.observe(navEl);
    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => measureActivePill());
    }
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, [measureActivePill]);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 18;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteMounted(true);
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const skipSkyBackdrop = pathname === "/world" || pathname === "/play";
  const activeMobileIdx = Math.max(
    0,
    NAV_TABS.findIndex((t) => t.href === pathname)
  );

  return (
    <div className="relative min-h-screen">
      {/* Canlı Hava Durumu Renk DNA'sı + Sıfır-Reflow İmleç Takipçisi */}
      <WeatherThemeSync />

      {/* İzole 3D Gökyüzü + Ortam Sesi Katmanı */}
      <AtmosSkyAndAudioStage
        skipSkyBackdrop={skipSkyBackdrop}
        audioEnabled={audioEnabled}
        muffled={searchOpen || paletteOpen}
      />

      {/* İzole GPU Şimşek Yansıma Katmanı (0 DOM Recalculate Style!) */}
      <div
        id="atmos-lightning-flash"
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="pointer-events-none fixed inset-0 z-[1] bg-sky-200 will-change-[opacity]"
      />

      {/* Sıfır-Filtreli (mix-blend-overlay olmayan) Mikro Optik Doku */}
      <div
        aria-hidden="true"
        className="atmos-grain pointer-events-none fixed inset-0 z-[2] opacity-40"
      />

      {/* Uzaysal Komut Merkezi (yalnızca ilk açılışta tembel yüklenir) */}
      {paletteMounted && (
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      )}

      {/* Yüzen Optik Cam Üst Bar */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/[0.14] bg-[#050912]/94 shadow-[0_14px_44px_rgba(0,0,0,0.62)] backdrop-blur-2xl"
            : "border-b border-white/[0.09] bg-[#060a14]/86 backdrop-blur-xl"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-70"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, rgba(var(--atmos-accent-rgb), 0.45) 50%, transparent 95%)"
          }}
        />

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-2 font-display text-base font-bold tracking-[0.14em] text-ink-primary"
            >
              <AtmosBrandMark />
              <span className="transition-colors group-hover:text-white">ATMOS</span>
            </Link>

            <nav
              ref={navContainerRef}
              aria-label="Ana sekmeler"
              className="relative hidden lg:flex items-center gap-0.5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-0.5"
            >
              {pill.ready && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0.5 top-0.5 rounded-[10px] border border-[rgba(var(--atmos-rim-rgb),0.28)] bg-white/[0.095] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_20px_-6px_rgba(var(--atmos-accent-rgb),0.55)]"
                  style={{
                    transform: `translate3d(${pill.left}px, 0, 0)`,
                    width: `${pill.width}px`,
                    transition:
                      "transform 340ms cubic-bezier(0.34, 1.38, 0.64, 1), width 340ms cubic-bezier(0.34, 1.38, 0.64, 1)"
                  }}
                >
                  <span
                    className="absolute bottom-0 left-3 right-3 h-[1.5px] rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, var(--atmos-accent), transparent)"
                    }}
                  />
                </span>
              )}

              {NAV_TABS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    ref={(el) => {
                      tabRefs.current[href] = el;
                    }}
                    className={`relative z-10 flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[10px] px-2.5 py-1.5 text-xs xl:px-3 xl:text-[13px] font-medium transition-colors duration-200 ${
                      active
                        ? "text-white"
                        : "text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                        active ? "text-[var(--atmos-accent)] scale-105" : "opacity-75"
                      }`}
                    />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden sm:flex shrink-0 items-center gap-1.5">
            <div className="w-52 xl:w-64">
              <CitySearch
                onSelect={setActiveLocation}
                onOpenChange={setSearchOpen}
                placeholder={`${activeLocation.name} · Şehir ara...`}
              />
            </div>
            <button
              type="button"
              onClick={openPalette}
              title="Komut Merkezini Aç (Ctrl+K)"
              aria-label="Komut Merkezini Aç"
              className="atmos-btn hidden md:flex h-9 items-center gap-1 rounded-xl border border-white/12 bg-[#070d19]/75 px-2.5 font-mono text-[11px] text-slate-300 hover:text-white"
            >
              <Command className="h-3 w-3" />
              <span>K</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setAudioEnabled(!audioEnabled)}
              aria-label={audioEnabled ? "Ortam sesini kapat" : "Ortam sesini aç"}
              title={
                audioEnabled
                  ? "Atmosfer & kokpit sesini kapat"
                  : "Atmosfer & kokpit sesini aç"
              }
              className={`atmos-btn flex h-9 w-9 items-center justify-center rounded-xl border ${
                audioEnabled
                  ? "border-[rgba(var(--atmos-accent-rgb),0.5)] bg-[rgba(var(--atmos-accent-rgb),0.16)] text-[var(--atmos-accent)]"
                  : "border-white/12 bg-[#070d19]/75 text-slate-300 hover:text-white"
              }`}
            >
              {audioEnabled ? <LiveAudioEq /> : <VolumeX className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                atmosUiSfx.playNavTick();
                setUnit(unit === "metric" ? "imperial" : "metric");
              }}
              aria-label="Sıcaklık birimini değiştir"
              title="Birim değiştir (°C / °F)"
              className="atmos-btn relative flex h-9 w-10 items-center justify-center rounded-xl border border-white/12 bg-[#070d19]/75 font-mono text-xs font-semibold text-ink-primary"
            >
              <span className="block h-[18px] overflow-hidden">
                <span
                  className="flex flex-col items-center transition-transform duration-300"
                  style={{
                    transform:
                      unit === "metric" ? "translateY(0px)" : "translateY(-18px)"
                  }}
                >
                  <span className="block h-[18px] leading-[18px]">°C</span>
                  <span className="block h-[18px] leading-[18px]">°F</span>
                </span>
              </span>
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

      {/* İrtifa-Kayması Sayfa Geçiş Sahnesi (Mobil çift satırlı üst bar ve alt bar için çakışmasız boşluk) */}
      <main className="relative z-10 pb-28 pt-[110px] sm:pt-[74px] lg:pb-16">
        <ForecastFreshnessBanner />
        <RouteTransitionStage>{children}</RouteTransitionStage>
      </main>

      {/* Mobil & Tablet Yaylı Alt Navigasyon (< 1024px) */}
      <nav
        aria-label="Mobil sekmeler"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.12] bg-[#050912]/95 shadow-[0_-10px_32px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:hidden"
      >
        <div className="pb-safe-nav relative grid grid-cols-5 gap-1 px-1.5 pt-1.5">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 h-[2px] w-1/5 px-4 transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${activeMobileIdx * 100}%, 0, 0)`
            }}
          >
            <span
              className="block h-full w-full rounded-full"
              style={{
                backgroundColor: "var(--atmos-accent)",
                boxShadow: "0 0 12px var(--atmos-accent)"
              }}
            />
          </span>

          {NAV_TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-[46px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] sm:text-xs font-medium leading-none transition-all ${
                  active
                    ? "bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                    : "text-ink-muted hover:text-ink-secondary"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    active ? "text-[var(--atmos-accent)] scale-110" : ""
                  }`}
                />
                <span className="max-w-full truncate tracking-tight">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
