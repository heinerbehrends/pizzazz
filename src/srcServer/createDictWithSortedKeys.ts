// this file will not run properly when type is set to 'module' in package.json

import * as R from "remeda";
import fs from "fs";

const wordListFile = fs.readFileSync("./wordList.txt");

const sortABC = (word: string) =>
  R.pipe(
    word,
    (word) => word.split(""),
    R.sort((a, b) => a.localeCompare(b)),
    R.join("")
  );

const parseLimit7 = (wordListFile: Buffer) =>
  R.pipe(
    wordListFile,
    (buffer) => buffer.toString(),
    (string) => string.split("\n"),
    R.map((string) => string.substring(0, string.indexOf(" "))),
    R.reject((el) => el.length > 7 || el.length === 0)
  );

export const wordList = parseLimit7(wordListFile);

const toSortedKeysDict = (dict: Record<string, string[]>, string: string) => {
  const resultDict = dict;
  const sortedString = sortABC(string);
  const previousEntry = resultDict[sortedString];
  resultDict[sortedString] = previousEntry
    ? [string, ...previousEntry]
    : [string];
  return resultDict;
};

const associativeDictionary = wordList.reduce(toSortedKeysDict, {});
const content = JSON.stringify(associativeDictionary);

// this file will not run properly when type is set to 'module' in package.json
fs.writeFile("./associated.json", content, console.error);
