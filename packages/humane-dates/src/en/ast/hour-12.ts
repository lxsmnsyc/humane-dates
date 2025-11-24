import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { getMinutesPart, type MinutesPartNode } from './minutes-part';

export interface Hour12FormatNode {
  type: 'hour-12';
  hours: Token;
  minutes: MinutesPartNode | undefined;
  meridiem: Token;
}

export function getHour12(ast: AST | Token): Hour12FormatNode | undefined {
  if (ast.type === 'ast' && ast.kind === 'multi' && ast.tag === 'hour-12') {
    const [hours, minutesPart, /* whitespace */ , meridiem] = ast.children;
    if (hours.type === 'ast' || meridiem.type === 'ast') {
      return undefined;
    }
    return {
      type: 'hour-12',
      hours,
      minutes: getMinutesPart(minutesPart),
      meridiem: meridiem,
    };
  }
  return undefined;
}
