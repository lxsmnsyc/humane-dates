import type { Token } from './matcher';

export interface TokenFeed {
  source: Token[];
  size: number;
  cursor: number;
}

export function createTokenFeed(source: Token[]): TokenFeed {
  return {
    source,
    size: source.length,
    cursor: 0,
  };
}

export interface BaseAST {
  type: 'ast';
  tag: string;
}

export interface SingleAST {
  type: 'ast';
  tag: string;
  kind: 'solo';
  children: AST | Token;
}

export interface MultiAST {
  type: 'ast';
  tag: string;
  kind: 'multi';
  children: (AST | Token)[];
}

export interface MaybeAST {
  type: 'ast';
  tag: string;
  kind: 'maybe';
  children?: AST | Token;
}

export type AST = SingleAST | MultiAST | MaybeAST;

export type ASTMatcher = (feed: TokenFeed) => AST | Token | null;

export function alternation<T extends ASTMatcher[]>(
  tag: string,
  grammar: T,
): ASTMatcher {
  return (feed: TokenFeed) => {
    for (let i = 0, len = grammar.length; i < len; i++) {
      const result = grammar[i](feed);

      if (result) {
        return {
          type: 'ast',
          tag,
          kind: 'solo',
          children: result,
        };
      }
    }
    return null;
  };
}

export function sequence<T extends ASTMatcher[]>(
  tag: string,
  grammar: T,
): ASTMatcher {
  return (feed: TokenFeed): AST | null => {
    const results: (Token | AST)[] = [];
    const { cursor } = feed;
    for (let i = 0, len = grammar.length; i < len; i += 1) {
      const result = grammar[i](feed);

      if (result != null) {
        results.push(result);
      } else {
        feed.cursor = cursor;
        return null;
      }
    }
    return {
      type: 'ast',
      tag,
      kind: 'multi',
      children: results,
    };
  };
}

export function optional<T extends ASTMatcher>(
  tag: string,
  grammar: T,
): ASTMatcher {
  return (feed: TokenFeed): AST => {
    const result = grammar(feed);
    return {
      type: 'ast',
      tag: `optional(${tag})`,
      kind: 'maybe',
      children: result ?? undefined,
    };
  };
}

export function match(filter: (token: Token) => boolean): ASTMatcher {
  return (feed: TokenFeed) => {
    if (feed.cursor < feed.size) {
      const current = feed.source[feed.cursor];
      if (filter(current)) {
        feed.cursor++;
        return current;
      }
    }
    return null;
  };
}

export function tag(tag: string): ASTMatcher {
  return match(token => token.tag === tag);
}

export function literal(tag: string, value: string): ASTMatcher {
  return match(token => token.tag === tag && token.value === value);
}

export function regex(tag: string, pattern: RegExp): ASTMatcher {
  return match(token => token.tag === tag && pattern.test(token.value));
}
