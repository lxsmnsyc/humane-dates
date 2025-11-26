import type { AST } from '../../core/token';
import { getHour12, type Hour12FormatNode } from './hour-12';
import { getHour24, type Hour24FormatNode } from './hour-24';
import { type CompleteTimeNode, getCompleteTime } from './keywords';

export interface FullTimeNode {
  type: 'full-time';
  value: Hour12FormatNode | Hour24FormatNode | CompleteTimeNode;
}

export function getFullTime(ast: AST): FullTimeNode | undefined {
  if (ast.kind === 'solo' && ast.tag === 'full-time') {
    const result =
      getHour12(ast.children) ||
      getHour24(ast.children) ||
      getCompleteTime(ast);
    if (result) {
      return {
        type: 'full-time',
        value: result,
      };
    }
  }
  return undefined;
}
