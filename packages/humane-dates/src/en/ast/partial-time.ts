import type { AST } from '../../core/token';
import {
  type CompleteTimeNode,
  getCompleteTime,
  getPartialComplete,
  getTimeUnit,
  type PartialCompleteNode,
  type TimeUnitNode,
} from './keywords';

export interface PartialTimeNode {
  type: 'partial-time';
  relation: PartialCompleteNode;
  value: TimeUnitNode | CompleteTimeNode | PartialTimeNode;
}

export function getPartialTime(ast: AST): PartialTimeNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'partial-time') {
    // [partialComplete, /* whitespace */ , target]
    const relation = getPartialComplete(ast.children[0]);
    const result =
      getTimeUnit(ast.children[2]) ||
      getCompleteTime(ast.children[2]) ||
      getPartialTime(ast.children[2]);
    if (result && relation) {
      return {
        type: 'partial-time',
        relation,
        value: result,
      };
    }
  }
  return undefined;
}
