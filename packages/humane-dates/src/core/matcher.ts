import { eatFeed, type Feed, lookFeed } from './feed';

export interface ASTPosition {
  start: number;
  end: number;
}

export interface Token {
  type: 'token';
  tag: string;
  value: string;
  start: number;
  end: number;
}

export type Matcher = (feed: Feed) => Token | null | undefined;

export function pattern(tag: string, value: string, flags?: string): Matcher {
  const regexp = new RegExp(`^${value}`, flags);
  return feed => {
    const peeked = lookFeed(feed);
    if (regexp.test(peeked)) {
      const result = regexp.exec(peeked);
      const { cursor } = feed;
      if (result != null && eatFeed(feed, result[0])) {
        return {
          type: 'token',
          tag,
          value: result[0],
          start: cursor,
          end: feed.cursor,
        };
      }
    }
    return null;
  };
}
