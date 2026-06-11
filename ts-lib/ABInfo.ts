import fs from "fs";
import path from "path";

export default class ABInfo {
    static Load(pkgFSPath: string) {
        let abInfo = new ABInfo(path.join(pkgFSPath, '.ab-dev'));

        let depPkgsList: Array<{ pkgName: string, pkgPath: string }> = [];
        let depPkgNames_New = Object.keys(abInfo.info.abDependencies);
        for (let i = 0; i < depPkgNames_New.length; i++) {
            let depPkgName = depPkgNames_New[i];
            let depPkgExists = false;
            for (let depPkg of depPkgsList) {
                if (depPkg.pkgName === depPkgName){
                    depPkgExists = true;
                    break;
                }
            }
            if (depPkgExists)
                continue;

            let depPkgPath = path.join(pkgFSPath, 'node_modules', depPkgName);    

            depPkgsList.push({
                pkgName: depPkgName,
                pkgPath: depPkgPath,
            });

            if (fs.existsSync(path.join(depPkgPath, '.ab-dev'))) {
                let abInfo_New = new ABInfo(path.join(depPkgPath, '.ab-dev'));
                for (let depPkgName_New in abInfo_New.info.abDependencies) {
                    if (depPkgNames_New.includes(depPkgName_New))
                        continue;

                    abInfo.info.abDependencies[depPkgName_New] = 
                            abInfo_New.info.abDependencies[depPkgName_New];
                    depPkgNames_New.push(depPkgName_New);
                }
            }
        }

        return abInfo;
    }


    info: ABDependenciesInfo;

    constructor(fsPath: string) {
        if (!fs.existsSync(fsPath))
            throw new Error(`'.ab-dev' does not exist in '${fsPath}'.`);

        let lstat = fs.lstatSync(fsPath);

        if (lstat.isFile())
            this.info = this.#getInfo_FromFile(fsPath);
        else if (lstat.isDirectory())
            this.info = this.#getInfo_FromDirectory(fsPath);
        else
            throw new Error(`No idea what '.ab-dev' actually is.`);
    }

    getInfoHash(): string {
        return JSON.stringify(this.info);
    };

    #addNewInfo(info: ABDependenciesInfo, newInfo: ABDependenciesInfo_Raw) {
        if ('abDependencies' in newInfo) {
            for (let propName in newInfo.abDependencies) {
                let repoUrl: string = newInfo.abDependencies[propName];
                let repoBranch: string = 'main';

                let repoArr: Array<string> = repoUrl.split('#');
                if (repoArr.length > 2)
                    throw new Error(`Wrong repo format '${repoUrl}'.`);
                else if (repoArr.length === 2) {
                    repoUrl = repoArr[0];
                    repoBranch = repoArr[1];
                }

                if (propName in info.abDependencies) {
                    if (repoUrl !== info.abDependencies[propName].url)
                        throw new Error(`Repo '${propName}' url does not match existing url.`);
                    if (repoBranch !== info.abDependencies[propName].branch)
                        throw new Error(`Repo '${propName}' branch does not match existing branch.`);
                } else {
                    info.abDependencies[propName] = {
                        url: repoUrl,
                        branch: repoBranch,
                    };
                }
            }
        }
    }

    #getInfo_FromDirectory(fsPath: string) {
        let fileFSPaths = fs.readdirSync(fsPath);

        let info = {
            abDependencies: {},
        };

        for (let fileFSPath of fileFSPaths) {
            if (path.extname(fileFSPath) !== '.json')
                continue;

            let info_New = null;
            try {
                info_New = JSON.parse(fs.readFileSync(path.join(fsPath, 
                        fileFSPath)).toString());
            } catch (err) {
                throw new Error(`Cannot parse '${fileFSPath}': ` + err);
            }

            this.#addNewInfo(info, info_New);
        }

        return info;
    }

    #getInfo_FromFile(fsPath: string) {
         let info = {
            abDependencies: {},
        };

        let info_New = null;
        try {
            info_New = JSON.parse(fs.readFileSync(fsPath).toString());
        } catch (err) {
            throw new Error(`Cannot parse '.ab-dev': ` + err);
        }

        this.#addNewInfo(info, info_New);

        return info;
    }
}

interface ABDependenciesInfo {
    abDependencies: { [key:string]: { url: string, branch: string }},
};

interface ABDependenciesInfo_Raw {
    abDependencies: { [key: string]: string },
};