# Hafta 1 — İş Akış Diyagramı ve Belgeleme

**Proje:** Kurguide – Sistem Mimarisi Tasarım Aracı  
**Dönem:** Hafta 1  
**Tarih:** 03–09 Mart 2026

---

## 1. Geliştirme İş Akış Diyagramı

Aşağıdaki diyagram, Hafta 1 boyunca gerçekleştirilen geliştirme adımlarını ve bu adımlar arasındaki bağımlılıkları göstermektedir.

```mermaid
flowchart TD
    A["Proje Altyapısı Kurulumu"] --> B["Canvas Bileşeni Oluşturma"]
    A --> C["Tema ve Stil Altyapısı"]

    B --> D["Node Tiplerinin Tanımlanması"]
    D --> D1["Service Node"]
    D --> D2["Database Node"]
    D --> D3["Cache Node"]
    D --> D4["Gateway Node"]

    B --> E["Bağlantı Sistemi"]
    E --> E1["Edge oluşturma ve animasyon"]

    D --> F["Bileşen Ekleme Paleti"]
    F --> F1["Sürükle-bırak ile ekleme"]

    D --> G["Özellikler Paneli"]
    G --> G1["Ad, açıklama düzenleme"]
    G --> G2["Teknoloji seçimi"]
    G --> G3["Port ve ortam değişkenleri"]

    B --> H["Durum Yönetimi"]
    H --> H1["Geri Al / İleri Al"]
    H --> H2["Kontrol Noktaları"]

    H2 --> I["Proje Paneli"]
    I --> I1["İstatistikler"]
    I --> I2["Checkpoint listesi"]

    C --> J["14 Tema Paleti"]
    J --> J1["60-30-10 renk kuralı"]
    J --> J2["Tema Seçici Bileşeni"]

    style A fill:#685AFF,color:#fff
    style B fill:#44A194,color:#fff
    style C fill:#44A194,color:#fff
    style D fill:#E8913A,color:#fff
    style F fill:#E8913A,color:#fff
    style G fill:#E8913A,color:#fff
    style H fill:#E8913A,color:#fff
    style I fill:#E8913A,color:#fff
    style J fill:#E8913A,color:#fff
```

---

## 2. Kullanıcı Etkileşim Akışı

Kullanıcının uygulama içindeki temel etkileşim akışını gösteren diyagram:

```mermaid
flowchart LR
    U["Kullanıcı uygulamayı açar"] --> S1["Proje panelini görür"]
    U --> S2["Boş canvas'ı görür"]

    S2 --> A1["Bileşen paleti ile node ekler"]
    A1 --> A2["Node'ları sürükleyerek konumlandırır"]
    A2 --> A3["Node'lar arası bağlantı oluşturur"]

    A1 --> B1["Node'a tıklar"]
    B1 --> B2["Özellikler paneli açılır"]
    B2 --> B3["Detayları düzenler"]
    B3 --> B4["Paneli kapatır"]

    A3 --> C1["Tasarımı kontrol noktası olarak kaydeder"]
    C1 --> C2["Değişiklik yapar"]
    C2 --> C3{"Memnun mu?"}
    C3 -- Evet --> C4["Yeni checkpoint kaydeder"]
    C3 -- Hayır --> C5["Geri al veya checkpoint'e döner"]
    C5 --> C2

    U --> T1["Tema seçiciden tema değiştirir"]

    style U fill:#685AFF,color:#fff
    style C3 fill:#E8913A,color:#fff
```

---

## 3. Uygulama Bileşen Mimarisi

Hafta 1 sonunda uygulamanın bileşen yapısını gösteren diyagram:

```mermaid
graph TD
    App["App.tsx"] --> PS["ProjectSidebar"]
    App --> RF["ReactFlow Canvas"]
    App --> CP["ComponentsPalette"]
    App --> TB["Toolbar"]
    App --> PP["PropertiesPanel"]
    App --> PB["PromptBar"]
    App --> TP["ThemePicker"]

    RF --> BN["BaseNode"]
    BN --> SN["ServiceNode"]
    BN --> DN["DatabaseNode"]
    BN --> CN["CacheNode"]
    BN --> GN["GatewayNode"]

    App --> CS["canvasStore"]
    App --> US["uiStore"]
    App --> TS["themeStore"]
    App --> KB["useKeyboard"]

    CS --> |"zundo"| UR["Undo/Redo"]
    CS --> CK["Checkpoints"]
    CS --> TC["TECH_CATALOG"]

    TS --> TH["14 Tema Paleti"]
    TH --> CSS["CSS Değişkenleri"]

    style App fill:#685AFF,color:#fff
    style CS fill:#44A194,color:#fff
    style US fill:#44A194,color:#fff
    style TS fill:#44A194,color:#fff
    style RF fill:#E8913A,color:#fff
```

---

## 4. Dosya Yapısı

```
apps/web/src/
├── App.tsx                    # Ana uygulama bileşeni
├── index.css                  # Global stiller ve CSS değişkenleri
├── components/
│   ├── ProjectSidebar.tsx     # Sol panel (proje bilgileri, checkpoint)
│   ├── ComponentsPalette.tsx  # Bileşen ekleme paleti
│   ├── Toolbar.tsx            # Geri al / İleri al / Checkpoint kaydet
│   ├── PropertiesPanel.tsx    # Node özellik düzenleme paneli
│   ├── PromptBar.tsx          # AI metin girişi (Hafta 2'de aktif)
│   ├── ThemePicker.tsx        # Tema seçici
│   └── nodes/
│       ├── index.ts           # Node tipleri tanımları
│       ├── BaseNode.tsx       # Ortak node bileşeni
│       ├── ServiceNode.tsx    # Servis node'u
│       ├── DatabaseNode.tsx   # Veritabanı node'u
│       ├── CacheNode.tsx      # Önbellek node'u
│       └── GatewayNode.tsx    # Gateway node'u
├── store/
│   ├── canvasStore.ts         # Canvas durumu, node/edge yönetimi
│   ├── uiStore.ts             # Seçili node, panel durumu
│   └── themeStore.ts          # 14 tema paleti, tema uygulama
├── hooks/
│   └── useKeyboard.ts         # Ctrl+Z / Ctrl+Y kısayolları
└── tailwind.config.js         # Tailwind renk ve tema yapılandırması
```

---

## 5. Kullanılan Teknolojiler

| Teknoloji | Kullanım Alanı |
|-----------|---------------|
| React 18 | Kullanıcı arayüzü |
| TypeScript | Tip güvenliği |
| Vite | Geliştirme sunucusu ve derleme |
| React Flow | Görsel canvas ve node yönetimi |
| Zustand | Durum yönetimi |
| zundo | Geri al / ileri al geçmişi |
| Tailwind CSS | Stil ve tema sistemi |
| pnpm | Paket yönetimi (monorepo) |
