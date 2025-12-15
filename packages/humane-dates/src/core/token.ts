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
  start: number;
  end: number;
}

export interface SingleAST extends BaseAST {
  tag: string;
  kind: 'solo';
  children: AST;
}

export interface MultiAST extends BaseAST {
  tag: string;
  kind: 'multi';
  children: AST[];
}

export interface MaybeAST extends BaseAST {
  kind: 'maybe';
  children?: AST;
}

export interface ValueAST extends BaseAST {
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
          start: result.start,
          end: result.end,
        };
      }
    }
    return undefined;
  };
}

function getFirst(ast: AST[]): AST | undefined {
  for (let i = 0, len = ast.length; i < len; i++) {
    if (ast[i].kind !== 'maybe') {
      return ast[i];
    }
  }
  return undefined;
}

function getLast(ast: AST[]): AST | undefined {
  for (let i = ast.length - 1; i >= 0; i--) {
    if (ast[i].kind !== 'maybe') {
      return ast[i];
    }
  }
  return undefined;
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

    const first = getFirst(results);
    const last = getLast(results);
    if (first && last) {
      return {
        tag,
        kind: 'multi',
        children: results,
        start: first.start,
        end: last.end,
      };
    }
    feed.cursor = cursor;
    return undefined;
  };
}

export function quantifier(
  tag: string,
  matcher: ASTMatcher,
  min = 0,
  max?: number,
): ASTMatcher {
  return feed => {
    const results: AST[] = [];
    const { cursor } = feed;
    let count = 0;
    while (true) {
      if (max != null && count >= max) {
        break;
      }
      const parsed = matcher(feed);
      if (!parsed) {
        break;
      }
      results.push(parsed);
      count += 1;
    }
    if (count >= min) {
      const first = getFirst(results);
      const last = getLast(results);
      if (first && last) {
        return {
          tag,
          kind: 'multi',
          children: results,
          start: first.start,
          end: last.end,
        };
      }
    }
    feed.cursor = cursor;
    return undefined;
  };
}

export function optional<T extends ASTMatcher>(grammar: T): ASTMatcher {
  return (feed: TokenFeed): AST => {
    const result = grammar(feed);
    return {
      kind: 'maybe',
      children: result ?? undefined,
      start: result ? result.start : feed.cursor,
      end: result ? result.end : feed.cursor,
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
          start: current.start,
          end: current.end,
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
