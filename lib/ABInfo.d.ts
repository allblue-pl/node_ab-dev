export default class ABInfo {
    #private;
    info: ABDependenciesInfo;
    constructor(fsPath: string);
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