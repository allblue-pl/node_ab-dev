'use strict';

const
    fs = require('fs'),
    path = require('path')
;

class ABInfo {

    constructor(fsPath)
    {
        if (!fs.existsSync(fsPath))
            throw new Error(`'.ab-dev' does not exist.`);

        let lstat = fs.lstatSync(fsPath);

        if (lstat.isFile())
            this.info = this._getInfo_FromFile(fsPath);
        else if (lstat.isDirectory())
            this.info = this._getInfo_FromDirectory(fsPath);
        else
            throw new Error(`No idea what '.ab-dev' actually is.`);
    }


    _getInfo_FromDirectory(fsPath)
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
                info_New = JSON.parse(fs.readFileSync(
                        path.join(fsPath, fileFSPath)));
            } catch (err) {
                throw new Error(`Cannot parse '${fileFSPath}': ` + err);
            }

            if ('abDependencies' in info_New) {
                for (let propName in info_New.abDependencies) {
                    info.abDependencies[propName] = 
                            info_New.abDependencies[propName];
                }
            }
        }

        return info;
    }

    _getInfo_FromFile(fsPath)
    {
        try {
            return JSON.parse(fs.readFileSync(fsPath));
        } catch (err) {
            throw new Error(`Cannot parse '.ab-dev': ` + err);
        }
    }

}
module.exports = ABInfo;