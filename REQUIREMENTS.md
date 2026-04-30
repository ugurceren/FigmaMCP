# Requirements

Bu dosya, Figma MCP server'ı kuracak kişiler için gerekli sistem ve hesap gereksinimlerini listeler.

## Sistem Gereksinimleri

- Windows 10/11, macOS veya Linux
- Node.js 18 veya üzeri
- npm
- Cursor veya MCP destekleyen başka bir istemci
- İnternet bağlantısı

Önerilen:

- Node.js 20 veya üzeri
- Güncel Cursor sürümü

## Hesap Gereksinimleri

- Figma hesabı
- Figma Personal Access Token
- Erişmek istediğin Figma dosyasına görüntüleme yetkisi
- Toplu import için Figma team id veya team id'leri

## Kurulum Kontrol Komutları

Windows PowerShell:

```powershell
node -v
npm -v
where.exe node
where.exe npm
```

Beklenen:

- `node -v` bir sürüm döndürmeli, örn. `v20.x.x`
- `npm -v` bir sürüm döndürmeli
- `where.exe node` ve `where.exe npm` gerçek dosya yolları döndürmeli

## Proje Bağımlılıkları

Runtime:

- `@modelcontextprotocol/sdk`
- `dotenv`
- `zod`

Development:

- `typescript`
- `tsx`
- `@types/node`

Bağımlılıkları kurmak için:

```powershell
npm install
```

## Ortam Değişkenleri

`.env` dosyasında şu değer gereklidir:

```text
FIGMA_TOKEN=figd_...
```

Toplu Figma proje import'u için:

```text
FIGMA_TEAM_IDS=1234567890
FIGMA_IMPORT_DEPTH=
```

Birden fazla team id:

```text
FIGMA_TEAM_IDS=1234567890,9876543210
```

Token gizlidir. Chat'e, issue'lara veya git commit'lerine eklenmemelidir.

