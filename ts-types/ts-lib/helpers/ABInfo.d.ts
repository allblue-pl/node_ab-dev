export default class ABInfo {
    #private;
    static Load(pkgFSPath: string): ABInfo;
    info: ABDependenciesInfo;
    constructor(fsPath: string);
    getInfoHash(): string;
}
interface ABDependenciesInfo {
    abDependencies: {
        [key: string]: {
            url: string;
            branch: string;
        };
    };
}
export {};
//# sourceMappingURL=ABInfo.d.ts.map