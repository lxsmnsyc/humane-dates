import type { Token } from '../core/matcher';
import { tokenize } from '../core/tokenizer';
import { parseDateTime } from './parser';

function cleanTokens(tokens: Token[]): Token[] {
  const result: Token[] = [];
  for (let i = 0, len = tokens.length; i < len; i++) {
    const token = tokens[i];
    switch (token.tag) {
      case 'ignore':
      case 'whitespace':
        break;
      default:
        result.push(token);
        break;
    }
  }
  return result;
}

export interface FromHumaneDateOptions {
  referenceDate?: Date;
}

export function from(
  input: string,
  {
    referenceDate = new Date(),
  }: FromHumaneDateOptions = {},
): Date {
  const tokens = cleanTokens(tokenize(input));
  const [parsed] = parseDateTime(tokens);
  console.dir(parsed, {
    depth: null,
  });
  return referenceDate;
}

export interface ToHumaneDateOptions {
}

export function to(date: Date): string {}
