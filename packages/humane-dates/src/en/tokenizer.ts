import { createFeed, moreFeed } from '../core/feed';
import { pattern, type Token } from '../core/matcher';

const TOKEN = [
  pattern('whitespace', '\\s+'),
  pattern('number', '[0-9]+'),
  pattern('ident', '[a-zA-Z0-9.]+', 'i'),
  pattern('op', '[:]'),
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
