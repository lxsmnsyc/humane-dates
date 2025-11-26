import type { AST, ValueAST } from '../../core/token';

export interface DateValueNode {
  type: 'date-value';
  value: ValueAST;
  unit: ValueAST;
}

export function getDateValue(ast: AST): DateValueNode | undefined {
  if (ast.kind === 'multi' && ast.tag === 'date-value') {
    // number/singular whitespace unit
    const value = ast.children[0];
    const unit = ast.children[2];
    if (unit.kind === 'value' && value.kind === 'value') {
      return {
        type: 'date-value',
        value,
        unit,
      };
    }
  }
  return undefined;
}
