import type { AST, ValueAST } from '../../core/token';
import { extractMaybe } from './base';
import { getSecondsPart, type SecondsPartNode } from './seconds-part';

export interface MinutesPartNode {
  type: 'minutes-part';
  minutes: ValueAST;
  seconds: SecondsPartNode | undefined;
}

export function getMinutesPart(ast: AST): MinutesPartNode | undefined {
  const current = extractMaybe(ast);
  if (current && current.kind === 'multi' && current.tag === 'minutes-part') {
    // whitespace colon whitespace minutes secondsPart
    const minutes = current.children[3];
    if (minutes.kind === 'value') {
      return {
        type: 'minutes-part',
        minutes,
        seconds: getSecondsPart(current.children[4]),
      };
    }
  }
  return undefined;
}
