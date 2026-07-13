import { TSBuilder } from "@allblue/ab-ts-parser";
import ABInfo from "./ABInfo.js";
import abLog from "ab-log";
import path from "node:path";

export class buildTS_Class {
    constructor() {
        
    }

    watchTS(fsPath        )       {
        abLog.success("Watching...");

        let tsBuilder = new TSBuilder(path.resolve("."), path.resolve("."));

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