import { Pointer } from '../utils/Pointer';

export class Number {
	constructor(private pointer: Pointer) {}

	isNumber(char: string) {
		return /\d/.test(char);
	}

	number() {
		const { pointer } = this;

		if (!this.isNumber(pointer.char)) return null;

		const value = pointer.char;
		pointer.next();

		return {
			type: 'Number',
			value,
			ctx: this.pointer.context(),
		};
	}
}
