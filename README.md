# ATMOS — Gerçek Zamanlı Meteoroloji Gözlem Platformu

%100 gerçek meteoroloji verisiyle çalışan 4 sekmeli gözlem, radar, çoklu sayısal tahmin modeli ve dikey atmosfer sondaj platformu.

## Sekmeler & Özellikler

1. **Hava Durumu (`/`)**
   - Gerçek güneş yükselme açısına (NOAA deklinasyon/saat açısı) ve anlık yağış/bulut/görüş verilerine bağlı fiziksel Rayleigh/Mie gökyüzü sahnesi.
   - 48 saatlik kaydırılabilir tahmin çubuğu, saatlik sıcaklık/yağış/rüzgar/nem grafikleri, 7 günlük tahmin, 850 hPa sıcaklığı, 0°C donma seviyesi, 3 saatlik barometrik eğilim, 0–6 km rüzgar kırılması, EAQI (PM2.5, PM10, O₃, NO₂, SO₂) ve gerçek güneş döngüsü.
2. **Radar & Küre (`/world`)**
   - **Canlı Yağış Radarı:** CartoDB Dark Matter harita katmanı üzerinde RainViewer canlı 2 saatlik (10 dakikalık adımlar) hareketli yağış radarı. Haritada herhangi bir noktaya tıklayarak koordinat ölçümü.
   - **3D Dünya Küresi:** Gerçek Natural Earth 110m kıyı hatları ve anlık astronomik gece-gündüz sınırı (solar terminator).
3. **İstasyonlar (`/dashboard`)**
   - Birden fazla şehrin/istasyonun canlı ölçümlerini (sıcaklık, 850 hPa, rüzgar, nem, basınç eğilimi, EAQI) tek ekranda kıyaslama ve kişisel eşik izleme kuralları.
4. **Sondaj & Modeller (`/lab`)**
   - **72 Saatlik Çoklu Model Karşılaştırması:** ECMWF IFS 0.25°, NOAA GFS ve DWD ICON modellerinin 2m sıcaklık, 850 hPa sıcaklık, yağış ve 10m rüzgar tahminleri + model sapması.
   - **48 Saatlik Gerçek Radyosonda (1000 → 300 hPa):** Gerçek basınç seviyesi profilleri, Skew-T Log-P diyagramı, CAPE, CIN, LCL, LFC, EL, 0–6 km bulk shear, 700–500 lapse rate ve 5 konvektif indeks (LI, SI, K, TT, SWEAT).

## Veri Kaynakları

- **Open-Meteo Forecast & Pressure Levels:** Anlık, 48s/7g tahmin ve 1000–300 hPa dikey sondaj.
- **Open-Meteo Multi-Model NWP:** `ecmwf_ifs025`, `gfs_seamless`, `icon_seamless`.
- **Open-Meteo Air Quality:** Avrupa AQI, PM2.5, PM10, O₃, NO₂, SO₂, toz.
- **RainViewer Weather Maps:** Canlı küresel yağış radarı kareleri.
- **Natural Earth 110m (`public/geo/ne-110m-land.json`):** Gerçek kıyı poligonları.

## Geliştirme Komutları

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run dev
```
