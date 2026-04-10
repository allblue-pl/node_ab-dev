'use strict';

const
    simpleGit = require('simple-git')
;

class helper_Class {
    async git_HasUnstagedChanges_Async(pkgPath) {
        let r = simpleGit(pkgPath);
        let res = await r.status();
        if (!res.isClean()) {
            console.warn(`'${pkgPath}' not clean.`);
            return true;
        }

        res = await r.branch();

        if (!(`remotes/origin/${res.current}` in res.branches)) {
            console.warn(`'${pkgPath}' remote branch '${res.current}'` +
                    ` does not exist.`);
            return true;
        }
        
        return res.branches[res.current].commit !== 
                res.branches[`remotes/origin/${res.current}`].commit;
    }

}
module.exports = new helper_Class();