import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { type FullTimeNode, getFullTime } from './full-time';

export interface AtTimeNode {
  type: 'at-time';
  value: FullTimeNode;
}

export function getAtTime(ast: AST | Token): AtTimeNode | undefined {
  if (ast.type === 'ast' && ast.kind === 'multi' && ast.tag === 'at-time') {
    // [at, whitespace, value]
    const value = getFullTime(ast.children[2]);
    if (value) {
      return {
        type: 'at-time',
        value,
      };
    }
  }
  return undefined;
}
