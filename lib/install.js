'use strict';

const
    childProcess = require('child_process'),
    fs = require('fs'),
    path = require('path'),    

    abFS = require('ab-fs'),
    nodegit = require('nodegit'),

    ABInfo = require('./ABInfo')
;

function install(args)
{
    let installTypes = [ 'link', 'git' ];

    if (args.length < 1) {
        console.log('Install type not set. Available install types: ' + installTypes);
        return;
    }

    if (!installTypes.includes(args[0])) {
        console.log('Unknown install type. Available install types: ' + installTypes);
        return;
    }

    let pkgPath = process.cwd();
    let abInfo = new ABInfo(path.join(pkgPath, '.ab-dev'));

    for (let depPkgName in abInfo.info.abDependencies) { 
        let depPkgPath = path.join(pkgPath, 'node_modules', depPkgName);    
        if (args[0] === 'git')
            install_Git(pkgPath, abInfo, depPkgName, depPkgPath);
        else if (args[0] === 'link')
            install_Link(pkgPath, abInfo, depPkgName, depPkgPath);
    }
}

function install_Git(pkgPath, abInfo, depPkgName, depPkgPath)
{
    let depPkgExist = false;
    if (fs.existsSync(depPkgPath)) {
        if (!fs.existsSync(path.join(depPkgPath, '.git'))) {
            abFS.rmdirRecursiveSync(depPkgPath);
        } else
            depPkgExist = true;
    }

    if (depPkgExist) {
        nodegit.Repository.open(depPkgPath)
            .then((repo) => {
                repo.fetchAll({
                    callbacks: {
                        credentials: function(url, userName) {
                            return nodegit.Cred.sshKeyFromAgent(userName);
                        },
                        certificateCheck: function() {
                            return 1;
                        }
                    }
                        })
                    .then(() => {
                        return repo.mergeBranches('master', 'origin/master');
                    });
            })
            .then(() => {
                console.log(`Pulled repo: '${depPkgName}'.`);
                installDependencies(depPkgPath, depPkgName);
            })
            .catch((err) => {
                console.log(`Cannot pull repo '${depPkgName}':`, err.stack);
            });   
    } else {
        abInfo.info.abDependencies[depPkgName];
        nodegit.Clone(abInfo.info.abDependencies[depPkgName], depPkgPath)
            .then((repo) => {
                console.log(`Cloned repo: '${depPkgName}'.`);
                installDependencies(depPkgPath, depPkgName);
            })
            .catch((err) => {
                console.log(`Cannot clone repo '${depPkgName}':`, err.stack);
            });
    }
}

function install_Link(pkgPath, abInfo, depPkgName, depPkgPath)
{
    if (fs.existsSync(depPkgPath))
        abFS.rmdirRecursiveSync(depPkgPath);

    let childExec = childProcess.exec(`npm link ${depPkgName}`,
            { cwd: pkgPath, }, (error, stdout, stderr) => {
        console.log(`Linking '${depPkgName}': `, stdout, stderr);

        if (error !== null)
            console.log(`Error linking '${depPkgName}':`, error);
    });
}

function installDependencies(pkgPath, pkgName)
{
    let childExec = childProcess.exec(`npm install`,
            { cwd: pkgPath, }, (error, stdout, stderr) => {
        console.log(`Installing '${pkgName}': `, stdout, stderr);

        if (error !== null)
            console.log(`Error installing '${pkgName}':`, error);
    });
}


module.exports = install;