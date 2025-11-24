import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { getTimeUnit, type TimeUnitNode } from './time-unit';

export interface PartialTimeNode {
  type: 'partial-time';
  partialComplete: Token;
  timeUnit: TimeUnitNode;
}

export function getPartialTime(ast: AST | Token): PartialTimeNode | undefined {
  if (
    ast.type === 'ast' &&
    ast.kind === 'multi' &&
    ast.tag === 'partial-time'
  ) {
    const [partialComplete, /* whitespace */ , timeUnit] = ast.children;
    if (partialComplete.type === 'ast') {
      return undefined;
    }
    const result = getTimeUnit(timeUnit);
    if (result) {
      return {
        type: 'partial-time',
        partialComplete,
        timeUnit: result,
      };
    }
  }
  return undefined;
}
