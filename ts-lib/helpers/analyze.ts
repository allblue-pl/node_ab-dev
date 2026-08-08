import fs from "fs";
import path from "path";    

import abLog from "ab-log";

import ABInfo from "./ABInfo.ts";

export class analyze_Class {
    constructor() {
        
    }

    async analyzePkgPath(pkgPath: string): Promise<void> {
        console.log(`Analyzing '${pkgPath}'...`);

        // let pkgPath = process.cwd();
        let abInfo = new ABInfo(path.join(pkgPath, '.ab-dev'));

        let depPkgInfos_ToCheck: Array<{parentPath: string, depName: string}> = [];
        for (let depName in abInfo.info.abDependencies) {
            depPkgInfos_ToCheck.push({
                parentPath: pkgPath,
                depName: depName,
            });
        }

        for (let i = 0; i < depPkgInfos_ToCheck.length; i++) {
            let depPkgInfo = depPkgInfos_ToCheck[i]; 
            let depPkgPath = path.join(pkgPath, 'node_modules', depPkgInfo.depName);            
            if (!fs.existsSync(depPkgPath)) {
                abLog.error("Does not exist: ", depPkgPath);
                continue;
            }

            console.log(abLog.cInfo(`${depPkgInfo.depName}`) + ` from ${depPkgInfo.parentPath}.`);

            if (fs.existsSync(path.join(depPkgPath, '.ab-dev'))) {
                let abInfo_New = new ABInfo(path.join(depPkgPath, '.ab-dev'));
                for (let depPkgName_New in abInfo_New.info.abDependencies) {
                    if (this.#pkgExists(depPkgInfos_ToCheck, depPkgName_New))
                            continue;

                    abInfo.info.abDependencies[depPkgName_New] = 
                            abInfo_New.info.abDependencies[depPkgName_New];
                    depPkgInfos_ToCheck.push({
                        parentPath: depPkgPath,
                        depName: depPkgName_New,
                    });
                }
            }
        }
    }


    #pkgExists(depPkgInfos: Array<{parentPath: string, depName: string}>, 
            pkgName: string): boolean {
        for (let depPkgInfo of depPkgInfos) {
            if (depPkgInfo.depName === pkgName)
                return true;
        }         

        return false;
    }
}
const analyze = new analyze_Class();
export default analyze;