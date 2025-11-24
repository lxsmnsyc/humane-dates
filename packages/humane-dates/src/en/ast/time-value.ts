import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { getTimeUnit, type TimeUnitNode } from './time-unit';

export interface TimeValueNode {
  type: 'time-value';
  value: Token;
  unit: TimeUnitNode;
}

export function getTimeValue(ast: AST | Token): TimeValueNode | undefined {
  if (ast.type === 'ast' && ast.kind === 'multi' && ast.tag === 'time-value') {
    // number/singular whitespace unit
    const value = ast.children[0];
    const unit = getTimeUnit(ast.children[2]);
    if (unit && value.type === 'token') {
      return {
        type: 'time-value',
        value,
        unit,
      };
    }
  }
  return undefined;
}
