import type ABInfo from "./ABInfo.ts";
export default class ABLockInfo {
    #private;
    static Clear(pkgPath: string, installType: "link" | "git"): void;
    static Load(pkgPath: string): ABLockInfo;
    get hash(): string | null;
    get installType(): "link" | "git" | null;
    constructor(installType: "link" | "git" | null, hash: string | null);
    delete(pkgPath: string): void;
    isValid(abInfo: ABInfo): boolean;
    save(pkgPath: string): void;
}
//# sourceMappingURL=ABLockInfo.d.ts.map