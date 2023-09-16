const { AsyncDatabase } = require("promised-sqlite3");
import * as R from "remeda";
import associative from "./associative.json";
import fs from "fs";
import { sortABC } from "./findValidWords";
export type DictionaryEntry = {
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

// const sqlDefinition = "SELECT en_definition from words WHERE en_word=?";

// async function getWords() {
//   return db.all(sqlWords, [], (error, rows: { en_word: string }[]) => {
//     if (error) {
//       throw error;
//     }
//     rows.forEach((row) => words.push(row.en_word));
//     // console.log(words);
//   });
// }

// const dictionary = words
//   .filter((word) => word.length > 7)
//   .reduce((accumulator, value) => {
//     let definition = "";
//     db.get(sqlDefinition, [value], (error, row: { en_definition: string }) => {
//       if (error) {
//         console.log(error);
//       }
//       definition = row.en_definition;
//     });
//     console.log(definition);
//     return { ...accumulator, value: definition };
//   }, {});

// console.log(dictionary);
