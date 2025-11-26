import type { AST } from '../../core/token';
import { type FullDateNode, getFullDate } from './full-date';

export interface OnDateNode {
  type: 'on-date';
  value: FullDateNode;
}

export function getOnDate(ast: AST): OnDateNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'on-date') {
    // on whitespace full-date
    const result = getFullDate(ast.children[2]);
    if (result) {
      return {
        type: 'on-date',
        value: result,
      };
    }
  }
  return undefined;
}
