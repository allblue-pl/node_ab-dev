import fs from "node:fs";
import path from "node:path";
import check from "./check.js";
import installer from "./installer.js";
import validate from "./validate.js";
import url from "node:url";
import ABInfo from "./ABInfo.js";
import ABLockInfo from "./ABLockInfo.js";
import { abJSLegacy, abTSBuilder } from "@allblue/ab-ts-parser";
import buildTS from "./build-ts.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class abDev_Class {
    async check_Async(pkgPath        )                {
        return await check.checkPkgPath(pkgPath);
    }

    async exec_Async(args               )                {
        let actionTypes = [ 'install', 'check', '-v', 'fix-js', 'watch-ts' ];

        if (args.length < 0) {
            console.log('Action not set. Available actions: ' + actionTypes);
            return;
        }

        /* Action */
        if (!actionTypes.includes(args[0])) {
            console.log('Action not found. Available actions: ' + actionTypes);
            return;
        }

        /* Execute */
        if (args[0] === '-v') {
            let json = JSON.parse(fs.readFileSync(path.join(__dirname, 
                    '../package.json')).toString());
            console.log('Version:', json.version);
        } else if (args[0] === 'install') {
            let installTypes = [ 'link', 'git' ];

            if (args.length < 2) {
                console.log('Install type not set. Available install types: ' + installTypes);
                return;
            }
    
            if (!installTypes.includes(args[1])) {
                console.log('Unknown install type. Available install types: ' + installTypes);
                return;
            }

            await installer.install_Async(process.cwd(), args[1]                , 
                    args.length > 2 ? args[2] : null);
        } else if (args[0] === 'check')
            await check.checkPkgPath(process.cwd());
        else if (args[0] === 'validate')
            await validate.validatePkgPath(process.cwd());
        else if (args[0] === "fix-js")
            await abJSLegacy.replace_Async(".");
        else if (args[0] === "watch-ts")
            buildTS.watchTS(".");
        else
            console.error("Unknown action.");
    }

    async validate_Async(pkgPath        )                {
        let abLockInfo = ABLockInfo.Load(pkgPath);
        if (abLockInfo.type === null) {
            throw new Error(`Cannot determine install type from '.ab-dev-lock' in '${pkgPath}'.` + 
                    " Run 'ab install <type>' again.");
        }

        let abInfo = ABInfo.Load(pkgPath);
        
        if (!abLockInfo.isValid(abInfo) || !(await validate.validatePkgPath(pkgPath))) {
            console.warn(`'.ab-dev-lock' not valid in '${pkgPath}'. Re-installing.`);
            // console.log('.ab-dev:      ' + abInfo.getInfoHash());
            // console.log('.ab-dev-lock: ' + abLockInfo.hash);
            await installer.install_Async(pkgPath, abLockInfo.type, )

            let abLockInfo_New = new ABLockInfo(abLockInfo.type, 
                    abInfo.getInfoHash());
            abLockInfo_New.save(pkgPath);
        }
    }
}
const abDev = new abDev_Class();
export default abDev;