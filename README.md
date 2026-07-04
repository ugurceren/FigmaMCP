[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/ugurceren-figmamcp-badge.png)](https://mseep.ai/app/ugurceren-figmamcp)

## Figma MCP Kurulum Rehberi

Bu repo, Figma REST API'yi Cursor gibi MCP destekli istemcilerde kullanılabilecek tool'lara dönüştüren yerel bir **Model Context Protocol (MCP) server** içerir.

Bu kurulumla Cursor içinden Figma dosyası okuyabilir, belirli node'ları çekebilir ve seçilen node'u görüntü olarak export edebilirsin.

## İçindekiler

- `src/`: Figma MCP server kaynak kodu
- `.cursor/mcp.json`: Cursor'un bu server'ı tanıması için hazır MCP ayarı
- `.env.example`: Figma token şablonu
- `design/`: Figma'dan çevrilmiş örnek HTML/CSS/JS önizleme
- `powerbi-assets/`: Power BI'a entegre edilebilecek SVG ve theme assetleri
- `figma-upload/`: Figma'ya sürükle-bırak ile aktarılabilecek SVG paketi
- `figma-export/`: import script'i çalışınca oluşan Figma JSON çıktıları
- `REQUIREMENTS.md`: sistem gereksinimleri ve hızlı kontrol komutları

## 1. Gereksinimleri Kontrol Et

Detaylı liste için `REQUIREMENTS.md` dosyasına bak.

Kısa kontrol:

```powershell
node -v
npm -v
```

Beklenen:

- Node.js 18 veya üzeri
- npm kurulu ve terminalden erişilebilir
- Cursor'da MCP desteği aktif
- Figma Personal Access Token

> Not: Cursor kendi içinde `node.exe` ile gelebilir ama bu her zaman `npm` içermez. Bu proje için sistemine Node.js'i npm ile kurman gerekir.

## 2. Bağımlılıkları Kur

Proje klasöründe:

```powershell
cd "D:\Code and Business\FigmaMCP"
npm install
```

Başarılı kurulumda `found 0 vulnerabilities` benzeri bir çıktı görebilirsin.

## 3. Figma Token Oluştur

Figma'da:

1. Sağ üstten profil ikonuna tıkla.
2. `Settings` > `Account` sayfasına gir.
3. `Personal access tokens` bölümünde yeni token oluştur.
4. Token'ı hemen kopyala; sonradan tekrar gösterilmeyebilir.

Token'ı kimseyle paylaşma ve repoya commit etme.

## 4. `.env` Dosyasını Hazırla

`.env.example` dosyasından `.env` oluştur:

```powershell
copy .env.example .env
```

Sonra `.env` içine token'ını yaz:

```text
FIGMA_TOKEN=figd_...
```

Figma projelerini toplu indirmek istiyorsan ayrıca team id ekle:

```text
FIGMA_TEAM_IDS=1234567890
FIGMA_IMPORT_DEPTH=
```

Birden fazla team için virgül kullan:

```text
FIGMA_TEAM_IDS=1234567890,9876543210
```

## 5. MCP Server'ı Çalıştır

Geliştirme modunda:

```powershell
npm run dev
```

Başarılı çalıştığında şuna benzer çıktı görürsün:

```text
> figma-mcp@0.1.0 dev
> tsx src/index.ts
```

Terminal bu noktada açık kalmalıdır; MCP server stdio üzerinden çalışır.

## 6. Cursor'da MCP Server'ı Etkinleştir

Bu repoda hazır `.cursor/mcp.json` vardır:

```json
{
  "mcpServers": {
    "figma-local": {
      "command": "cmd.exe",
      "args": ["/c", "npm", "run", "dev"],
      "cwd": "d:\\Code and Business\\FigmaMCP",
      "env": {
        "DOTENV_CONFIG_PATH": "d:\\Code and Business\\FigmaMCP\\.env"
      }
    }
  }
}
```

Cursor'da:

1. `Settings` > `Installed MCP Servers` ekranına git.
2. `figma-local` server'ını etkinleştir.
3. Durumun `connected` olduğundan emin ol.
4. Gerekirse Cursor'u kapatıp yeniden aç.

## 7. İlk Test

Agent chat'te Figma tool'unu şu input ile çağır:

```text
Sadece `figma_export_image_data` aracını kullan.
Input: {"fileKey":"vYO6kroQG1Vqq6UFUfKi65","nodeId":"0:1","format":"png","scale":2}
```

Beklenen sonuç: Cursor tool'u çağırır ve seçilen Figma node'unun görsel export'unu döndürür.

## 8. Figma Projelerini Bu Klasöre İçe Aktarma

Figma API, token ile hesaptaki tüm team/project bilgisini otomatik keşfetmez. Bu yüzden import için `FIGMA_TEAM_IDS` gereklidir.

Team id genelde Figma team URL'inde bulunur:

```text
https://www.figma.com/files/team/<TEAM_ID>/<team-name>
```

`.env` içine team id'yi ekledikten sonra:

```powershell
npm run import:figma
```

Çıktılar `figma-export/` klasörüne yazılır:

```text
figma-export/
  manifest.json
  team-<teamId>/
    projects.json
    <project-name>-<projectId>/
      files.json
      files/
        <file-name>-<fileKey>.json
```

Varsayılan olarak her dosyanın full Figma JSON'u indirilir. Daha küçük export almak için `.env` içinde depth sınırı verebilirsin:

```text
FIGMA_IMPORT_DEPTH=2
```

> Not: `figma-export/` büyük dosyalar içerebilir ve `.gitignore` içindedir.

## Kullanılabilir MCP Tool'ları

- `figma_get_file`: Figma dosyasının document JSON'unu getirir.
- `figma_get_nodes`: Belirli node'ları getirir.
- `figma_export_images`: Node'lar için export URL'leri döner.
- `figma_export_image_data`: Tek node'u görüntü verisi olarak döner.

## Figma URL Bilgilerini Bulma

Örnek Figma URL:

```text
https://www.figma.com/design/vYO6kroQG1Vqq6UFUfKi65/Untitled?node-id=0-1
```

Bu URL'de:

- `fileKey`: `vYO6kroQG1Vqq6UFUfKi65`
- `node-id`: `0-1`
- MCP/API için node id genelde `0:1` formatında kullanılır.

## Figma Tasarımından Üretilen Web Önizleme

Örnek Figma tasarımı `design/` klasörüne HTML/CSS/JS olarak çevrildi.

Tarayıcıda aç:

```text
design/index.html
```

Dosyalar:

- `design/index.html`: HTML yapı
- `design/styles.css`: görsel tasarım
- `design/app.js`: accordion etkileşimi

## Power BI Tasarım Assetleri

Dashboard görseline benzer Power BI objeleri `powerbi-assets/` klasörüne eklendi.

Ana dosyalar:

- `powerbi-assets/dashboard-shell.svg`: Power BI sayfa arka planı ve kart iskeleti
- `powerbi-assets/powerbi-theme.json`: Power BI theme dosyası
- `powerbi-assets/layout-guide.json`: Visual yerleşim koordinatları
- `powerbi-assets/visual-card.svg`: Reusable grafik kartı
- `powerbi-assets/metric-card.svg`: KPI kartı

Power BI Desktop'ta:

1. Sayfa ölçüsünü 16:9 yap.
2. `dashboard-shell.svg` dosyasını image olarak ekle.
3. Görseli sayfaya yay ve en arkaya gönder.
4. `powerbi-theme.json` dosyasını `View > Themes > Browse for themes` ile içe aktar.
5. Gerçek visual'ları `layout-guide.json` koordinatlarına göre yerleştir.

## Figma'ya Tasarım Yükleme

Figma'ya import için hazır dosya:

```text
figma-upload/dashboard-page.svg
```

Kullanım:

1. Figma'da yeni bir design file aç.
2. `figma-upload/dashboard-page.svg` dosyasını canvas üzerine sürükleyip bırak.
3. Import edilen objeleri düzenle veya frame içine al.

Figma REST API mevcut design file'a doğrudan yeni tasarım objeleri yazmak için uygun olmadığından, en güvenli aktarım yolu SVG import'tur.

## Sorun Giderme

### `npm` veya `node` bulunamıyor

Node.js LTS kur ve terminali yeniden başlat:

```powershell
where.exe node
where.exe npm
node -v
npm -v
```

### MCP server connected görünmüyor

- `.cursor/mcp.json` içindeki `cwd` yolunun kendi proje yolunla aynı olduğundan emin ol.
- `.env` dosyasının mevcut olduğundan emin ol.
- Cursor'u yeniden başlat.
- Output panelinde MCP loglarını kontrol et.

### Figma 401/403 hatası

- Token yanlış olabilir.
- Token'ın dosyaya erişimi olmayabilir.
- Figma dosyasına giriş yaptığın hesap ile token'ın ait olduğu hesap aynı olmayabilir.

### Figma 404 hatası

- `fileKey` yanlış olabilir.
- `nodeId` yanlış formatta olabilir. URL'deki `0-1` değerini MCP input'unda `0:1` olarak dene.

