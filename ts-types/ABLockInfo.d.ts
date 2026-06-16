import type ABInfo from "./ABInfo.ts";
export default class ABLockInfo {
    #private;
    static Load(pkgPath: string): ABLockInfo;
    get hash(): string | null;
    get type(): "link" | "git" | null;
    constructor(type: "link" | "git" | null, hash: string | null);
    isValid(abInfo: ABInfo): boolean;
    save(pkgPath: string): void;
}
//# sourceMappingURL=ABLockInfo.d.ts.map