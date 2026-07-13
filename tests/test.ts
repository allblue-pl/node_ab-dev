import fs from "node:fs";
import { abJSLegacy } from "@allblue/ab-ts-parser";

// let data = fs.readFileSync("./A.js").toString();
// data = jsLegacy.replaceImportsAndExports("./A.js", data);
// data = jsLegacy.replaceLeadingEmptyLines(data);
// console.log(data);

abJSLegacy.replace_Async("./test-lib")
    .then(() => {
        console.log("Done.");
    })
    .catch((err) => {
        console.error(err);
    });