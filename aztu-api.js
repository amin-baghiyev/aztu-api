import axios from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import cheerio from 'cheerio';

export default class AzTU {
	constructor(user) {
		this.user = user;
		this.cookies = {};
		axiosCookieJarSupport.wrapper(axios);
		this.axios = axios.create({ jar: new CookieJar() });
		this.pages = {};
		this.paths = {
			home: 'telebe',
			announcement: 'studies/notice.php',
			studentInfo: 'telebe/info/student_view.php',
			schedule: 'studies/lecture_time.php',
			transcript: 'telebe/score_view.php',
			currentLectures: 'studies/lecture_score.php',
			subjects: []
		};
	}

	async login() {
		try {
			// Login page
			await this.axios.post('https://sso.aztu.edu.az/Home/Login', {
				UserId: this.user.UserId,
				Password: this.user.Password
			}, {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				withCredentials: true
			});

			const cookies = this.#getCookies(this.axios.defaults.jar.getCookiesSync('https://sso.aztu.edu.az/Home/Login'));

			if (!cookies.username) {
				throw new Error('Login error');
			}

			// Admin page
			const adminResponse = await this.axios.get('https://sso.aztu.edu.az/Admin', {
				headers: {
					'Cookie': `ASP.NET_SessionId=${cookies['ASP.NET_SessionId']}; username=${cookies.username}`
				},
				withCredentials: true
			});

			const $ = cheerio.load(adminResponse.data);
			const redirectLoginURL = $('a').eq(4).attr('href');

			// From Admin page to sap.aztu.edu.az
			await this.axios.get(redirectLoginURL, {
				headers: {
					'Cookie': `ASP.NET_SessionId=${cookies['ASP.NET_SessionId']}; username=${cookies.username}`
				},
				withCredentials: true
			});

			this.cookies.PHPSESSID = this.#getCookies(this.axios.defaults.jar.getCookiesSync(redirectLoginURL)).PHPSESSID;

		} catch (error) {
			throw new Error(`Login failed: ${error.message}`);
		}
	}

	async getStudentInfo() {
		await this.goTo('studentInfo');
		const $ = cheerio.load(this.pages.studentInfo);

		const response = {
			student: {
				typeOfEdu: $('.ng-binding').eq(0).text().trim(),
				formOfEdu: $('.ng-binding').eq(2).text().trim(),
				section: $('.ng-binding').eq(3).text().trim(),
				faculty: $('.ng-binding').eq(4).text().trim(),
				department: $('.ng-binding').eq(5).text().trim(),
				specialty: $('.ng-binding').eq(6).text().trim(),
				year: $('.ng-binding').eq(8).text().trim(),
				status: $('.ng-binding').eq(9).text().trim(),
				admission: $('.ng-binding').eq(12).text().trim(),
				graduation: $('.ng-binding').eq(13).text().trim()
			},
			personal: {
				name: $('.card-body').eq(1).find('p').eq(1).text().trim(),
				surname: $('.card-body').eq(1).find('p').eq(2).text().trim(),
				fatherName: $('.card-body').eq(1).find('p').eq(3).text().trim(),
				gender: $('.card-body').eq(1).find('p').eq(4).text().trim(),
				mobile: $('.card-body').eq(1).find('p').eq(7).text().trim()
			},
			exam: {
				studentID: $('.card-body').eq(2).find('p').eq(0).text().trim(),
				verbalPassword: $('.card-body').eq(2).find('p').eq(1).text().trim(),
				testPassword: $('.card-body').eq(2).find('p').eq(2).text().trim()
			}
		};

		return response;
	}

	async getTranscript() {
		let data = {
			semesters: {
				'Toplam': {}
			}
		}
		await this.goTo('transcript');
		const $ = cheerio.load(this.pages.transcript);
		const tables = $('table');
		for (let i = 0; i < tables.eq(0).find('th').length; i++) {
			data[cheerio.text(tables.eq(0).find('th').eq(i)).trim()] = cheerio.text(tables.eq(0).find('td').eq(i)).trim();
		}

		for (let table = 2; table < tables.length; table++) {
			let semester = {
				'Fənnlər': []
			};
			for (let row = 1; row < tables.eq(table).find('tr').length; row++) {
				let subject = {};
				for (let cell = 0; cell < tables.eq(table).find('th').length; cell++) {
					subject[cheerio.text(tables.eq(table).find('th').eq(cell)).trim()] = cheerio.text(tables.eq(table).find('tr').eq(row).find('td').eq(cell)).trim();
				}
				semester['Fənnlər'].push(subject);
			}
			for (let cell = 1; cell < tables.eq(1).find('th').length; cell++) {
				semester[cheerio.text(tables.eq(1).find('th').eq(cell)).trim()] = cheerio.text(tables.eq(1).find('tr').eq(table - 1).find('td').eq(cell)).trim();
			}
			data.semesters[cheerio.text(tables.eq(1).find('tr').eq(table - 1).find('td').eq(0)).trim()] = semester;
		}

		for (let cell = 1; cell < tables.eq(1).find('th').length; cell++) {
			data.semesters['Toplam'][cheerio.text(tables.eq(1).find('th').eq(cell)).trim()] = cheerio.text(tables.eq(1).find('tr').eq(tables.eq(1).find('tr').length - 1).find('td').eq(cell)).trim();
		}

		return data;
	}

	async getCurrentLectures() {
		let currentLectures = [];
		await this.setSubjects();
		if (!this.paths.subjects.length) throw 'No subjects found';
		for (const subject of this.paths.subjects) {
			let data = {
				'Fənn': subject.name,
			};
			await this.goTo('currentLectures', subject.path);
			const $ = cheerio.load(this.pages.currentLectures);
			const score = $('#toplam_score').eq(0).find('td');
			for (let i = 0; i < score.length / 2; i++) {
				data[cheerio.text(score[i].children)] = cheerio.text(score[i + (score.length / 2)].children);
			}
			currentLectures.push(data);
		}
		return currentLectures;
	}

	async setSubjects() {
		this.paths.subjects = [];
		await this.goTo('home');
		const $ = cheerio.load(this.pages.home);
		const subjects = $('.custom-submenu').eq(0).find('a');
		for (let i = 0; i < subjects.length; i++) {
			this.paths.subjects.push({
				name: subjects[i].children[0].data.trim(),
				path: subjects[i].attribs.href.split('?')[1].replace('cd', 'code')
			});
		}
	}

	async goTo(path, query = '') {
		try {
			const response = await this.axios.get(`https://sap.aztu.edu.az/${this.paths[path]}?${query}`, {
				headers: {
					'X-Pjax': true,
					'Cookie': `PHPSESSID=${this.cookies.PHPSESSID}`
				},
				withCredentials: true
			});

			this.pages[path] = response.data;
		} catch (error) {
			throw new Error(`${path} page request failed: ${error.message}`);
		}
	}

	#getCookies(rawCookies) {
		const cookies = {};
		rawCookies.forEach(cookie => {
			const [key, value] = cookie.toString().split(';')[0].split('=');
			cookies[key] = value;
		});
		return cookies;
	}
}