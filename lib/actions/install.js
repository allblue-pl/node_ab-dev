import ABInfo from "../helpers/ABInfo.js";
import ABLockInfo from "../helpers/ABLockInfo.js";
import analyze from "../helpers/analyze.js";
import check from "../helpers/check.js";
import installer from "../helpers/installer.js";
import validate from "../helpers/validate.js";
import abDev from "../index.js";

export async function install_Async(args               )                {
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

    await installer.install_Async(process.cwd(), args[1]                , 
            args.length > 2 ? args[2] : null);
}

export async function installAnalyze_Async(args               )                {
    analyze.analyzePkgPath(process.cwd());
}

export async function installCheck_Async(args               )                {
    await check.checkPkgPath(process.cwd());
}

export async function installValidate_Async(args               )                {
    await abDev.validate_Async(process.cwd());
}