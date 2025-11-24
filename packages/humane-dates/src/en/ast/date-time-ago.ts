import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { type DateUnitNode, getDateUnit } from './date-unit';
import { getTimeUnit, type TimeUnitNode } from './time-unit';

export interface DateTimeAgoNode {
  type: 'date-time-ago';
  value: Token;
  unit: DateUnitNode | TimeUnitNode;
}

export function getDateTimeAgo(ast: AST | Token): DateTimeAgoNode | undefined {
  if (
    ast.type === 'ast' &&
    ast.kind === 'multi' &&
    ast.tag === 'date-time-ago'
  ) {
    // number whitespace date-unit/time-unit whitespace ago
    const value = ast.children[0];
    const unit = getDateUnit(ast.children[2]) || getTimeUnit(ast.children[2]);
    if (unit && value.type === 'token') {
      return {
        type: 'date-time-ago',
        value,
        unit,
      };
    }
  }
  return undefined;
}
