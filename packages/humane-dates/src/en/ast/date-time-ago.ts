import type { AST, ValueAST } from '../../core/token';
import {
  type DateUnitNode,
  getDateUnit,
  getTimeUnit,
  type TimeUnitNode,
} from './keywords';

export interface DateTimeAgoNode {
  type: 'date-time-ago';
  value: ValueAST;
  unit: DateUnitNode | TimeUnitNode;
}

export function getDateTimeAgo(ast: AST): DateTimeAgoNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-time-ago') {
    // number whitespace date-unit/time-unit whitespace ago
    const value = ast.children[0];
    const unit = getDateUnit(ast.children[2]) || getTimeUnit(ast.children[2]);
    if (unit && value.kind === 'value') {
      return {
        type: 'date-time-ago',
        value,
        unit,
      };
    }
  }
  return undefined;
}
