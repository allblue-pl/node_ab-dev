import type ABInfo from "./ABInfo.ts";
import fs from "node:fs";
import path from "node:path";

export default class ABLockInfo {
    static Clear(pkgPath: string, installType: "link"|"git"): void {
        let fsPath = path.join(pkgPath, ".ab-dev-lock");

        let jsonStr = JSON.stringify({
            type: installType,
            hash: "",
        }, null, 2);

        fs.writeFileSync(fsPath, jsonStr);
    }

    static Load(pkgPath: string) : ABLockInfo {
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


    #installType: "link"|"git"|null;
    #hash: string|null;

    get hash(): string|null {
        return this.#hash;
    }

    get installType(): "link"|"git"|null {
        return this.#installType;
    }

    constructor(installType: "link"|"git"|null, hash: string|null) {
        this.#installType = installType;
        this.#hash = hash;
    }

    delete(pkgPath: string): void {
        let fsPath = path.join(pkgPath, ".ab-dev-lock");
        if (fs.existsSync(fsPath))
            fs.unlinkSync(fsPath);
    }

    isValid(abInfo: ABInfo): boolean {
        return abInfo.getInfoHash() === this.#hash;
    }

    save(pkgPath: string): void {
        let fsPath = path.join(pkgPath, ".ab-dev-lock");

        let jsonStr = JSON.stringify({
            type: this.#installType,
            hash: this.#hash,
        }, null, 2);

        fs.writeFileSync(fsPath, jsonStr);
    }
}