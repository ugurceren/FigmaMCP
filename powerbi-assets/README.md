# Power BI Tasarım Assetleri

Bu klasör, paylaşılan dashboard görseline benzer bir Power BI rapor teması kurmak için hazırlanmış görsel objeleri içerir.

## Dosyalar

- `dashboard-shell.svg`: 1280x720 ana dashboard arka planı, sol menü, header ve kart alanları.
- `visual-card.svg`: Tekil grafik container kartı.
- `metric-card.svg`: KPI/metrik kartı.
- `nav-button.svg`: Pasif sol menü butonu.
- `nav-button-active.svg`: Aktif sol menü butonu.
- `filter-reset-button.svg`: Reset all filters butonu.
- `powerbi-theme.json`: Power BI renk/theme dosyası.
- `layout-guide.json`: Visual yerleşim koordinat rehberi.

## Power BI'da Kullanım

1. Power BI Desktop'ta sayfa ölçüsünü 16:9 yap.
2. `dashboard-shell.svg` dosyasını sayfaya image olarak ekle.
3. Görseli sayfanın tamamına yay ve en arkaya gönder.
4. Gerçek Power BI visual'larını `layout-guide.json` içindeki koordinatlara göre yerleştir.
5. `powerbi-theme.json` dosyasını `View > Themes > Browse for themes` ile içe aktar.

## Önerilen Visual Yerleşimi

- Üst sağ geniş alan: clustered column chart
- Sol üst alan: KPI cards
- Alt sol iki kart: donut chart
- Alt orta/sağ kartlar: column chart

## Not

SVG assetleri düzenlenebilir. Renkleri doğrudan SVG içindeki hex değerlerini değiştirerek özelleştirebilirsin.

