import { type ExtractedHumaneDate, extract } from './extract';
import { categorize } from './lexer';
import { parseDateTime } from './parser';
import { tokenize } from './tokenizer';

export interface ParseHumaneDateOptions {
  referenceDate?: Date;
}

export function parse(
  input: string,
  { referenceDate = new Date() }: FromHumaneDateOptions = {},
): ExtractedHumaneDate[] {
  const info: ExtractedHumaneDate[] = [];
  const tokens = tokenize(input);
  const parsedNodes = categorize(tokens);

  for (let i = 0, len = parsedNodes.length; i < len; i++) {
    const node = parsedNodes[i];
    const tree = parseDateTime(node);
    if (tree) {
      info.push(extract(tree, referenceDate));
    }
  }

  return info;
}

export interface FromHumaneDateOptions {
  referenceDate?: Date;
}

export function from(
  input: string,
  { referenceDate = new Date() }: FromHumaneDateOptions = {},
): Date[] {
  const dates: Date[] = [];
  const results = parse(input, {
    referenceDate,
  });

  for (let i = 0, len = results.length; i < len; i++) {
    dates.push(results[i].date);
  }
  return dates;
}
