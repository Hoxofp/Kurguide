# Teknoloji Seçimi ve Gerekçelendirme Dokümanı

## 1. Mobil Geliştirme Teknolojisi
**Seçilen Teknoloji:** Cross-platform (React Native / Expo)

Uygulamanın geliştirilme sürecinde, hem hızlı prototipleme yapabilmek hem de geniş bir kullanıcı kitlesine ulaşabilmek adına mobil geliştirme yaklaşımı olarak **Cross-platform** tercih edilmiştir.

## 2. Veri Kaynağı
**Seçilen Veri Kaynağı:** Bulut Tabanlı Veritabanı (Firebase / Supabase)

Uygulamada kullanıcı verilerini, uygulama içi dinamik içerikleri güvenli ve eşzamanlı (real-time) bir şekilde saklayıp yönetmek amacıyla **bulut tabanlı bir veritabanı** kullanılacaktır. 

## 3. Ek Araçlar ve Kütüphaneler
Uygulamanın gereksinimlerini sağlamak ve modern bir kullanıcı deneyimi sunmak için aşağıdaki araçlardan yararlanılacaktır:
- **State Management (Durum Yönetimi):** Redux Toolkit veya Context API (Uygulama içi veri akışını yönetmek için).
- **Navigasyon:** React Navigation (Ekranlar arası geçişleri sağlamak için).
- **HTTP/API İstekleri:** Axios veya Fetch API (Veri kaynağı ile iletişim kurmak için).

## 4. Gerekçelendirme

Yapılan bu teknoloji seçimlerinin temel gerekçeleri aşağıda detaylandırılmıştır:

- **Problemin Yapısı:** Uygulamanın temel amacı verileri listelemek, kullanıcı etkileşimi sağlamak ve çeşitli formlar aracılığıyla veri toplamaktır (CRUD işlemleri). Bu tarz ve karmaşık olmayan veri yapısına sahip projelerde, Cross-platform teknolojileri native performansa çok yakın bir akıcılık sunar. Ayrıca verilerin farklı cihazlarda eşzamanlı güncellenebilmesi için bulut tabanlı veritabanı en uygun çözümdür.
- **Geliştirme Süresi:** Eğitim ve laboratuvar takvimi göz önünde bulundurulduğunda, Android (Kotlin/Java) ve iOS (Swift) için ayrı ayrı iki farklı uygulama geliştirmek (Native yaklaşım) çok ciddi bir zaman ve iş gücü gerektirir. Cross-platform yaklaşımı sayesinde **tek bir kod tabanı** yazılarak her iki platform için de çıktı alınabilmesi, geliştirme süresini büyük ölçüde kısaltır. Aynı zamanda bulut tabanlı veritabanı kullanmak, sıfırdan bir arka uç (backend) sunucusu yazma ihtiyacını ortadan kaldırır.
- **Kullanıcı Sayısı Beklentisi:** Uygulamanın başlangıçta laboratuvar/test ortamında sınırlı sayıda, yayınlandığında ise orta ölçekli bir kullanıcı grubuna hitap etmesi beklenmektedir. Seçilen bulut tabanlı veritabanı (örneğin Firebase), sunucu bakımına ihtiyaç duymadan bu ölçekteki trafiği rahatça karşılayabilir ve kullanıcı sayısı arttıkça otomatik olarak ölçeklenebilir (scalable) bir altyapı sunar.

**Özetle Gerekçe:** Uygulamanın veri yapısı nispeten basittir. Süre kısıtı nedeniyle hızlı geliştirme hedeflenmektedir ve tüm ihtiyaçları karşılamak için tek bir kod tabanı yeterlidir.
