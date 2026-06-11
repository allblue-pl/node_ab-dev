import type ABInfo from "./ABInfo.ts";
import fs from "node:fs";
import path from "node:path";

export default class ABLockInfo {
    static Load(pkgPath: string) {
        let fsPath = path.join(pkgPath, ".ab-dev-lock");

        if (!fs.existsSync(fsPath))
            return new ABLockInfo(null, null);

        try {
            let json = JSON.parse(fs.readFileSync(fsPath).toString());
            
            return new ABLockInfo(json.type, json.hash);
        } catch (err) {
            console.warn("Cannot parse '.ab-dev-lock");
            return new ABLockInfo(null, null);
        }

        
    }


    #type: "link"|"git"|null;
    #hash: string|null;

    get hash(): string|null {
        return this.#hash;
    }

    get type(): "link"|"git"|null {
        return this.#type;
    }

    constructor(type: "link"|"git"|null, hash: string|null) {
        this.#type = type;
        this.#hash = hash;
    }

    isValid(abInfo: ABInfo): boolean {
        return abInfo.getInfoHash() === this.#hash;
    }

    save(pkgPath: string) {
        let fsPath = path.join(pkgPath, ".ab-dev-lock");

        let jsonStr = JSON.stringify({
            type: this.#type,
            hash: this.#hash,
        }, null, 2);

        fs.writeFileSync(fsPath, jsonStr);
    }
}