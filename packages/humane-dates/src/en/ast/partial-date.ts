import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import type { DateUnitNode } from './date-unit';
import { type DaysNode, getDays } from './days';
import { getMonthPart, type MonthPartNode } from './month-part';
import { getMonths, type MonthsNode } from './months';

export interface PartialDateTargetNode {
  type: 'partial-date-target';
  value: MonthPartNode | DateUnitNode | MonthsNode | DaysNode | Token;
}

function getPartialDateTarget(
  ast: AST | Token,
): PartialDateTargetNode | undefined {
  if (
    ast.type === 'ast' &&
    ast.kind === 'solo' &&
    ast.tag === 'partial-date-target'
  ) {
    if (ast.children.type === 'token') {
      return {
        type: 'partial-date-target',
        value: ast.children,
      };
    }
    const result =
      getMonthPart(ast.children) ||
      getMonths(ast.children) ||
      getDays(ast.children);
    if (result) {
      return {
        type: 'partial-date-target',
        value: result,
      };
    }
  }
  return undefined;
}

export interface PartialDateNode {
  type: 'partial-date';
  partialComplete: Token;
  value: PartialDateTargetNode;
}

export function getPartialDate(ast: AST | Token): PartialDateNode | undefined {
  if (
    ast.type === 'ast' &&
    ast.kind === 'multi' &&
    ast.tag === 'partial-date'
  ) {
    const [partialComplete, /* whitespace */ , target] = ast.children;
    const currentTarget = getPartialDateTarget(target);
    if (currentTarget && partialComplete.type === 'token') {
      return {
        type: 'partial-date',
        partialComplete,
        value: currentTarget,
      };
    }
  }
  return undefined;
}
