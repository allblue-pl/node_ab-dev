#!/usr/bin/env node

const
    abLog = require('ab-log'),

    abDev = require('../.')
;

(async function() {
    await abDev.execAsync(process.argv.slice(2));
        })()
    .catch((err) => {
        abLog.error('Error:', err);
    });