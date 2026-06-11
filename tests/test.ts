import fs from "node:fs";
import jsLegacy from "../lib/js-legacy/index.ts";

// let data = fs.readFileSync("./A.js").toString();
// data = jsLegacy.replaceImportsAndExports("./A.js", data);
// data = jsLegacy.replaceLeadingEmptyLines(data);
// console.log(data);

jsLegacy.replace_Async("./js-lib")
    .then(() => {
        console.log("Done.");
    })
    .catch((err) => {
        console.error(err);
    });