import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { extractMaybe } from './base';

export interface SecondsPartNode {
  type: 'seconds-part';
  value: Token;
}

export function getSecondsPart(ast: AST | Token): SecondsPartNode | undefined {
  const current = extractMaybe(ast);
  if (
    current &&
    current.type === 'ast' &&
    current.kind === 'multi' &&
    current.tag === 'seconds-part'
  ) {
    // whitespace colon whitespace seconds
    const seconds = current.children[4];
    if (seconds.type === 'token') {
      return {
        type: 'seconds-part',
        value: seconds,
      };
    }
  }
  return undefined;
}
