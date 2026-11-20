# ATMOS — Sinematik 3D Hava Durumu & Meteoroloji Laboratuvarı

Gerçek zamanlı **Open-Meteo (Forecast + Pressure Levels 1000–300 hPa + Air Quality + Geocoding)** verileriyle çalışan 4 sekmeli Next.js 16 + React Three Fiber + GSAP + Web Audio + Skew-T Log-P / CAPE meteoroloji platformu.

## Sekmeler

1. **Sahne (`/`):** Tam ekran 3D WebGL atmosfer (dinamik gün ışığı, yıldızlar, volumetrik bulutlar, 3D yağmur/kar/toz parçacıkları, şimşek parlamaları, zemin yağmur/kar birikimi, AQI kenar sisi), canlı telemetri, 24s oynatılabilir zaman çizelgesi, 48s grafik analizi ve 7 günlük tahmin.
2. **3D Küre (`/world`):** İnteraktif 3D Dünya küresi, jet stream parçacıkları, küreye tıklayarak canlı koordinat ölçümü ve hızlı küresel şehir pinleri.
3. **Panom (`/dashboard`):** Çoklu şehir canlı karşılaştırma kartları, özet uç değerler ve kişisel atmosfer eşik alarmları.
4. **CAPE Lab (`/lab`):** 1000–300 hPa canlı sounding + 4 yüzey tipli interaktif fırtına simülatörü, 270° CAPE Arc Gauge, 5 konvektif indeks (LI, SI, K, TT, SWEAT) ve canlı Canvas Skew-T Log-P diyagramı.

## Kurulum & Doğrulama

```bash
npm install
npm run dev        # http://localhost:3006
npm run typecheck  # TypeScript strict kontrolü
npm run test       # Vitest meteoroloji & termodinamik birim testleri
npm run build      # Üretim derlemesi
```
