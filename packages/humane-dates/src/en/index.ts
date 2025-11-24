import { getDateTime } from './ast/date-time';
import { parseDateTime } from './parser';
import { tokenize } from './tokenizer';

export interface FromHumaneDateOptions {
  referenceDate?: Date;
}

export function from(
  input: string,
  { referenceDate = new Date() }: FromHumaneDateOptions = {},
): Date {
  const tokens = tokenize(input);
  const [parsed] = parseDateTime(tokens);
  console.dir(parsed, {
    depth: null,
  });
  const tree = getDateTime(parsed);
  console.dir(tree, {
    depth: null,
  });
  return referenceDate;
}

export type ToHumaneDateOptions = {};

export function to(date: Date): string {}
