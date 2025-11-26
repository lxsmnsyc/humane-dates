import type { AST, ValueAST } from '../../core/token';

export type Keywords =
  | 'complete'
  | 'complete-time'
  | 'complete-date'
  | 'date-unit'
  | 'time-unit'
  | 'partial-relation'
  | 'partial-complete'
  | 'months'
  | 'days';

export interface KeywordNode<Key extends Keywords> {
  type: Key;
  value: ValueAST;
}

export type ASTTransformer<T> = (ast: AST) => T | undefined;

function getKeyword<Key extends Keywords>(
  key: Key,
): ASTTransformer<KeywordNode<Key>> {
  return ast => {
    if (
      ast.kind === 'solo' &&
      ast.tag === key &&
      ast.children.kind === 'value'
    ) {
      return {
        type: key,
        value: ast.children,
      };
    }
    return undefined;
  };
}

export type CompleteNode = KeywordNode<'complete'>;
export type CompleteTimeNode = KeywordNode<'complete-time'>;
export type CompleteDateNode = KeywordNode<'complete-date'>;
export type TimeUnitNode = KeywordNode<'time-unit'>;
export type DateUnitNode = KeywordNode<'date-unit'>;
export type PartialRelationNode = KeywordNode<'partial-relation'>;
export type PartialCompleteNode = KeywordNode<'partial-complete'>;
export type MonthsNode = KeywordNode<'months'>;
export type DaysNode = KeywordNode<'days'>;

export const getComplete = getKeyword('complete');
export const getCompleteTime = getKeyword('complete-time');
export const getCompleteDate = getKeyword('complete-date');
export const getTimeUnit = getKeyword('time-unit');
export const getDateUnit = getKeyword('date-unit');
export const getPartialRelation = getKeyword('partial-relation');
export const getPartialComplete = getKeyword('partial-complete');
export const getMonths = getKeyword('months');
export const getDays = getKeyword('days');
