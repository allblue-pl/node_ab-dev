import fs  from "fs";
import path  from "path";

import abFS  from "ab-fs";
import abLog  from "ab-log";
import simpleGit  from "simple-git";

import ABInfo  from "./ABInfo.ts";

class validate_Class {
    constructor() {
        
    }

    async validatePkgPath(pkgPath: string) {
        // let pkgPath = process.cwd();
        let abInfo: ABInfo = new ABInfo(path.join(pkgPath, '.ab-dev'));

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
}
const validate = new validate_Class();
export default validate;