import { createFeed, moreFeed } from './feed';
import { pattern, type Token } from './matcher';

const TOKEN = [
  pattern('whitespace', '\\s+'),
  pattern('number', '[0-9]+'),
  pattern('ident', '\\w+', 'i'),
  pattern('op', '[:,.\\-+\\\\\\/@]'),
  pattern('ignore', '.'),
];

export function tokenize(input: string) {
  const tokens: Token[] = [];
  const feed = createFeed(input);
  const len = TOKEN.length;
  while (moreFeed(feed)) {
    for (let i = 0; i < len; i++) {
      const token = TOKEN[i](feed);
      if (token) {
        tokens.push(token);
        break;
      }
    }
  }
  return tokens;
}
