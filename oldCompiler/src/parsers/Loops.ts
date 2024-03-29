import { SyntaxError } from '../errors/SyntaxError';
import { ParserPointer } from '../utils/ParserPointer';

import { LoopToken, ParsedToken } from '../types/parsedToken';

export class Loops {
	constructor(private pointer: ParserPointer, private stmts: Function) {}

	private readBlock(lineError: number) {
		const { pointer } = this;

		const body: ParsedToken[] = [];

		for (;;) {
			if (!pointer.token || pointer.take('EndFile'))
				new SyntaxError(this.pointer, {
					lineError,
					reason: 'Expected a end function',
				});

			if (pointer.take('EndKeyword')) break;
			if (pointer.token) {
				if (['BreakKeyword', 'ContinueKeyword'].includes(pointer.token.type)) {
					body.push({
						...pointer.token,
						ctx: pointer.ctx(pointer.line),
					});

					pointer.take(pointer.token.type);

					continue;
				}
			}

			const result = this.stmts();
			if (result) body.push(result);
		}

		const existsBreak = body.find(c => c.type === 'BreakKeyword');
		if (!existsBreak)
			new SyntaxError(this.pointer, {
				lineError,
				reason: 'Loop infinite',
			});

		return body;
	}

	loop(): LoopToken | undefined {
		const { pointer } = this;
		const line = pointer.line;

		if (!pointer.token || !pointer.take('LoopKeyword')) return;

		const body = this.readBlock(line);

		return {
			type: 'LoopDeclaration',
			body,
			ctx: pointer.ctx(line),
		};
	}

	forLoop() {}
}
