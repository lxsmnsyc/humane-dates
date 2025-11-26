import type { AST, ValueAST } from '../../core/token';
import { getTimeUnit, type TimeUnitNode } from './keywords';

export interface TimeValueNode {
  type: 'time-value';
  value: ValueAST;
  unit: TimeUnitNode;
}

export function getTimeValue(ast: AST): TimeValueNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'time-value') {
    // number/singular whitespace unit
    const value = ast.children[0];
    const unit = getTimeUnit(ast.children[2]);
    if (unit && value.kind === 'value') {
      return {
        type: 'time-value',
        value,
        unit,
      };
    }
  }
  return undefined;
}
