import simpleGit from "simple-git";

class helper_Class {
    constructor() {
        
    }

    async git_HasUnstagedChanges_Async(pkgPath: string) {
        let r = simpleGit(pkgPath);
        let status = await r.status();
        if (!status.isClean()) {
            console.warn(`'${pkgPath}' not clean.`);
            return true;
        }

        let res = await r.branch();

        if (!(`remotes/origin/${res.current}` in res.branches)) {
            console.warn(`'${pkgPath}' remote branch '${res.current}'` +
                    ` does not exist.`);
            return true;
        }
        
        return res.branches[res.current].commit !== 
                res.branches[`remotes/origin/${res.current}`].commit;
    }
}
const helper = new helper_Class();
export default helper;