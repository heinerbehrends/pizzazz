import * as R from "remeda";
import { letterValues } from "./components/PizzazzTile";

type Letter = keyof typeof letterValues;

function getLetterScore(letter: Letter) {
  return R.pipe(letterValues, R.prop(letter));
}

function toWordScore(acc: number, score: number, index: number) {
  return index === 4 ? acc + 2 * score : acc + score;
}

export function getWordScore(word: string) {
  return R.pipe(
    word.split("") as Letter[],
    R.map(getLetterScore),
    R.reduce.indexed(toWordScore, 0)
  );
}

export function getMaxScore(wordList: string[]) {
  return R.pipe(wordList, R.map(getWordScore), R.maxBy(R.identity));
}

export function getMaxLength(wordList: string[]) {
  return R.pipe(
    wordList,
    R.map((word) => word.split("")),
    R.map(R.length()),
    R.maxBy(R.identity)
  );
}
