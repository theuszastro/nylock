import { Boolean } from './tokens/Boolean';
import { Brackets } from './tokens/Brackets';
import { Colon } from './tokens/Colon';
import { Identifier } from './tokens/Identifier';
import { NewLine } from './tokens/NewLine';
import { Number } from './tokens/Number';
import { Operator } from './tokens/Operator';
import { String } from './tokens/String';
import { Whitespace } from './tokens/Whitespace';
import { Pointer } from './utils/Pointer';

export class Tokenizer {
	private pointer: Pointer;
	private newline: NewLine;
	private colon: Colon;
	private whitespace: Whitespace;
	private identifier: Identifier;
	private string: String;
	private number: Number;
	private boolean: Boolean;
	private brackets: Brackets;
	private operator: Operator;

	constructor(filename: string, content: string) {
		this.pointer = new Pointer(filename, content);

		this.newline = new NewLine(this.pointer);
		this.colon = new Colon(this.pointer);
		this.whitespace = new Whitespace(this.pointer);

		this.string = new String(this.pointer);
		this.number = new Number(this.pointer);
		this.boolean = new Boolean(this.pointer);
		this.brackets = new Brackets(this.pointer);
		this.identifier = new Identifier(this.pointer, this.boolean);
		this.operator = new Operator(this.pointer);
	}

	private endFile() {
		if (!this.pointer.char) {
			return {
				type: 'EndFile',
				ctx: this.pointer.context(),
			};
		}

		return null;
	}

	nextToken() {
		const token =
			this.newline.newline() ||
			this.whitespace.whitespace() ||
			this.colon.semicolon() ||
			this.colon.colon() ||
			this.brackets.square() ||
			this.identifier.identifier() ||
			this.string.string() ||
			this.boolean.boolean() ||
			this.number.number() ||
			this.operator.operator() ||
			this.endFile();

		console.log(token);

		return token;
	}
}
