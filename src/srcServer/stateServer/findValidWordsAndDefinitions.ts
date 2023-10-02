import * as R from "remeda";
import dictionary from "./dictionaryWithOrderedKeys.json";

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

function createFindValidWords(dictionary: DictionaryType) {
  return (letters: string) => {
    return R.pipe(
      computeCombinations(letters.toUpperCase()),
      R.map((combination) => [sortABC(combination), combination]),
      R.filter((combinationTuple) => combinationTuple[0] in dictionary),
      R.map((validCombinationTuple) => validCombinationTuple[1]),
      R.flatten()
    );
  };
}

export const findValidWords = createFindValidWords(dictionary);

function stringToPossibleWords(string: string) {
  return Array(string.length - 1)
    .fill(null)
    .map((_, index) => string.substring(0, string.length - index));
}

export function getValidWordLength(string: string, validWords: string[]) {
  return (
    R.pipe(
      string.toUpperCase(),
      (string) => stringToPossibleWords(string),
      R.find((string) => validWords.includes(string))
    )?.length ?? 0
  );
}

export type DictionaryType = typeof dictionary;
type DictionaryKey = keyof DictionaryType;
type DefinitionKey = keyof DictionaryType[DictionaryKey];

function createRetrieveDefinition(dictionary: DictionaryType) {
  return (letters: string) => {
    return dictionary?.[sortABC(letters.toUpperCase()) as DictionaryKey][
      letters.toUpperCase() as DefinitionKey
    ] as string;
  };
}

export const retrieveDefinition = createRetrieveDefinition(dictionary);
