'use strict';

const
    fs = require('fs'),
    path = require('path'),

    check = require('./check'),
    installAsync = require('./installAsync')
;

async function exec_Async(args) {
    let actionTypes = [ 'install', 'check', '-v' ];

    if (args.length < 0) {
        console.log('Action not set. Available actions: ' + actionTypes);
        return;
    }

    /* Action */
    if (!actionTypes.includes(args[0])) {
        console.log('Action not found. Available actions: ' + actionTypes);
        return;
    }

    /* Execute */
    if (args[0] === '-v') {
        let json = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));
        console.log(json.version);
    } else if (args[0] === 'install') {
        await installAsync(args.slice(1));
    } else if (args[0] === 'check') {
        await check(process.cwd());
    }
};
module.exports.exec_Async = exec_Async;

async function check_Async(pkgPath) {
    return await check(pkgPath);
}
module.exports.check_Async = check_Async;