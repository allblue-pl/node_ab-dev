'use strict';

const
    fs = require('fs'),
    path = require('path'),    

    abFS = require('ab-fs'),
    abLog = require('ab-log'),
    simpleGit = require('simple-git'),

    ABInfo = require('./ABInfo')
;

async function validate(pkgPath) {
    // let pkgPath = process.cwd();
    let abInfo = new ABInfo(path.join(pkgPath, '.ab-dev'));

    for (let depPkgName in abInfo.info.abDependencies) { 
        let depPkgPath = path.join(pkgPath, 'node_modules', depPkgName);
        if (!fs.existsSync(depPkgPath)) {
            console.log(`${depPkgName}':`, abLog.cWarn(`Not initiated.`));
            return false;
        }

        let depPkgPath_Real = fs.realpathSync(depPkgPath);
        let branch = abInfo.info.abDependencies[depPkgName].branch;

        let repo = simpleGit(depPkgPath_Real);
        let branchSummary = await repo.branchLocal();
        if (branchSummary.current !== branch) {
            console.error(`Repo '${depPkgName}:${branchSummary.current}'` +
                    `is on the wrong branch (expected '${branch}').`);
            return false;
        }
    }

    return true;
}
module.exports = validate;