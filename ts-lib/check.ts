import fs from "fs";
import path from "path";    

import abLog from "ab-log";

import helper from "./helper.ts";

import ABInfo from "./ABInfo.ts";

class check_Class {
    constructor() {
        
    }

    async checkPkgPath(pkgPath: string) {
        // let pkgPath = process.cwd();
        let abInfo = new ABInfo(path.join(pkgPath, '.ab-dev'));

        let pkgNames_ToCheck = Object.keys(abInfo.info.abDependencies);
        for (let i = 0; i < pkgNames_ToCheck.length; i++) {
            let pkgName = pkgNames_ToCheck[i]; 
            let depPkgPath = path.join(pkgPath, 'node_modules', pkgName);            
            if (!fs.existsSync(depPkgPath)) {
                console.log(`${pkgName}':`, abLog.cWarn(`Not initiated.`));
                continue;
            }

            try {
                if (await helper.git_HasUnstagedChanges_Async(depPkgPath))
                    console.log(`${pkgName}':`, abLog.cWarn(`Unstaged changes.`));
                else
                    console.log(`${pkgName}':`, abLog.cSuccess(`Ok.`));
            } catch (err) {
                console.error(err);
            }

            if (fs.existsSync(path.join(depPkgPath, '.ab-dev'))) {
                let abInfo_New = new ABInfo(path.join(depPkgPath, '.ab-dev'));
                for (let depPkgName_New in abInfo_New.info.abDependencies) {
                    if (pkgNames_ToCheck.includes(depPkgName_New))
                            continue;

                    abInfo.info.abDependencies[depPkgName_New] = 
                            abInfo_New.info.abDependencies[depPkgName_New];
                    pkgNames_ToCheck.push(depPkgName_New);
                }
            }
        }
    }
}
const check = new check_Class();
export default check;