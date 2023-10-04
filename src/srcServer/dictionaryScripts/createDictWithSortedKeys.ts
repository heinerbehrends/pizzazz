// this file will not run properly when type is set to 'module' in package.json
// don't export from this file because the runtime cannot resolve fs
import * as R from "remeda";
// @ts-ignore-error
import fs from "fs";
// import { dictionary } from "./createDictionaryFromDict";
const wordListFile = fs.readFileSync("./wordList.txt");
const sortABC = (word: string) =>
  R.pipe(
    word,
    (word) => word.split(""),
    R.sort((a, b) => a.localeCompare(b)),
    R.join("")
  );

const toSortedKeysDictionary = (
  dict: Record<string, string[]>,
  string: string
) => {
  const sorted = sortABC(string);
  let result = dict;
  if (sorted in result) {
    result[sorted].push(string);
  } else {
    result[sorted] = [string];
  }
  return result;
};
// @ts-ignore-error
const generateDictionary = (wordListFile: Buffer) =>
  R.pipe(
    wordListFile,
    (buffer) => buffer.toString() as string,
    (string) => string.split("\n"),
    R.map((string) => string.substring(0, string.indexOf(" "))),
    R.reject((el) => el.length > 7 || el.length === 0),
    R.reduce(toSortedKeysDictionary, {})
  );
// { ordered: null }
// { unordered: definition }

const associativeDictionary = generateDictionary(wordListFile);
console.log("hello from createDictWithSortedKeys.ts");
const content = JSON.stringify(associativeDictionary);

fs.writeFile("./dictWithSortedKeys.json", content, console.error);
console.log("File written successfully");
