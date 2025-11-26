import type { AST, ValueAST } from '../../core/token';
import {
  type DateUnitNode,
  getDateUnit,
  getTimeUnit,
  type TimeUnitNode,
} from './keywords';

export interface InDateTimeNode {
  type: 'in-date-time';
  value: ValueAST;
  unit: DateUnitNode | TimeUnitNode;
}

export function getInDateTime(ast: AST): InDateTimeNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'in-date-time') {
    // in whitespace number whitespace date-unit/time-unit
    const value = ast.children[2];
    const unit = getDateUnit(ast.children[4]) || getTimeUnit(ast.children[4]);
    if (unit && value.kind === 'value') {
      return {
        type: 'in-date-time',
        value,
        unit,
      };
    }
  }
  return undefined;
}
