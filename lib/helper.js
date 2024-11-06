'use strict';

const
    simpleGit = require('simple-git')
;

class helper_Class {
    async git_HasUnstagedChanges_Async(pkgPath) {
        let r = simpleGit(pkgPath);
        let res = await r.status();
        if (!res.isClean())
            return true;

        res = await r.branch();

        return res.branches[res.current].commit !== 
                res.branches[`remotes/origin/${res.current}`].commit;
    }

}
module.exports = new helper_Class();