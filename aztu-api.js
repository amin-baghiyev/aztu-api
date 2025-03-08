import Parser from './parser.js';
import https from 'https';

export default class AzTU {
	#cookies;
	#pages;
	#paths;

	constructor(user) {
		this.user = user;
		this.#cookies = {};
		this.#pages = {};
		this.#paths = {
			base: 'https://sap.aztu.edu.az/',
			home: 'telebe/',
			announcement: 'studies/notice.php',
			studentInfo: 'telebe/info/student_view.php',
			schedule: 'studies/lecture_time.php',
			transcript: 'telebe/score_view.php',
			lectures: 'studies/lecture_score.php',
			subjects: []
		};
	}

	async login() {
		const login = await this.#request('https://sso.aztu.edu.az/Home/Login', 'POST', {
			UserId: this.user.UserId,
			Password: this.user.Password
		});

		if (this.#cookies['ASP.NET_SessionId'] === undefined) throw new Error('Login failed');

		const parser = new Parser(login);
		const redirect = parser.find('a').eq(4).attr('href');

		await this.#request(redirect, 'GET', {}, false);

		if (this.#cookies.PHPSESSID === undefined) throw new Error('Login failed');
	}

	async studentInfo() {
		if (this.#pages.studentInfo === undefined) await this.#load('studentInfo');

		const parser = new Parser(this.#pages.studentInfo);

		return {
			student: parser.find('tr').dictionarySingle('td'),
			personal: parser.find('div', 'card-body').eq(0).fixHTML().dictionaryPair('strong', 'p'),
			exam: parser.find('div', 'card-body').eq(1).dictionaryPair('strong', 'p')
		};
	}

	async transcript() {
		if (this.#pages.transcript === undefined) await this.#load('transcript');

		const parser = new Parser(this.#pages.transcript);
		const tables = parser.find('table');
		const semesters = tables.eq(1).dictionaryMultiple('th', 'td');

		const data = {
			semesters: {},
			...tables.eq(0).dictionaryPair('th', 'td'),
			...Object.fromEntries(Object.entries(semesters.at(-1)).slice(1))
		};

		for (let i = 2; i < tables.count; i++) {
			const subjects = tables.eq(i).dictionaryMultiple('th', 'td');
			const info = semesters[i - 2];

			data.semesters[info[Object.keys(info)[0]]] = { 'Fənnlər': [...subjects], ...info };
		}

		return data;
	}

	async lectures() {
		if (this.#paths.subjects.length === 0) await this.#initialSubjects();

		await Promise.all(this.#paths.subjects.map(subject => this.#load('lectures', subject.path, subject.name)));
		return this.#paths.subjects.map(subject => {
			const parser = new Parser(this.#pages[subject.name]);
			const score = parser.array('td');
			return score.slice(0, score.length / 2).reduce((data, td, i) => {
				data[td.text()] = score[i + score.length / 2].text();
				return data;
			}, { 'Fənn': subject.name });
		});
	}

	async #initialSubjects() {
		const response = await this.#request('https://sap.aztu.edu.az/telebe/', 'GET', {}, false);
		const parser = new Parser(response);
		const subjects = parser.find('ul', 'custom-submenu').array('a');
		for (let i = 0; i < subjects.length; i++) {
			this.#paths.subjects.push({
				name: subjects[i].text(),
				path: subjects[i].attr('href').split('?')[1].replace('cd', 'code')
			});
		}
	}

	async #request(url, method = 'GET', data = {}, followRedirect = true) {
		return new Promise((resolve, reject) => {
			const postData = method === 'POST' ? new URLSearchParams(data).toString() : '';
			const fullUrl = new URL(url);
			const options = {
				hostname: fullUrl.hostname,
				port: fullUrl.port || 443,
				path: fullUrl.pathname + fullUrl.search,
				method: method,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': method === 'POST' ? Buffer.byteLength(postData) : 0,
					'Cookie': this.#getCookieHeader(),
					'X-Pjax': true
				}
			};

			if (method === 'GET' && data && Object.keys(data).length > 0) options.path = `${fullUrl.pathname}?${new URLSearchParams(data).toString()}`;

			const req = https.request(options, (res) => {
				let data = '';
				res.on('data', chunk => data += chunk);

				res.on('end', () => {
					if (res.headers['set-cookie'] !== undefined) {
						const cookies = this.#getCookies(res.headers['set-cookie']);
						this.#cookies = { ...this.#cookies, ...cookies };
					}
					if (res.statusCode >= 300 && res.statusCode < 400 && res.headers['location'] && followRedirect) {
						const redirectUrl = res.headers['location'].startsWith('http') ? res.headers['location'] : fullUrl.origin + res.headers['location'];
						resolve(this.#request(redirectUrl));
					} else {
						resolve(data);
					}
				});
			});
			if (method === 'POST') req.write(postData);

			req.on('error', e => reject(`Request failed: ${e.message}`));

			req.end();
		});
	}

	async #load(path, query = '', key = null) { this.#pages[key ?? path] = await this.#request(`${this.#paths.base}${this.#paths[path]}?${query}`, 'GET', {}, false); }

	#getCookieHeader() { return Object.entries(this.#cookies).map(([key, value]) => `${key}=${value}`).join('; '); }

	#getCookies(rawCookies) {
		const cookies = {};
		rawCookies.forEach(cookie => {
			const [key, value] = cookie.toString().split(';')[0].split('=');
			cookies[key] = value;
		});
		return cookies;
	}
}