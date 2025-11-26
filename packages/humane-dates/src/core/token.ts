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

export interface SingleAST {
  tag: string;
  kind: 'solo';
  children: AST;
}

export interface MultiAST {
  tag: string;
  kind: 'multi';
  children: AST[];
}

export interface MaybeAST {
  kind: 'maybe';
  children?: AST;
}

export interface ValueAST {
  kind: 'value';
  tag: string;
  children: string;
}

export type AST = SingleAST | MultiAST | MaybeAST | ValueAST;

export type ASTMatcher = (feed: TokenFeed) => AST | undefined;

export function either<T extends ASTMatcher[]>(...args: T): ASTMatcher {
  return (feed: TokenFeed) => {
    for (let i = 0, len = args.length; i < len; i++) {
      const result = args[i](feed);

      if (result) {
        return result;
      }
    }
    return undefined;
  };
}

export function alternation<T extends ASTMatcher[]>(
  tag: string,
  grammar: T,
): ASTMatcher {
  return (feed: TokenFeed) => {
    for (let i = 0, len = grammar.length; i < len; i++) {
      const result = grammar[i](feed);

      if (result) {
        return {
          tag,
          kind: 'solo',
          children: result,
        };
      }
    }
    return undefined;
  };
}

export function sequence<T extends ASTMatcher[]>(
  tag: string,
  grammar: T,
): ASTMatcher {
  return (feed: TokenFeed): AST | undefined => {
    const results: AST[] = [];
    const { cursor } = feed;
    for (let i = 0, len = grammar.length; i < len; i += 1) {
      const result = grammar[i](feed);

      if (result != null) {
        results.push(result);
      } else {
        feed.cursor = cursor;
        return undefined;
      }
    }
    return {
      tag,
      kind: 'multi',
      children: results,
    };
  };
}

export function optional<T extends ASTMatcher>(grammar: T): ASTMatcher {
  return (feed: TokenFeed): AST => {
    const result = grammar(feed);
    return {
      kind: 'maybe',
      children: result ?? undefined,
    };
  };
}

export function match(
  tag: string,
  filter: (token: Token) => boolean,
): ASTMatcher {
  return (feed: TokenFeed) => {
    if (feed.cursor < feed.size) {
      const current = feed.source[feed.cursor];
      if (filter(current)) {
        feed.cursor++;
        return {
          tag,
          kind: 'value',
          children: current.value,
        };
      }
    }
    return undefined;
  };
}

export function tag(tag: string, target: string): ASTMatcher {
  return match(tag, token => token.tag === target);
}

export function literal(
  tag: string,
  target: string,
  value: string,
): ASTMatcher {
  return match(tag, token => token.tag === target && token.value === value);
}

export function regex(
  tag: string,
  target: string,
  pattern: RegExp,
): ASTMatcher {
  return match(tag, token => token.tag === target && pattern.test(token.value));
}
