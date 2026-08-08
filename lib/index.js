import fs from "node:fs";
import path from "node:path";
import check from "./helpers/check.js";
import url from "node:url";
import { abJSLegacy } from "@allblue/ab-ts-parser";
import buildTS from "./helpers/build-ts.js";
import { install_Async, installAnalyze_Async, installCheck_Async, installValidate_Async } from "./actions/install.js";
import ABLockInfo from "./helpers/ABLockInfo.js";
import ABInfo from "./helpers/ABInfo.js";
import installer from "./helpers/installer.js";
import validate from "./helpers/validate.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class abDev_Class {
    async check_Async(pkgPath        )                {
        return await check.checkPkgPath(pkgPath);
    }

    async exec_Async(args               )                {
        let actionTypes = [ '-v', 'install', 'install-analyze', 'install-check', 
                'install-validate', 'fix-js', 'validate', 'validate-pkg', 
                'ts-validate', 'ts-watch' ];

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
        } else if (args[0] === "install-analyze") {
            installAnalyze_Async(args);
        } else if (args[0] === 'install') {
            await install_Async(args)
        } else if (args[0] === 'install-check')
            await installCheck_Async(args);
        else if (args[0] === "install-validate")
            await installValidate_Async(args);
        else if (args[0] === "fix-js")
            await abJSLegacy.replace_Async(".");
        else if (args[0] === "ts-validate")
            buildTS.watchTS(".", true);
        else if (args[0] === "ts-watch")
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