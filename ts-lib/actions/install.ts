import ABInfo from "../helpers/ABInfo.ts";
import ABLockInfo from "../helpers/ABLockInfo.ts";
import analyze from "../helpers/analyze.ts";
import check from "../helpers/check.ts";
import installer from "../helpers/installer.ts";
import validate from "../helpers/validate.ts";
import abDev from "../index.ts";

export async function install_Async(args: Array<string>): Promise<void> {
    let installTypes = [ 'link', 'git' ];

    if (args.length < 2) {
        console.log('Install type not set. Available install types: ' + 
                installTypes);
        return;
    }

    if (!installTypes.includes(args[1])) {
        console.log('Unknown install type. Available install types: ' + 
                installTypes);
        return;
    }

    await installer.install_Async(process.cwd(), args[1] as "link"|"git", 
            args.length > 2 ? args[2] : null);
}

export async function installAnalyze_Async(args: Array<string>): Promise<void> {
    analyze.analyzePkgPath(process.cwd());
}

export async function installCheck_Async(args: Array<string>): Promise<void> {
    await check.checkPkgPath(process.cwd());
}

export async function installValidate_Async(args: Array<string>): Promise<void> {
    await abDev.validate_Async(process.cwd());
}