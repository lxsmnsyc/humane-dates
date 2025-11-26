import type { AST, ValueAST } from '../../core/token';
import { getMinutesPart, type MinutesPartNode } from './minutes-part';

export interface MeridiemNode {
  type: 'meridiem';
  value: ValueAST;
}

function getMeridiem(ast: AST): MeridiemNode | undefined {
  if (
    ast.kind === 'solo' &&
    ast.tag === 'meridiem' &&
    ast.children.kind === 'value'
  ) {
    return {
      type: 'meridiem',
      value: ast.children,
    };
  }
  return undefined;
}

export interface Hour12FormatNode {
  type: 'hour-12-clock';
  hours: ValueAST;
  minutes: MinutesPartNode | undefined;
  meridiem: MeridiemNode;
}

export function getHour12(ast: AST): Hour12FormatNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'hour-12-clock') {
    // hours minutes-part whitespace meridiem
    const hours = ast.children[0];
    const meridiem = getMeridiem(ast.children[3]);
    if (hours.kind === 'value' && meridiem) {
      return {
        type: 'hour-12-clock',
        hours,
        minutes: getMinutesPart(ast.children[1]),
        meridiem: meridiem,
      };
    }
  }
  return undefined;
}
