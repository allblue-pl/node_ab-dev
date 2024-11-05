'use strict';

const
    ABInfo = require('./lib/ABInfo'),

    helper = require('./lib/helper')
;

// console.log(new ABInfo('./test/.ab-dev'));

(async () => {
    await helper.git_HasUnstagedChanges('.');
        })()
    .catch((err) => {
        console.error(err);
    });