// this file will not run properly when type is set to 'module' in package.json
// @ts-ignore-error
const { AsyncDatabase } = require("promised-sqlite3");
// @ts-ignore-error
import fs from "fs";
import * as R from "remeda";
import associative from "../stateServer/associative.json";
import { sortABC } from "../stateServer/findValidWords";

type DictionaryEntry = {
  _id: number;
  en_word: string;
  en_definition: string;
  example: string;
  synonyms: string;
  antonyms: string;
};

(async () => {
  try {
    const db = await AsyncDatabase.open("./eng_dictionary.db");
    const sqlWords = "SELECT * from words WHERE LENGTH(en_word) <= 7";
    const wordRows: DictionaryEntry[] = await db.all(sqlWords);
    const dictionary = R.pipe(
      wordRows,
      R.filter((word) => sortABC(word.en_word) in associative),
      R.reduce(
        (dictionary: { string: string }, row: DictionaryEntry) => ({
          ...dictionary,
          [row.en_word]: row.en_definition,
        }),
        {} as { string: string }
      )
    );
    await fs.writeFile(
      "./dictionary.json",
      JSON.stringify(dictionary),
      console.error
    );
    console.log("file written");
  } catch (err) {
    console.log(err);
  }
})();
