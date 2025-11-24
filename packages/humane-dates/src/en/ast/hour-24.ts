import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { getMinutesPart, type MinutesPartNode } from './minutes-part';

export interface Hour24FormatNode {
  type: 'hour-24';
  hours: Token;
  minutes: MinutesPartNode;
}

export function getHour24(ast: AST | Token): Hour24FormatNode | undefined {
  if (ast.type === 'ast' && ast.kind === 'multi' && ast.tag === 'hour-24') {
    const [hours, minutesPart] = ast.children;
    if (hours.type === 'ast') {
      return undefined;
    }
    const minutes = getMinutesPart(minutesPart);
    if (minutes) {
      return {
        type: 'hour-24',
        hours,
        minutes,
      };
    }
  }
  return undefined;
}
