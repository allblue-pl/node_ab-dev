'use strict';

const
    install = require('./install')
;

function exec(args) {
    let actionTypes = [ 'install' ];

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
    if (args[0] === 'install')
        install(args.slice(1));
};

module.exports.exec = exec;