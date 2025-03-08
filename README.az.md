# AzTU API

AzTU-nun Elektron Təhsil İdarəetmə Sistemindən tələbənin ID və şifrəsi istifadə edilərək tələbə məlumatlarının əldə edilməsi üçün yazılmış API.

## İstifadə qaydası
Proyekti quraşdırmaq üçün terminala yazın:

``` bash
npm install aztu-api
```

Sorğuları göndərməzdən əvvəl hesabınıza daxil olmalısınız.

```js
import AzTU from 'aztu-api';

const user = { UserId: 'Username', Password: 'Password' }; // Tələbənin hesab məlumatları daxil edilir

const aztu = new AzTU(user);
await aztu.login();
```

## Koddan istifadə
Tələbənin məlumatlarının əldə edilməsi:

``` js
// Code
await aztu.studentInfo();
```

``` js
// Response
{
  student: {
    'Təhsil növü': 'Dövlət sifarişli',
    'İngilis dili adı': '',
    'Təhsil forması': 'Əyani',
    'Bölməsi': 'Azərbaycan dili',
    'Fakültənin adı': 'İnformasiya texnologiyaları  və telekommunikasiya',
    'Kafedranın adı': 'Mühəndis riyaziyyatı və süni intelekt',
    'İxtisas adı': 'Kompüter elmləri',
    'İxtisaslaşma': '',
    Kurs: 'III kurs',
    Statusu: 'təhsil alir',
    'Orta məktəb': '',
    'Orta məktəbi bitirdiyi tarix': '',
    'Qəbul olma tarixi': '20220915',
    'Bitirdiyi tarix': ''
  },
  personal: {
    'Şəxsiyyət vəsiqəsinin seriya və nömrəsi': '*******',
    Ad: 'AMİN',
    Soyad: 'BAĞIYEV',
    'Ata adı': 'İSLAM',
    Cinsi: 'Kişi',
    Telefon: '',
    'Ünvanı': '',
    'Mobil telefon': '994708143593',
    'Doğum tarixi': ''
  },
  exam: {
    'Telebe ID (Username)': '202206401',
    'Şifahi İmtahan parolu': '104602202',
    'Test İmtahan parolu': '80146828'
  }
}
```

Tələbənin cari semestrda yazıldığı fənnlər:

``` js
// Code
await aztu.lectures();
```

``` js
// Response
[
  {
    'Fənn': 'Bulud texnologiyalarına giriş',
    'sərbəst iş(10)': '0',
    'Məşğələ(30)': '0',
    'Davamiyyət': '10',
    Toplam: '10'
  },
  {
    'Fənn': 'MS Excel ilə verilənlərin analizi',
    'sərbəst iş(10)': '0',
    'Məşğələ(30)': '0',
    'Davamiyyət': '10',
    Toplam: '10'
  },
  {
    'Fənn': 'Mülki müdafiə',
    'sərbəst iş(10)': '0',
    'Məşğələ(30)': '0',
    'Davamiyyət': '10',
    Toplam: '10'
  },
  {
    'Fənn': 'Optimallaşdırma üsulları',
    'sərbəst iş(10)': '0',
    'Məşğələ(30)': '0',
    'Davamiyyət': '10',
    Toplam: '10'
  },
  {
    'Fənn': 'Python-la maşın öyrənməsi',
    'sərbəst iş(10)': '0',
    'Məşğələ(30)': '0',
    'Davamiyyət': '10',
    Toplam: '10'
  },
  {
    'Fənn': 'Süni intellekt',
    'sərbəst iş(10)': '0',
    'Məşğələ(30)': '0',
    'Davamiyyət': '10',
    Toplam: '10'
  }
]
```

Tələbənin transkripti:

``` js
await aztu.transcript();
```

``` js
{
  semesters: {
    '2025/yaz': {
      'Fənnlər': [Array],
      'Il / semester': '2025/yaz',
      'Ümumi fənnlər': '6',
      'Dinlənmiş fənnlər': '0',
      'Umumi kredit': '30',
      'Alınmış kredit': '0',
      'Yekun orta bal': '0'
    },
    '2024/payiz': {
      'Fənnlər': [Array],
      'Il / semester': '2024/payiz',
      'Ümumi fənnlər': '6',
      'Dinlənmiş fənnlər': '1',
      'Umumi kredit': '30',
      'Alınmış kredit': '3',
      'Yekun orta bal': '136.3'
    },
    '2024/yaz': {
      'Fənnlər': [Array],
      'Il / semester': '2024/yaz',
      'Ümumi fənnlər': '6',
      'Dinlənmiş fənnlər': '6',
      'Umumi kredit': '30',
      'Alınmış kredit': '30',
      'Yekun orta bal': '67.2'
    },
    '2023/payiz': {
      'Fənnlər': [Array],
      'Il / semester': '2023/payiz',
      'Ümumi fənnlər': '6',
      'Dinlənmiş fənnlər': '6',
      'Umumi kredit': '30',
      'Alınmış kredit': '30',
      'Yekun orta bal': '79'
    },
    '2023/yaz': {
      'Fənnlər': [Array],
      'Il / semester': '2023/yaz',
      'Ümumi fənnlər': '6',
      'Dinlənmiş fənnlər': '6',
      'Umumi kredit': '30',
      'Alınmış kredit': '30',
      'Yekun orta bal': '84.3'
    },
    '2022/payiz': {
      'Fənnlər': [Array],
      'Il / semester': '2022/payiz',
      'Ümumi fənnlər': '6',
      'Dinlənmiş fənnlər': '6',
      'Umumi kredit': '30',
      'Alınmış kredit': '30',
      'Yekun orta bal': '77.9'
    }
  },
  'Fakültə / Kafedra': 'İnformasiya texnologiyaları  və telekommunikasiya  / Mühəndis riyaziyyatı və süni intelekt',
  'İdentifikator': '202206401',
  'Adı': 'AMİN',
  Status: 'təhsil alir',
  'Ümumi fənnlər': '36',
  'Dinlənmiş fənnlər': '25',
  'Umumi kredit': '180',
  'Alınmış kredit': '123',
  'Yekun orta bal': '78.5447'
}
```

## Lisenziya

Lisenziya hüquqları və məhdudiyyətlər üçün [LICENSE](LICENSE.md) faylına baxın. (ISC)

## Digər dillər

[🇺🇸 İngiliscə](README.md)