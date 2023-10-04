/* eslint no-underscore-dangle: off */
import * as R from "remeda";
import { findValidWords } from "./findValidWordsAndDefinitions";
import { LETTER_DISTRIBUTION, VOWELS } from "./constants";

const bagOfLetters = R.pipe(
  Object.keys(LETTER_DISTRIBUTION),
  R.map((letter) =>
    letter.repeat(
      LETTER_DISTRIBUTION[letter as keyof typeof LETTER_DISTRIBUTION]
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
    R.filter((letter: string) => VOWELS.includes(letter)),
    grabRandom
  );
}

function getRandomConsonant() {
  return R.pipe(
    bagOfLetters as any,
    R.filter((letter: string) => !VOWELS.includes(letter)),
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
