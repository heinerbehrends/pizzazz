/* eslint no-underscore-dangle: off */
import * as R from "remeda";
import { findValidWords } from "./findValidWordsAndDefinitions";

const letterDistributionStd = {
  A: 9,
  B: 2,
  C: 2,
  D: 4,
  E: 12,
  F: 2,
  G: 3,
  H: 2,
  I: 9,
  J: 1,
  K: 1,
  L: 4,
  M: 2,
  N: 6,
  O: 8,
  P: 2,
  Q: 1,
  R: 6,
  S: 4,
  T: 6,
  U: 4,
  V: 2,
  W: 2,
  X: 1,
  Y: 2,
  Z: 1,
  8: 2,
};

const vowels = ["A", "E", "I", "O", "U"];

const bagOfLetters = R.pipe(
  Object.keys(letterDistributionStd),
  R.map((letter) =>
    letter.repeat(
      letterDistributionStd[letter as keyof typeof letterDistributionStd]
    )
  ),
  R.map((repeatedLetters) => repeatedLetters.split("")),
  R.flatten
);

function getRandomIndex(strArr: any[]) {
  return Math.floor(Math.random() * strArr.length);
}

function grabRandom<Type>(array: Array<Type>) {
  return array[getRandomIndex(array)];
}

function getRandomVowel() {
  return R.pipe(
    bagOfLetters as any,
    R.filter((letter: string) => vowels.includes(letter)),
    grabRandom
  );
}

function getRandomConsonant() {
  return R.pipe(
    bagOfLetters as any,
    R.filter((letter: string) => !vowels.includes(letter)),
    grabRandom
  );
}

function randomTwoOrThree() {
  return Math.random() < 0.7 ? 3 : 2;
}

function grabTwoOrThreeVowels(_: any, index: number) {
  return index < randomTwoOrThree() ? getRandomVowel() : getRandomConsonant();
}

function hasTwoWildcards(randomLetters: string[]) {
  return R.pipe(
    randomLetters,
    R.countBy((el) => R.equals(el, "8")),
    R.equals(2)
  );
}

function limitToOneWildcard(randomLetters: string) {
  if (hasTwoWildcards(randomLetters.split("")))
    return randomLetters.replace(
      "8",
      grabRandom(R.reject(bagOfLetters as any, (el) => el === "8"))
    );
  return randomLetters;
}

export function generateRandomLetters(): string {
  return R.pipe(
    Array(7),
    R.map.indexed(grabTwoOrThreeVowels),
    R.shuffle(),
    R.join(""),
    limitToOneWildcard
  );
}
export function generateLettersWithValidWords(
  minimum: number
): [string, string[]] {
  const randomLetters = generateRandomLetters();
  const validWords = findValidWords(randomLetters);
  if (validWords.length < minimum) {
    return generateLettersWithValidWords(minimum);
  }
  return [randomLetters, validWords];
}
