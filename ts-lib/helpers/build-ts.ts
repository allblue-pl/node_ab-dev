import { TSWatcher } from "@allblue/ab-ts-parser";
import ABInfo from "./ABInfo.ts";
import abLog from "ab-log";
import path from "node:path";

export class buildTS_Class {
    constructor() {
        
    }

    watchTS(fsPath: string, onlyValidate: boolean = false): void {
        abLog.success("Watching...");

        let tsBuilder = new TSWatcher(path.resolve("."), path.resolve("."), 
                null, onlyValidate);

        let abInfo = ABInfo.Load(fsPath);
        for (let pkgName in abInfo.info.abDependencies) {
            let pkgFSPath = path.join(path.resolve("."), "node_modules", pkgName);
            tsBuilder.addABTSInfo(pkgFSPath);
        }

        tsBuilder.watch();
    }
}
const buildTS = new buildTS_Class();
export default buildTS;