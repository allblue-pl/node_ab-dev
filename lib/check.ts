import fs from "fs";
import path from "path";    

import abFS from "ab-fs";
import abLog from "ab-log";

import helper from "./helper.ts";

import ABInfo from "./ABInfo.ts";

class check_Class {
    constructor() {
    }

    async checkPkgPath(pkgPath: string) {
        // let pkgPath = process.cwd();
        let abInfo = new ABInfo(path.join(pkgPath, '.ab-dev'));

        for (let depPkgName in abInfo.info.abDependencies) { 
            let depPkgPath = path.join(pkgPath, 'node_modules', depPkgName);            
            if (!fs.existsSync(depPkgPath)) {
                console.log(`${depPkgName}':`, abLog.cWarn(`Not initiated.`));
                continue;
            }

            try {
                if (await helper.git_HasUnstagedChanges_Async(depPkgPath))
                    console.log(`${depPkgName}':`, abLog.cWarn(`Unstaged changes.`));
                else
                    console.log(`${depPkgName}':`, abLog.cSuccess(`Ok.`));
            } catch (err) {
                console.error(err);
            }
        }
    }
}
const check = new check_Class();
export default check;