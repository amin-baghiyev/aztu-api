export default class Parser {
	#tag;
	#match;
	#index;

	constructor(html, tag, match, index) {
		this.html = html;
		this.#tag = tag;
		this.#match = match;
		this.#index = index;
	}

	find(tag, className = null) {
		const classSelector = className ? `class=["']${className}["']` : '';
		const regex = new RegExp(`<${tag}[^>]*${classSelector}[^>]*>.*?</${tag}>`, 'gis');
		const cleanedHtml = this.html.replace(/<!--[\s\S]*?-->/g, '');
		const matches = [...cleanedHtml.matchAll(regex)].map(m => m[0]);
		return new Parser(matches.join(''), tag, matches);
	}

	eq(index) {
		const regex = new RegExp(`<${this.#tag}[^>]*>.*?</${this.#tag}>`, 'gis');
		const matches = [...this.html.matchAll(regex)];
		return matches[index] ? new Parser(matches[index][0], this.#tag, matches[index][0], index) : new Parser('', this.#tag);
	}

	attr(attrName) {
		const regex = new RegExp(`${attrName}="(.*?)"`, 'i');
		const match = this.html.match(regex);
		return match ? match[1] : null;
	}

	dictionarySingle(tag) {
		const regex = new RegExp(`<${this.#tag}[^>]*>.*?</${this.#tag}>`, 'gis');
		const matches = [...this.html.matchAll(regex)];
		const dictionary = {};

		matches.forEach(match => {
			const content = match[0];
			const tagMatch = [...content.matchAll(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'gis'))];
			if (tagMatch.length >= 2) {
				const key = tagMatch[0][1].replace(/<\/?[^>]+(>|$)/g, '').trim();
				const value = tagMatch[1][1].replace(/<\/?[^>]+(>|$)/g, '').trim();
				dictionary[key] = value;
			}
		});

		return dictionary;
	}

	dictionaryPair(keyTag, valueTag) {
		const keyMatch = [...this.#match.matchAll(new RegExp(`<${keyTag}[^>]*>(.*?)</${keyTag}>`, 'gis'))].map(m => m[1].replace(/<\/?[^>]+(>|$)/g, '').trim());
		const valueMatch = [...this.#match.matchAll(new RegExp(`<${valueTag}[^>]*>(.*?)</${valueTag}>`, 'gis'))].map(m => m[1].replace(/<\/?[^>]+(>|$)/g, '').trim());
		const minLength = Math.min(keyMatch.length, valueMatch.length);
		const dictionary = {};

		for (let i = 0; i < minLength; i++) dictionary[keyMatch[i]] = valueMatch[i] || '';

		return dictionary;
	}

	dictionaryMultiple(keyTag, valueTag) {
		const keyMatch = [...this.#match.matchAll(new RegExp(`<${keyTag}[^>]*>(.*?)</${keyTag}>`, 'gis'))].map(m => m[1].replace(/<\/?[^>]+(>|$)/g, '').trim());
		const valueMatch = [...this.#match.matchAll(new RegExp(`<${valueTag}[^>]*>(.*?)</${valueTag}>`, 'gis'))].map(m => m[1].replace(/<\/?[^>]+(>|$)/g, '').trim());
		const keyLength = keyMatch.length;
		const result = [];

		for (let i = 0; i < valueMatch.length; i++) {
			const index = Math.floor(i / keyLength);
			const key = keyMatch[i % keyLength];

			if (result[index] === undefined) result[index] = {};

			result[index][key] = valueMatch[i] || '';
		}

		return result;
	}

	array(tag) {
		const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis');
		const cleanedHtml = this.html.replace(/<!--[\s\S]*?-->/g, '');
		return [...cleanedHtml.matchAll(regex)].map(m => new Parser(m[0], tag));
	}

	text() {
		return this.html.replace(/<\/?[^>]+(>|$)/g, '').trim();
	}

	fixHTML() {
		let html;

		html = this.html.replace(/<p([^>]*)>([^<]+)(?!<\/p>)/g, '<p$1>$2</p>');
		html = html.replace(/<p([^>]*)>([^<]+?)<\/p>([^<]+?)<\/p>/g, '<p$1>$2$3</p>');
		html = html.replace(/\n\s+/g, '\n');
		html = html.replace(/\s{2,}/g, ' ');

		if (this.#tag) {
			const regex = new RegExp(`<${this.#tag}[^>]*>.*?</${this.#tag}>`, 'gis');
			this.#match = this.#index != undefined ?
				[...html.matchAll(regex)][this.#index][0] :
				[...html.matchAll(regex)].map(m => m[0]);
		} else this.#match = [html];

		return new Parser(html, this.#tag, this.#match);
	}

	get count() {
		if (!this.#tag) return 0;
		const regex = new RegExp(`<${this.#tag}[^>]*>.*?</${this.#tag}>`, 'gis');
		return [...this.html.matchAll(regex)].length;
	}
}