import * as R from "remeda";
import dictWithSortedKeys from "../associative.json";

export function sortABC(word: string) {
  return R.pipe(
    word,
    (word) => word.split(""),
    R.sort((a, b) => a.localeCompare(b)),
    R.join("")
  );
}

function computeCombinations(string: string) {
  const combine = (active: string, rest: string, array: string[]) => {
    if (!active && !rest) {
      return [];
    }
    if (!rest) {
      array.push(active);
    } else {
      combine(active + rest[0], rest.slice(1), array);
      combine(active, rest.slice(1), array);
    }
    const combinations = array.filter((combination) => combination.length > 1);
    return [...new Set(combinations)];
  };
  return combine("", string, []);
}

export function findValidWords(
  letters: string,
  dict: Record<string, string[]>
) {
  return R.pipe(
    R.map(computeCombinations(letters.toUpperCase()), sortABC),
    R.filter((combination) => combination in dict),
    R.map(
      (validSorted) =>
        dictWithSortedKeys[validSorted as keyof typeof dictWithSortedKeys]
    ),
    R.flatten()
  );
}

function stringToPossibleWords(string: string) {
  return Array(string.length - 1)
    .fill(null)
    .map((_, index) => string.substring(0, string.length - index));
}

export function getValidWordLength(string: string) {
  return (
    R.pipe(
      string.toUpperCase(),
      (string) => stringToPossibleWords(string),
      R.find((string) =>
        findValidWords(string, dictWithSortedKeys).includes(string)
      )
    )?.length || 0
  );
}
