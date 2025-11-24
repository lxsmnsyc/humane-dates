import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { type DateUnitNode, getDateUnit } from './date-unit';
import { getTimeUnit, type TimeUnitNode } from './time-unit';

export interface InDateTimeNode {
  type: 'in-date-time';
  value: Token;
  unit: DateUnitNode | TimeUnitNode;
}

export function getInDateTime(ast: AST | Token): InDateTimeNode | undefined {
  if (
    ast.type === 'ast' &&
    ast.kind === 'multi' &&
    ast.tag === 'in-date-time'
  ) {
    // in whitespace number whitespace date-unit/time-unit
    const value = ast.children[2];
    const unit = getDateUnit(ast.children[4]) || getTimeUnit(ast.children[4]);
    if (unit && value.type === 'token') {
      return {
        type: 'in-date-time',
        value,
        unit,
      };
    }
  }
  return undefined;
}
