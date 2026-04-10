import fs from "fs";
import path from "path";

export default class ABInfo {
    info: ABDependenciesInfo;

    constructor(fsPath: string) {
        if (!fs.existsSync(fsPath))
            throw new Error(`'.ab-dev' does not exist in '${fsPath}'.`);

        let lstat = fs.lstatSync(fsPath);

        if (lstat.isFile())
            this.info = this._getInfo_FromFile(fsPath);
        else if (lstat.isDirectory())
            this.info = this._getInfo_FromDirectory(fsPath);
        else
            throw new Error(`No idea what '.ab-dev' actually is.`);
    }

    _addNewInfo(info: ABDependenciesInfo, newInfo: ABDependenciesInfo_Raw) {
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

    _getInfo_FromDirectory(fsPath: string)
    {
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

            this._addNewInfo(info, info_New);
        }

        return info;
    }

    _getInfo_FromFile(fsPath: string)
    {
         let info = {
            abDependencies: {},
        };

        let info_New = null;
        try {
            info_New = JSON.parse(fs.readFileSync(fsPath).toString());
        } catch (err) {
            throw new Error(`Cannot parse '.ab-dev': ` + err);
        }

        this._addNewInfo(info, info_New);

        return info;
    }
}

interface ABDependenciesInfo {
    abDependencies: { [key:string]: { url: string, branch: string }},
};

interface ABDependenciesInfo_Raw {
    abDependencies: { [key: string]: string },
};