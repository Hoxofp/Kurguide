# LAB 3 – Kullanıcı Senaryoları

**Proje Adı:** Kurguide – Sistem Mimarisi Tasarım Aracı  
**Öğrenci:** Ahmet Mervan ERMAN  
**Tarih:** 06.03.2026

---

## Problem Özeti

Yazılım projelerine başlayan ekipler, sistemin hangi bileşenlerden oluşacağını ve bu bileşenlerin birbiriyle nasıl iletişim kuracağını planlamakta zorlanmaktadır. Mevcut araçlar ya çok karmaşıktır ya da teknik bilgi gerektirir. Kurguide, kullanıcıların sürükle-bırak yöntemiyle sistem mimarilerini görsel olarak tasarlamasını, bileşenlerin detaylarını düzenlemesini ve tasarım sürecini yönetmesini sağlayan bir uygulamadır.

---

## Senaryo 1: Yeni Bir Sistem Mimarisi Oluşturma

**Kullanıcı:** Yazılım projesi planlayan bir ekip lideri  
**Amaç:** Yeni bir projenin temel bileşenlerini görsel olarak yerleştirmek ve aralarındaki bağlantıları kurmak

**Adımlar:**

1. Kullanıcı uygulamayı açar ve boş bir tasarım alanıyla karşılaşır.
2. Sağ üst köşedeki bileşen listesinden "Gateway" seçeneğine tıklar; tasarım alanına bir giriş noktası eklenir.
3. Aynı listeden iki adet "Service" bileşeni ekler ve bunları tasarım alanında uygun konumlara sürükler.
4. Bir "Database" bileşeni ekleyerek veri deposunu temsil eder.
5. Giriş noktasından servislere, servislerden veritabanına doğru bağlantı çizgilerini oluşturur.
6. Eklenen bileşenlerin ve bağlantıların doğru göründüğünü kontrol eder.
7. Tasarımın mevcut halini bir kontrol noktası olarak kaydeder.

---

## Senaryo 2: Bileşen Detaylarını Düzenleme

**Kullanıcı:** Sistemin teknik özelliklerini belirlemek isteyen bir geliştirici  
**Amaç:** Tasarımdaki bir bileşenin adını, açıklamasını ve teknik tercihlerini güncellemek

**Adımlar:**

1. Kullanıcı daha önce oluşturulmuş bir tasarımı açar.
2. Düzenlemek istediği servis bileşenine tıklar.
3. Sol tarafta açılan özellikler panelinde bileşenin adını "Kullanıcı Servisi" olarak değiştirir.
4. Açıklama alanına bileşenin görevini yazar.
5. Teknoloji listesinden uygun bir seçenek belirler; sistem otomatik olarak bağlantı noktası bilgisini doldurur.
6. Ortam değişkenleri alanına gerekli ayarları ekler.
7. Paneli kapatır ve değişikliklerin tasarım alanında yansıdığını görür.

---

## Senaryo 3: Tasarımı Geri Alma ve Kontrol Noktası Yönetimi

**Kullanıcı:** Farklı tasarım alternatiflerini denemek isteyen bir proje yöneticisi  
**Amaç:** Yapılan değişiklikleri geri alarak önceki bir tasarım durumuna dönmek

**Adımlar:**

1. Kullanıcı mevcut tasarımına yeni bir önbellek bileşeni ekler.
2. Eklenen bileşenin tasarıma uygun olmadığına karar verir.
3. Araç çubuğundaki geri alma butonuna tıklar; eklenen bileşen kaldırılır.
4. Daha önceki bir aşamaya dönmek için sol paneldeki kontrol noktaları listesine bakar.
5. Listeden istediği kontrol noktasını seçerek o anki tasarıma geri döner.
6. Geri yüklenen tasarımın doğru olduğunu kontrol eder.

---

## Senaryo 4: Yapay Zekâ ile Sistem Mimarisi Oluşturma

**Kullanıcı:** Teknik altyapı konusunda deneyimi sınırlı olan bir girişimci  
**Amaç:** İstediği sistemi doğal dille anlatarak yapay zekânın önerdiği farklı mimari seçenekler arasından en uygun olanını seçmek

**Adımlar:**

1. Kullanıcı uygulamayı açar ve ekranın alt kısmındaki metin alanına kurmak istediği sistemi kendi cümleleriyle yazar (örneğin: "Kullanıcıların kayıt olabildiği, ürün listeleyebildiği ve sipariş verebildiği bir e-ticaret sistemi istiyorum").
2. "Oluştur" butonuna basar.
3. Yapay zekâ, anlatılan sisteme uygun birden fazla mimari alternatif oluşturur ve bunları tasarım alanında saydam önizleme olarak gösterir.
4. Her mimari seçeneğin yanında kullanılan yaklaşımın avantajları, dezavantajları ve karşılaşılabilecek ödünleşimler (örneğin: hız-maliyet dengesi, basitlik-ölçeklenebilirlik karşılaştırması) kısa ve anlaşılır şekilde sunulur.
5. Kullanıcı, sunulan seçenekleri inceleyerek ihtiyacına en uygun mimariyi seçer.
6. Seçilen mimari tasarım alanında tam olarak oluşturulur; diğer alternatifler kaldırılır.
7. Kullanıcı, gerekirse bileşenlerin üzerine tıklayarak düzenleme yapar ve tasarımı bir kontrol noktası olarak kaydeder.


