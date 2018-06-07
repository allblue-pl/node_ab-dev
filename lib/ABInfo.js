'use strict';

const
    fs = require('fs')
;

class ABInfo
{

    constructor(fsPath)
    {
        if (!fs.existsSync(fsPath))
            throw new Error(`'.ab-dev' does not exist.`);

        try {
            this.info = JSON.parse(fs.readFileSync(fsPath));
        } catch (err) {
            throw new Error(`Cannot parse '.ab-dev': ` + err);
        }
    }

}
module.exports = ABInfo;