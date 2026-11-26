# ATMOS v4.5 — Hiper-Yerel Kanıta Dayalı Meteoroloji & 7-Model EMOS Platformu

Bursa başta olmak üzere gerçek fiziksel yer istasyonu ağları, 8.712 saatlik WMO 17116 Hibrit EMOS kalibrasyonu, 7 Tier-1 NWP/AI modeli ve 122 olasılıksal ensemble üyesiyle çalışan yeni nesil meteoroloji gözlem ve tahmin platformu (**ATMOS-Core v4.5**).

## ATMOS-Core v4.5 Mimarisi

- **Bursa 19-İlçe MGM Hiper-Yerel Gözlem Ağı & LTBR İzolasyonu (`lib/bursa-mesh.ts`, `lib/topographic-cressman.ts`):** Resmi MGM 19 ilçe istasyonu (Osmangazi WMO 17116, Nilüfer, Yıldırım, Mudanya, Gemlik, Kestel, Uludağ 1.877 m vb.) canlı çekilir; Yenişehir Havalimanı (`LTBR`) çanak-ova radyasyon soğuması tuzağı topografik bariyer cezasıyla izole edilir ve anizotropik Topografik Cressman-Barnes enterpolasyonu uygulanır.
- **8.712 Saatlik WMO 17116 Eğitimli Hibrit Huber-Ridge + L1-Ağaç EMOS (`lib/bursa-trained-emos.ts`):** 56 özellikli Huber-IRLS Ridge omurgası + simetrik derinlik-3 L1 karar ağaçları + canlı MGM sensörü AR(2) sönümlemesi ile AIFS 6 saatlik testere dişi sapması ve akşam kentsel ısı adası (UHI) salınımı düzeltilir (+1s **0,53 °C** MAE, +6s **0,84 °C** MAE, Gün 1 **1,04 °C** MAE).
- **3B Uludağ Dikey Fizik & Piksel Düzeyinde Radar Nowcast (`lib/vertical-physics.ts`, `lib/radar-nowcast.ts`):** Lodos adyabatik Fön ısınması, alt-bulut virga buharlaşması, fiziksel sis görüş mesafesi ve RainViewer PNG radar karolarından yarı-Lagrange optik akışla dakika bazlı yağış başlangıç/bitiş tespiti yapılır.
- **Sıfır Son Dakika Savrulması — 4-Koşulu `dProg/dt` Histerezis Kilidi (`lib/run-consistency.ts`):** 4 ardışık model koşusunu karşılaştırarak tekil ara koşu (06Z/18Z) sapmalarını ve T+0..T+2s spin-up şoklarını sönümler; hatalı son dakika revizyonlarını **%1,35** seviyesine indirir.

## Geliştirme & Doğruluk Denetimi Komutları

```bash
npm install
npm run typecheck
npm run test
npm run benchmark:bursa
npm run dev
```
