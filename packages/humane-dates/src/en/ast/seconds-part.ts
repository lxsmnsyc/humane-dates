import type { AST, ValueAST } from '../../core/token';
import { extractMaybe } from './base';

export interface SecondsPartNode {
  type: 'seconds-part';
  value: ValueAST;
}

export function getSecondsPart(ast: AST): SecondsPartNode | undefined {
  const current = extractMaybe(ast);
  if (current && current.kind === 'multi' && current.tag === 'seconds-part') {
    // whitespace colon whitespace seconds
    const seconds = current.children[3];
    if (seconds.kind === 'value') {
      return {
        type: 'seconds-part',
        value: seconds,
      };
    }
  }
  return undefined;
}
