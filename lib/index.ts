import fs from "node:fs";
import path from "node:path";
import check from "./check.ts";
import installer from "./installer.ts";
import validate from "./validate.ts";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class abDev_Class {
    async check_Async(pkgPath: string) {
        return await check.checkPkgPath(pkgPath);
    }

    async exec_Async(args: Array<string>) {
        let actionTypes = [ 'install', 'check', '-v' ];

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
        } else if (args[0] === 'install')
            await installer.install_Async(args.slice(1));
        else if (args[0] === 'check')
            await check.checkPkgPath(process.cwd());
        else if (args[0] === 'validate')
            await validate.validatePkgPath(process.cwd());
    }

    async validate_Async(pkgPath: string) {
        return await validate.validatePkgPath(pkgPath);
    }
}
const abDev = new abDev_Class();
export default abDev;