import { Pointer } from '../utils/Pointer';

export class Brackets {
	constructor(private pointer: Pointer) {}

	curly() {
		const { pointer } = this;

		if (['{', '}'].includes(pointer.char)) {
			const char = pointer.char;

			pointer.next();

			return {
				type: char === '{' ? 'OpenCurly' : 'CloseCurly',
				value: char,
				ctx: pointer.context(),
			};
		}

		return null;
	}

	parenthesis() {
		const { pointer } = this;

		if (['(', ')'].includes(pointer.char)) {
			const char = pointer.char;

			pointer.next();

			return {
				type: char === '(' ? 'OpenParen' : 'CloseParen',
				value: char,
				ctx: pointer.context(),
			};
		}

		return null;
	}

	square() {
		const { pointer } = this;

		if (['[', ']'].includes(pointer.char)) {
			const char = pointer.char;

			pointer.next();

			return {
				type: char === '[' ? 'OpenSquare' : 'CloseSquare',
				value: char,
				ctx: pointer.context(),
			};
		}

		return null;
	}
}
