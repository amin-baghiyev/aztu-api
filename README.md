# AzTU API

AzTU-nun Elektron Təhsil İdarəetmə Sistemindən (KOICA) tələbənin ID və şifrəsi istifadə edilərək tədris məlumatlarının əldə edilməsi üçün yazılmış API.

## İstifadə qaydası

```js
aztu.login() // Sistemə giriş olunur
aztu.getStudentInfo() // Tələbə haqqında məlumatları verir
aztu.getTranscript() // Transkripti verir
aztu.getCurrentLectures() // Hal-hazırki semestrın fənləri haqqında məlumat verir
```

## Nümunə

``` js
//index.js
import AzTU from "./aztu-api.js";

const user = { UserId: "İstifadəçi adı", Password: "Şifrə" }; // Tələbənin məlumatları daxil edilir

const aztu = new AzTU(user);
aztu.login()
  .then(() => aztu.getStudentInfo().then(res => console.log(res)))
```

``` js
// Gələn cavab:
{
  student: {
    typeOfEdu: 'Dövlət sifarişli',
    formOfEdu: 'Əyani',
    section: 'Azərbaycan dili',
    faculty: 'İnformasiya və telekommunikasiya texnologiyaları',
    department: 'Mühəndis riyaziyyatı və süni intelekt',
    specialty: 'Kompüter elmləri',
    year: 'II kurs',
    status: 'təhsil alir',
    admission: '20220915',
    graduation: ''
  },
  personal: {
    name: 'AMİN',
    surname: 'BAĞIYEV',
    fatherName: 'İSLAM',
    gender: 'Kişi',
    mobile: '994*********'
  },
  exam: {
    studentID: '*********',
    verbalPassword: '*********',
    testPassword: '*********'
  }
}
```

## Lisenziya

Lisenziya hüquqları və məhdudiyyətləri üçün [LICENSE](LICENSE.md) faylına baxın. (ISC)