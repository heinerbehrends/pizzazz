// script to create dictionary.json with ts-node
// this file will not run properly when type is set to 'module' in package.json
// @ts-ignore-error
// @ts-ignore-error
import fs from "fs";
import * as R from "remeda";

const dictFile = fs.readFileSync("./Dict.txt");

function createDictionary(dictFile: any) {
  return R.fromPairs(
    R.pipe(
      dictFile,
      (dictFile) => dictFile.toString() as string,
      (dictString) => dictString.split("\n"),
      // last line is empty
      R.dropLast(1),
      // remove the random " characters
      R.map((dictLine) => dictLine.replace(/"/g, "")),
      // split the string into a tuple of [word, definition]
      R.map((dictLine) => dictLine.split("\t")),
      // remove the words with more than 7 letters
      R.filter((dictLineTuple) => dictLineTuple[0].length <= 7),
      // remove the part after the first [ in the definition
      R.map((dictLineTuple) => [
        dictLineTuple[0],
        dictLineTuple[1].split("[")?.[0],
      ])
    )
  );
}

export const dictionary = createDictionary(dictFile);

fs.writeFile(
  "./dictionary.json",
  JSON.stringify(createDictionary(dictFile)),
  console.error
);
console.log("file written");
