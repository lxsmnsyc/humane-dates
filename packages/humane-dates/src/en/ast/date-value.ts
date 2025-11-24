import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { type DateUnitNode, getDateUnit } from './date-unit';

export interface DateValueNode {
  type: 'date-value';
  value: Token;
  unit: DateUnitNode;
}

export function getDateValue(ast: AST | Token): DateValueNode | undefined {
  if (ast.type === 'ast' && ast.kind === 'multi' && ast.tag === 'date-value') {
    // number/singular whitespace unit
    const value = ast.children[0];
    const unit = getDateUnit(ast.children[2]);
    if (unit && value.type === 'token') {
      return {
        type: 'date-value',
        value,
        unit,
      };
    }
  }
  return undefined;
}
