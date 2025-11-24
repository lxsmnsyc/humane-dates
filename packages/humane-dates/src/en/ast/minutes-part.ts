import type { Token } from '../../core/matcher';
import type { AST } from '../../core/token';
import { extractMaybe } from './base';
import { getSecondsPart, type SecondsPartNode } from './seconds-part';

export interface MinutesPartNode {
  type: 'minutes-part';
  minutes: Token;
  seconds: SecondsPartNode | undefined;
}

export function getMinutesPart(ast: AST | Token): MinutesPartNode | undefined {
  const current = extractMaybe(ast);
  if (
    current &&
    current.type === 'ast' &&
    current.kind === 'multi' &&
    current.tag === 'minutes-part'
  ) {
    // whitespace colon whitespace minutes secondsPart
    const minutes = current.children[3];
    const secondsPart = current.children[4];
    if (minutes.type === 'ast') {
      return undefined;
    }
    return {
      type: 'minutes-part',
      minutes,
      seconds: getSecondsPart(secondsPart),
    };
  }
  return undefined;
}
