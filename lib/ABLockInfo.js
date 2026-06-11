import fs from "node:fs";
import path from "node:path";
export default class ABLockInfo {
    static Load(pkgPath) {
        let fsPath = path.join(pkgPath, ".ab-dev-lock");
        if (!fs.existsSync(fsPath))
            return new ABLockInfo(null, null);
        try {
            let json = JSON.parse(fs.readFileSync(fsPath).toString());
            return new ABLockInfo(json.type, json.hash);
        }
        catch (err) {
            console.warn("Cannot parse '.ab-dev-lock");
            return new ABLockInfo(null, null);
        }
    }
    #type;
    #hash;
    get hash() {
        return this.#hash;
    }
    get type() {
        return this.#type;
    }
    constructor(type, hash) {
        this.#type = type;
        this.#hash = hash;
    }
    isValid(abInfo) {
        return abInfo.getInfoHash() === this.#hash;
    }
    save(pkgPath) {
        let fsPath = path.join(pkgPath, ".ab-dev-lock");
        let jsonStr = JSON.stringify({
            type: this.#type,
            hash: this.#hash,
        }, null, 2);
        fs.writeFileSync(fsPath, jsonStr);
    }
}
