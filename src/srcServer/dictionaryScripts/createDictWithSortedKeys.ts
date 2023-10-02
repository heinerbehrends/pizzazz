// this file will not run properly when type is set to 'module' in package.json
// don't export from this file because the runtime cannot resolve fs
import * as R from "remeda";
// @ts-ignore-error
import fs from "fs";
import { dictionary } from "./createDictionaryFromDict";
const wordListFile = fs.readFileSync("./wordList.txt");

const sortABC = (word: string) =>
  R.pipe(
    word,
    (word) => word.split(""),
    R.sort((a, b) => a.localeCompare(b)),
    R.join("")
  );

const toSortedKeysDictionary = (
  dict: Record<string, Record<string, string>>,
  string: string
) => {
  const resultDict = dict;
  const sortedString = sortABC(string);
  const previousEntry = resultDict[sortedString];
  resultDict[sortedString] = previousEntry
    ? {
        [string]: dictionary[string as keyof typeof dictionary],
        ...previousEntry,
      }
    : { [string]: dictionary[string as keyof typeof dictionary] };
  return resultDict;
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

const associativeDictionary = generateDictionary(wordListFile);
const content = JSON.stringify(associativeDictionary);

fs.writeFile("./dictWithSortedKeys.json", content, console.error);
console.log("File written successfully");
