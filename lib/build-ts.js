import { abTSBuilder } from "@allblue/ab-ts-parser";
import ABInfo from "./ABInfo.ts";
import abLog from "ab-log";
import path from "node:path";

export class buildTS_Class {
    constructor() {
        
    }

    watchTS(fsPath        )       {
        abLog.success("Watching...");

        let watchFSPath = path.resolve(".");
        abTSBuilder.watch(watchFSPath);

        let abInfo = ABInfo.Load(fsPath);
        for (let pkgName in abInfo.info.abDependencies) {
            let pkgFSPath = path.join(watchFSPath, "node_modules", pkgName);
            abTSBuilder.watch(pkgFSPath, false, false);
        }
    }
}
const buildTS = new buildTS_Class();
export default buildTS;