# ATMOS v5.0 — Hava Sekmesi (`/`) 10/10 Kök-Çözüm Mimari ve Uygulama Planı

Bu belge, ATMOS meteoroloji uygulamasının **Hava** sekmesindeki tüm sayısal/fiziksel çelişkileri, zaman kaydırma ("hibrit ekran") kopukluklarını, bilgi tekrarlarını, küresel saat dilimi/yaz saati (DST) hatalarını, birim sızıntılarını (`°C`/`°F`), 3D `StormScene` uyumsuzluklarını ve mobil/erişilebilirlik kırılmalarını sıfır regresyonla kapatan birleşik mühendislik planıdır.

## 1. Tekil Gerçeklik (SSOT) Fizik ve Veri Motoru Mimarisi

### 1.1 `"Şimdi"` (`frameIndex === 0`) Kanonik Nokta (`buildCanonicalNowPoint`)
- **Sorun:** `HeroSceneView` doğrudan `bundle.current` (alt-saatlik enterpolasyon + canlı MGM sensörü + canlı radar) okurken, `TimeScrubber`, `HourlyForecastStrip` (`"Şimdi"` sütunu) ve `SnowAndLightningObservatory` `bundle.hourly[0]` (tam saat histerezis kilidi) okumaktaydı.
- **Kök Çözüm:**
  1. `evaluateHourlyRunConsistency` ve `state-ledger` yalnızca saf `HH:00` düğümüyle (`nominalHour0`) çalışır; `daily[0]` 24 saatlik kütle integrali ve 3 saatlik cephe farkı (`dT3h`) bu saf düğümden beslenir.
  2. Stage 3C mikrofiziği ve 3-halkalı radar tamamlandıktan sonra çalışan `buildCanonicalNowPoint()`, hem `bundle.current` hem `bundle.hourly[0]` için sıcaklık, hissedilen, ıslak hazne (`Tw`), rüzgar/hamle/yön, basınç, yağış, `weatherCode`, `condition`, `precipPhase`, `precipType`, `airSnowCm`, `groundSnowCm`, `roadSnowCm`, `snowpackDepthCm`, `snowLineElevationM` ve `lightningProbPct` alanlarını **%100 özdeş** değerlerle üretir.
  3. `buildSmoothCurvePath` içinde ilk segment teğeti `subHourOffsetFrac` (`2 - f_sub`) ile ağırlıklandırılarak saat `:50` sularında yapay spline dirseği oluşması önlenir.
  4. Anti-Downgrade korumasında canlı sensör `current.temperature` değerini güncellediğinde `daily[0].tempMin` ve `daily[0].tempMax` sınırları da genişletilir.

### 1.2 Tekil Islaklık Sözleşmesi (`PRECIP_WETNESS_CONTRACT`)
- `WET_ACTIVE_MIN_MM = 0.05` mm/sa, `SNOW_FLURRY_ACTIVE_CM = 0.08` cm/sa, `CALIBRATED_NWP_WET_FLOOR_MM = 0.10` mm/sa ve `GHOST_POP_MIN_PCT = 20` % sabitleri tüm motorların tek otoritesidir.
- `isWetActiveSample(mm, airSnowCm)` yanlış olduğunda (`mm < 0.05`) ham Open-Meteo `snowfall` sıfırlanır, `diagnoseFallingSnowAtPoint` erken çıkar ve `precipPhase = "none"`, `precipType = "none"` atanır (`0.0 mm` anındaki hayalet kar ikonu biter).

### 1.3 Tekil Elektriksel Fizik ve Fırtına Boru Hattı
- `storm-engine.ts` içindeki ikincil şimşek formülü kaldırılır; `evaluateHourLightningPhysics` (`0..359h`) tek otorite olur (`-8.5°C` buzlanma kapısındaki sirküler `effectiveWmo >= 95` kaçağı ham model uzlaşısıyla kapatılır).
- `reconcileNowLightningWithRadar`: 0–15 km Doppler radar açık ve 45 dk içinde yaklaşan hücre yoksa `Math.max` ezmesi kaldırılarak anlık şimşek olasılığı radar tavanına (`<= %14`) eşitlenir; aktif radar hücresi varsa `hourly[0]` ve `daily[0].lightningProbMaxPct` içine akıtılır.
- `evaluateHourlyStormRisk` `0..359h` boyunca çalışarak `8–15. gün` saatlerinde de gerçek `0..100` `stormScore` üretir.

### 1.4 Referans-Bağıl 4-Rakım Kar Kesiti, 24s Kar Örtüsü Hafızası ve Sıcak Gün Kapısı
- Ova (`100 m`) referanslı $W_{\text{oro}}(z)$ ağırlık fonksiyonu (`15m: 0.92`, `100m: 1.00`, `550m: 1.18`, `1850m: 1.52`) ile seçili rakıma bağıl $M_{\text{oro}}(z_{\text{band}} \mid z_{\text{ref}}) = W_{\text{oro}}(z_{\text{band}}) / W_{\text{oro}}(z_{\text{ref}})$ oranı kullanılır. Uludağ (`1850 m`) seçildiğinde Zirve bandı `1.00x` alır (`1.52x` çifte çarpım ve `[65, 320] m` kenetleme biter).
- `isReferenceBand` olan bant doğrudan `mainState` çıktısını kopyalar (`0.0 cm / %0` sapma); diğer 3 bant da 24 saatlik ısıl ön-ısıtma (`warmupSlice`) ve 212-üye ensemble dizisiyle simetrik çalıştırılır.
- `warmupSlice` içine son 24 saatin gerçek yağış/kar girdisi verilerek gece yağan kar örtüsünün sabah sıfırlanması önlenir; günlük toplamlar ham `float` üzerinden toplanıp en sonda yuvarlanır.
- `isSnowLinePhysicallyRelevant`: Sıcak ve kuru yaz günlerinde (`> 9°C`, kar olasılığı `< %15`, yüksek donma sınırı) `Kar Sınırı: 3950 m` rozeti tüm panellerde gizlenir.

### 1.5 Gün Ortası `"Bugün"` Eşitlemesi ve Bursa Dışı Geçmiş Yağış
- Bursa dışındaki şehirlerde gece yarısından şu ana kadar geçen saatlerin (`0..startIdx - 1`) model analiz yağışı `daily[0].precipSum` içine dahil edilir.
- `buildHourlyDayGroups` içinde `g.precipSumMm` ve `g.maxPopPct` alanları da `daily` kaydıyla eşitlenir.

## 2. Deterministik Zaman Durumu (`ActiveTemporalView`) ve 3D `StormScene`

- `lib/temporal-view.ts` üzerinden `LIVE_NOW` (`frameIndex === 0`) ve `FORECAST_LOCKED` (`frameIndex > 0`) durumları tek merkezden türetilir:
  - Tüm uygulamada **`Min X° / Maks Y°`** sırası standarttır; `+Xs` seçildiğinde Hero seçili saatin takvim gününün Min/Maks değerini gösterir.
  - Kokpit başlığı `"Seçili Saat Telemetrisi (+Xs)"` olur; 3s basınç farkı $i=1,2$ sınırında sürekli geçiş formülüyle hesaplanır; 6. kutudaki donuk EAQI yerine saatlik **`Islak Hazne (Tw) & 0°C Sınırı`** gösterilir.
  - Fırtına çipi skoru, rengi ve etiketi seçili saatin bileşenleriyle dinamik eşleşir; sinoptik sinyaller `+Xs` anında `T+0` sondajını ve `T+0` EAQI değerini karıştırmaz; `SunAndUvCard` seçili saatin gün doğumu/batımını, güneş yay konumunu ve saatlik UV indeksini gösterir.
  - `SnowAndLightningObservatory` 3-halkalı şimşek radarı `T+0`'da `"Canlı Doppler + METAR"`, `+Xs`'te `"NWP Konvektif Projeksiyon (+Xs)"` modunda çalışır.
- **Etkileşim Disiplini:** `HourlyForecastStrip` içinde `dProg/dt` rozeti **`"KOŞU UZLAŞISI"`**, kullanıcı önizlemesi **`"ÖNİZLEME · Sabitlemek İçin Tıkla"`**, tıklanmış saat **`"SAHNE KİLİTLİ (+Xs)"`** olur; sürükleme (`|dx| > 6px`) ve dokunmatik kaydırmada hover susturulur; `TimeScrubber` tekil SVG thumb'a indirilir ve vade daraltmada `frameIndex` `0` yerine `h - 1`'e kenetlenir.
- **3D `StormScene`:** `0.0 mm` kuru bulutta `precipIntensity = 0` (`0` parçacık); `%0` şimşekte kuru Lodos/CAPE şimşek çaktırmaz; tekil `-3.0°` alacakaranlık eşiği, doğudan batıya güneş azimut yayı (`solarArcProgress`), bulut–yağış ortak yatay rüzgar vektörü (`-sin(windRad)`) ve şehir geçişinde anlık güneş açısı koruması uygulanır.

## 3. 6-Katmanlı Bağlamsal Bilgi Mimarisi ve Sıfır-Tekrar Tasarımı

1. **Katman 1:** Anlık Gözlem Kokpiti + `TimeScrubber`
2. **Katman 2:** Tekil `RadarNowcastRibbon` (`0–6s · 15dk`, adaptif tavanlı, yağışsız günde `0px`)
3. **Katman 3:** Saatlik Sinoptik Meteogram (`#saatlik`)
4. **Katman 4:** Birleşik `7G / 15G / 30G` Günlük Ufuk (`#haftalik`, 30G Kar Koridoru dahil) + `SunAndUvCard` + Tek Kanonik `CAMS Hava Kalitesi` (`#hava-kalitesi`)
5. **Katman 5:** 4-Modlu Bağlamsal `SnowAndLightningObservatory` (`#kar-simsek` — sakin yaz gününde 64px şık özet şeridi + 1-tıkla tam 30G kar/radar açılımı; aktif kış/oraj uyarısında otomatik açık ve üst katmana terfi)
6. **Katman 6:** ATMOS-Core v5 8-Model ve İstasyon Doğrulaması (`#hibrit`)

## 4. Küresel IANA Saat Dilimi, Sızıntısız Birim Sistemi ve Mobil/WCAG Kalkanı

- **Birim Sistemi (`lib/weather-client.ts`):** Mutlak sıcaklık (`convertTempValue`: `1.8*T + 32`) ile sıcaklık farkı/hatası (`formatTempDelta`: **yalnızca `1.8*ΔT`**, `+32` yok!) kesin ayrılır; `formatPrecip`, `formatSnowDepth`, `formatElevation`, `formatDistance`, `formatPressure`, `formatPressureDelta` ve `formatLapseRate` tüm bileşenlere bağlanır.
- **IANA Saat Dilimi & DST:** `computeCalendarDayDiff` (`Tokyo 19:00 -> 00:00 "Yarın"`), blok-atlamalı `< 0.3 ms` `createFastZonedTimeResolver` (`New York / Londra` DST geçişleri + `kalman-mos` düzeltmesi), `computeModularSolarArc` (`Reykjavik 02:55 -> 00:03` modüler gündüz süresi) ve `reanchorSnowAndLightningSummary` uygulanır.
- **Mobil & Erişilebilirlik:** `360px` ekranda `ExtendedDailyForecastPanel` `0px` olasılık barı ezilmesi giderilir; Rasathane'deki etiketsiz mikro buton dizileri erişilebilir SVG bileşenine dönüştürülür; Firefox `::-moz-range-*` stilleri ve kontrollü `#kar-simsek` / `#hibrit` kaydırması eklenir.

## 5. Matematiksel Garanti Test Matrisi
- Mevcut **16 test dosyası (92 test)** sıfır regresyonla korunur.
- Yeni değişmezlik testleri (`tests/weather-tab-invariants.test.ts` ve `tests/global-timezone-elevation-invariants.test.ts`): `frameIndex = 0..N` üçlü eşitliği, Imperial `T` vs `ΔT = 1.8x` ve sıfır metrik sızıntı, Tokyo gece yarısı / NY DST / Reykjavik güneş yayı, Mudanya–Bursa–Uludağ 4-rakım monotonluğu ve `0.0 mm` / `%0` şimşek `StormScene` kalkanlarını doğrular.


## 6. Uygulama ve Doğrulama Özeti
- **TypeScript Derlemesi (`npx tsc --noEmit`)**: `0` hata
- **Vitest Test Paketi**: `18/18` test dosyası, **`111/111` test `%100 PASS`** (92 mevcut regresyon testi + 19 yeni matematiksel değişmezlik ve Red-Team kalkan testi)
