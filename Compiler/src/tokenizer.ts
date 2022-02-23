import { Pointer } from './utils/Pointer';
import {
	Boolean,
	Brackets,
	Colon,
	Identifier,
	NewLine,
	Number,
	Operator,
	OperatorLogic,
	Whitespace,
	Others,
} from './tokens';

import { Token } from './utils/ParserPointer';

export class Tokenizer {
	private pointer: Pointer;
	private newline: NewLine;
	private colon: Colon;
	private whitespace: Whitespace;
	private identifier: Identifier;
	private number: Number;
	private boolean: Boolean;
	private brackets: Brackets;
	private operator: Operator;
	private operatorLogic: OperatorLogic;
	private others: Others;

	constructor(filename: string, content: string) {
		this.pointer = new Pointer(filename, content);

		this.newline = new NewLine(this.pointer);
		this.colon = new Colon(this.pointer);
		this.whitespace = new Whitespace(this.pointer);

		this.number = new Number(this.pointer);
		this.boolean = new Boolean(this.pointer);
		this.brackets = new Brackets(this.pointer);
		this.identifier = new Identifier(this.pointer, this.boolean);
		this.operator = new Operator(this.pointer);
		this.operatorLogic = new OperatorLogic(this.pointer);
		this.others = new Others(this.pointer);
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

	previewNext(skipNewline = true, skipWhiteSpace = true) {
		const memorized = this.pointer.memorize();

		let token: Token | null = null;

		for (;;) {
			token = this.nextToken();
			if (!token) break;

			if (skipWhiteSpace && ['Whitespace'].includes(token.type)) continue;
			if (skipNewline && token.type === 'NewLine') continue;

			break;
		}

		this.pointer.restore(memorized);

		return token;
	}

	nextToken() {
		const token =
			this.newline.newline() ||
			this.whitespace.whitespace() ||
			this.colon.semicolon() ||
			this.colon.colon() ||
			this.colon.comma() ||
			this.brackets.square() ||
			this.brackets.parenthesis() ||
			this.brackets.curly() ||
			this.operator.operator() ||
			this.operatorLogic.operatorLogic() ||
			this.identifier.identifier() ||
			this.number.number() ||
			this.boolean.boolean() ||
			this.others.others() ||
			this.endFile();

		return token;
	}
}
