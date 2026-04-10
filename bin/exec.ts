#!/usr/bin/env node

import abDev from "../index.ts";
import abLog from "ab-log";

(async function() {
    await abDev.exec_Async(process.argv.slice(2));
        })()
    .catch((err) => {
        abLog.error('Error:', err);
    });