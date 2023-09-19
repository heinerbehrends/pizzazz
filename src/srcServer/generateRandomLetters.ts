/* eslint no-underscore-dangle: off */
import * as R from "remeda";

export const letterDistributionStd = {
  e: 12,
  a: 9,
  i: 9,
  o: 8,
  n: 6,
  r: 6,
  t: 6,
  l: 4,
  s: 4,
  u: 4,
  d: 4,
  g: 3,
  b: 2,
  c: 2,
  m: 2,
  p: 2,
  f: 2,
  h: 2,
  v: 2,
  w: 2,
  y: 2,
  k: 1,
  j: 1,
  x: 1,
  q: 1,
  z: 1,
  8: 2,
};

const vowels = ["a", "e", "i", "o", "u"];

export const bagOfLetters = R.pipe(
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

function replaceWildcard(randomLetters: string[]) {
  if (hasTwoWildcards(randomLetters))
    return randomLetters
      .join("")
      .replace(
        "8",
        grabRandom(R.reject(bagOfLetters as any, (el) => el === "8"))
      )
      .split("");
  return randomLetters;
}

export function generateRandomLetters() {
  return R.pipe(
    Array(7),
    R.map.indexed(grabTwoOrThreeVowels),
    R.shuffle(),
    replaceWildcard,
    R.join("")
  );
}
