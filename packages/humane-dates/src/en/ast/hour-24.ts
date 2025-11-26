import type { AST, ValueAST } from '../../core/token';
import { getMinutesPart, type MinutesPartNode } from './minutes-part';

export interface Hour24FormatNode {
  type: 'hour-24-clock';
  hours: ValueAST;
  minutes: MinutesPartNode;
}

export function getHour24(ast: AST): Hour24FormatNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'hour-24-clock') {
    const [hours, minutesPart] = ast.children;
    if (hours.kind !== 'value') {
      return undefined;
    }
    const minutes = getMinutesPart(minutesPart);
    if (minutes) {
      return {
        type: 'hour-24-clock',
        hours,
        minutes,
      };
    }
  }
  return undefined;
}
