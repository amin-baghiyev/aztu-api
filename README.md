# AzTU API

API written for retrieving student data from AzTU's Electronic Education Management System (KOICA) using student ID and password.

## Instructions for use

```js
aztu.login() // Logging in to the system
aztu.getStudentInfo() // Return information about the student
aztu.getTranscript() // Return transcript
aztu.getCurrentLectures() // Return information about the subjects of the current semester
```

## Example

``` js
//index.js
import AzTU from "./aztu-api.js";

const user = { UserId: "Username", Password: "Password" }; // The student's information is entered

const aztu = new AzTU(user);
aztu.login()
  .then(() => aztu.getStudentInfo().then(res => console.log(res)))
```

``` js
// Response:
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

## License

See the [LICENSE](LICENSE.md) file for license rights and restrictions. (ISC)

## Other languages

[🇦🇿 Azerbaijani](README.az.md)