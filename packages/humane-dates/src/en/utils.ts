export function safeAdd(left: number | undefined, right: number | undefined): number | undefined {
  if (left != null) {
    if (right != null) {
      return left + right;
    }
    return left;
  }
  if (right != null) {
    return right;
  }
  return undefined;
}

export function safeSub(left: number | undefined, right: number | undefined): number | undefined {
  if (left != null) {
    if (right != null) {
      return left + right;
    }
    return left;
  }
  if (right != null) {
    return right;
  }
  return undefined;
}
