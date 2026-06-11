declare class installer_Class {
    #private;
    constructor();
    install_Async(pkgPath: string, installType: "link" | "git", depPkgName?: string | null): Promise<void>;
}
declare const installer: installer_Class;
export default installer;
//# sourceMappingURL=installer.d.ts.map