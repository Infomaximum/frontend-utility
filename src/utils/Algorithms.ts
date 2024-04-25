import sha256 from "crypto-js/sha256";

function _runDfs(
  element: any,
  expandPredicate: any,
  whilePredicate: any,
  pick: any,
) {
  if (whilePredicate(element)) {
    let result = [pick(element)];
    const frontier = expandPredicate(element);
    frontier.forEach(
      (frontElement: any) =>
        (result = result.concat(
          _runDfs(frontElement, expandPredicate, whilePredicate, pick),
        )),
    );
    return result;
  }
  return [];
}

export function runDfs(
  root: any,
  expandPredicate: any,
  whilePredicate: any,
  pick: any,
) {
  return _runDfs(root, expandPredicate, whilePredicate, pick);
}

export const hashPassword = (password: string): string =>
  sha256(password).toString();
