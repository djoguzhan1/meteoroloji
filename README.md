# ATMOS v5.0 — Sıfır-Sapma Hibrit Meteoroloji, 19-İlçe MGM Ağı & Doppler Radar

**ATMOS v5.0**, Bursa (WMO `17116` ve 19 ilçe mikroklima ağı) öncelikli olmak üzere küresel istasyonlar için tasarlanmış, 8 ana NWP/AI model ailesini ve 212 üyeli olasılıksal ensemble havuzunu canlı yer gözlemleriyle kalibre eden hibrit meteoroloji platformudur.

## Mimari Bileşenler

1. **Kanonik 8-Model + 212-Üye Ensemble Çekirdeği (`lib/model-registry.ts`, `lib/weather.ts`)**
   - Deterministik NWP & AI: **ECMWF IFS HRES (9 km)**, **ECMWF AIFS v1 (`ecmwf_aifs025_single`)**, **DWD ICON-EU/D2**, **UKMO Unified**, **Météo-France AROME/ARPEGE**, **NOAA GFS**, **ECCC GEM** ve **JMA GSM**.
   - 212 Üyeli Olasılıksal Havuz: ECMWF IFS-ENS (51) + ECMWF AIFS-ENS (51) + DWD ICON-EPS (40) + NOAA GEFS (31) + ECCC GEPS (21) + UKMO MOGREPS-G (18).
2. **Bursa 19-İlçe MGM Mikroklima Ağı & 17.472 Saatlik L1-EMOS + GBDT (`lib/bursa-mesh.ts`, `lib/bursa-trained-emos.ts`, `lib/topographic-cressman.ts`)**
   - WMO `17116` (Osmangazi Merkez, 100 m) 2 yıllık (17.472 saat) gerçek gözlem arşivi üzerinde 5-katlı 168s-arındırılmış çapraz doğrulamayla eğitilmiş ölçek-değişmez kalıntı L1-EMOS ve GBDT yağış sınıflandırıcısı.
   - 3-katmanlı parçalı hidrostatik dikey lapse-rate (0–550 m ova tabanı, 550–1.300 m orta yamaç, 1.300–2.000 m Uludağ zirve) ve LTBR Yenişehir soğuk havza izolasyonu.
   - Gün 4–7 cephe çatallanmalarında Ashman D / Otsu iki-modlu küme çözücüsü.
3. **Zoom-8 Yarı-Lagranj Doppler Radar Nowcast (`lib/radar-nowcast.ts`)**
   - Saf TypeScript PNG dBZ çözücü, çok-karolu Zoom-8 (~466 m/piksel) birleştirme, parabolik optik akış, d(dBZ)/dt büyüme/sönümleme ve canlı MGM 10-dakikalık plüvyometre G/R (Fulton-Brandes) kalibrasyonu.
4. **Kalibre-Kalibre `dProg/dt` Koşu Tutarlılığı & Kalıcı Durum Defteri (`lib/run-consistency.ts`, `lib/state-ledger.ts`)**
   - 96 saatlik istasyon geçmişini ve son 6 sinoptik döngünün (`R0..R-3`) kalibre tahminlerini saklayarak kanıtsız tekil koşu savrulmalarını sönümler.
5. **1000 → 300 hPa Skew-T Log-P Radyosonda & Fırtına Tehdit Motoru (`lib/thermo-cape.ts`, `lib/storm-engine.ts`)**
   - Bolton (1980) MUCAPE / SBCAPE / MLCAPE, Bunkers 0–3 km SRH, Süper Hücre SCP, DCAPE ve Stull (2011) ıslak termometre faz ayrımı (`rain`, `freezing_rain`, `sleet`, `snow`, `hail`).
6. **Net İstemci / Sunucu Ayrımı (`lib/weather-client.ts` vs `lib/weather.ts`)**
   - Tüm birim dönüştürme, sinoptik sinyal, astronomi ve `localStorage` (`atmos:v5:*`) yardımcıları saf `lib/weather-client.ts` modülünde izole edilmiştir; sunucu NWP ve EMOS ağaçları istemci paketine sızmaz.

## Kurulum ve Çalıştırma

```bash
cp .env.example .env.local
npm install
npm run dev
```

Tarayıcıda `http://localhost:3006` adresini açın. Herhangi bir ücretli API anahtarı gerekmez.

## Doğrulama ve Kıyaslama Komutları

```bash
npm run typecheck             # TypeScript sıkı tip denetimi
npm test                      # Vitest birim ve entegrasyon test paketi
npm run build                 # Next.js üretim derlemesi
npm run verify:live           # 8-model canlı istasyon walk-forward doğruluk testi
npm run benchmark:bursa       # 17.472 saatlik WMO 17116 Bursa 7-günlük CV kıyaslaması
```
