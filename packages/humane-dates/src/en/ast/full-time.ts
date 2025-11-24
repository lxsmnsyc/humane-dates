import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { getHour12, type Hour12FormatNode } from './hour-12';
import { getHour24, type Hour24FormatNode } from './hour-24';
import { getPartialTime, type PartialTimeNode } from './partial-time';

export interface FullTimeNode {
  type: 'full-time';
  value: Hour12FormatNode | Hour24FormatNode | PartialTimeNode | Token;
}

export function getFullTime(ast: AST | Token): FullTimeNode | undefined {
  if (ast.type === 'ast' && ast.kind === 'solo' && ast.tag === 'full-time') {
    const result =
      getHour12(ast.children) ||
      getHour24(ast.children) ||
      getPartialTime(ast.children);
    if (result) {
      return {
        type: 'full-time',
        value: result,
      };
    }
    if (ast.children.type === 'token') {
      return {
        type: 'full-time',
        value: ast.children,
      };
    }
  }
  return undefined;
}
