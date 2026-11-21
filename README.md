# ATMOS — Kanıta Dayalı Canlı Meteoroloji Gözlem & Doğrulama Platformu

%100 gerçek fiziksel gözlem ve çoklu sayısal hava tahmini (NWP + AI) verisiyle çalışan 4 sekmeli gözlem, canlı doğrulama, Doppler radar ve dikey atmosfer sondaj platformu.

## Canlı Veri & Doğrulama Mimarisi

- **Gerçek Fiziksel Yer Gözlemi (METAR):** NOAA AviationWeather.gov resmi METAR API ile seçili konuma 65 km içindeki en yakın ICAO istasyonunun gerçek termometre, çiy noktası, QNH barometre, anemometre ve görüş sensörü okumaları.
- **5 Tier-1 Model Canlı 24s Ters-RMSE² Hibrit Motoru:** `ECMWF IFS (9 km HRES)`, `ECMWF AIFS v1 (AI)`, `DWD ICON-EU (7 km)`, `UKMO Unified (10 km)` ve `NOAA GFS / HRRR (3 km)` modellerinin son 24 saatteki gerçek METAR gözlemlerine karşı canlı RMSE hatası ölçülür; her parametre (sıcaklık, basınç, rüzgar) için dinamik ağırlıklar hesaplanır. Yakın METAR olmayan noktalarda şeffafça WMO LC-DNV referans ağırlıkları kullanılır.
- **Fiziksel Standartlar:**
  - **Termodinamik:** Bolton (1980) Eq. 10 ($e_s$), Eq. 22 ($T_{LCL}$), Eq. 39 ($\theta_e$, `< 0.2 K` hata), dinamik jeopotansiyel yükseklik (`geopotential_height_1000..300hPa`) ve `500–1000 hPa` kalınlık (`dam`).
  - **Astronomi:** Resmi NOAA Global Monitoring Laboratory Zaman Denklemi (EoT) + Fourier Deklinasyon + Saemundsson atmosferik kırılma düzeltmesi (`< 0.01°`).
  - **Rüzgar & Basınç:** Vektörel rüzgar yönü ortalaması, WMO Beaufort 0–12 skalası, resmi WMO FM-12 barometrik eğilim eşikleri ve 4 fiziksel hamle modeli.
  - **Hava Kalitesi:** Copernicus CAMS (10 km) + resmi EEA 6 bantlı EAQI ve baskın kirletici tespiti.
  - **Radar & Küre:** RainViewer Doppler (Marshall-Palmer $Z = 200 R^{1.6}$ skalası) + filigransız Esri Koyu/Uydu katmanları + Natural Earth 110m 3D Dünya Küresi.

## Geliştirme Komutları

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run dev
```
