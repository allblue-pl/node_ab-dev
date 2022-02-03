'use strict';

const
    fs = require('fs'),
    path = require('path'),    

    abFS = require('ab-fs'),
    abLog = require('ab-log'),
    abPackage = require('ab-package'),

    ABInfo = require('./ABInfo')
;

async function check(pkgPath)
{
    // let pkgPath = process.cwd();
    let abInfo = new ABInfo(path.join(pkgPath, '.ab-dev'));

    for (let depPkgName in abInfo.info.abDependencies) { 
        let depPkgPath = path.join(pkgPath, 'node_modules', depPkgName);            
        if (!fs.existsSync(depPkgPath)) {
            console.log('Not there');
            console.log(`${depPkgName}':`, abLog.cWarn(`Not initiated.`));
            continue;
        }
        let abPkg = new abPackage.Package(depPkgPath);

        try {
            if (await abPkg.hasUnstagedChangesAsync())
                console.log(`${depPkgName}':`, abLog.cWarn(`Unstaged changes.`));
            else
                console.log(`${depPkgName}':`, abLog.cSuccess(`Ok.`));
        } catch (err) {
            console.error(err);
        }
    }
}
module.exports = check;