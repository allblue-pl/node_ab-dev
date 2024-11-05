'use strict';

const
    simpleGit = require('simple-git')
;

class helper_Class {
    async git_HasUnstagedChanges(pkgPath) {
        let r = simpleGit(pkgPath);
        console.log((await r.status()).isClean());
    }

}
module.exports = new helper_Class();