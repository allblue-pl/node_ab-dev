#!/usr/bin/env node

const
    abLog = require('ab-log'),

    abDev = require('../.')
;

(async function() {
    await abDev.exec_Async(process.argv.slice(2));
        })()
    .catch((err) => {
        abLog.error('Error:', err);
    });