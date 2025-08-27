'use strict';

const
    childProcess = require('child_process'),
    fs = require('fs'),
    path = require('path'),    

    abFS = require('ab-fs'),
    abLog = require('ab-log'),
    simpleGit = require('simple-git'),

    helper = require('./helper'),
    ABInfo = require('./ABInfo')
;

function copyDummyPackage(pkgPath, depPkgName, depPkgPath) {
    let tempPath = path.join(pkgPath, '.ab-dev-temp');
    let dummyPkgDirPath = path.join(tempPath, 'dummy-node-modules', depPkgName);
    fs.mkdirSync(dummyPkgDirPath);
    fs.copyFileSync(path.join(depPkgPath, 'package.json'), path.join(dummyPkgDirPath, 'package.json'));
}

async function fixNPMLineEndings(repo) {
    try {
        let index = await repo.refreshIndex();

        await index.addByPath('package.json');
        await index.addByPath('package-lock.json');
    } catch (err) {
        abLog.error(`Cannot fix NPM line ending by adding 'package.json' and 'package-lock.json': `, err);
    }
}

async function installAsync(args) {
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
    let depPkgsList = [];

    /* Temp */
    let tempPath = path.join(pkgPath, '.ab-dev-temp');
    if (fs.existsSync(tempPath))
        abFS.rmdirRecursiveSync(tempPath);
    fs.mkdirSync(tempPath);
    fs.mkdirSync(path.join(tempPath, 'dummy-node-modules'));
    /* Temp */

    if (args.length === 1) {
        let abDependencies = abInfo.info.abDependencies;
        let pkgNames_New = Object.keys(abDependencies);
        for (let i = 0; i < pkgNames_New.length; i++) {
            let depPkgName = pkgNames_New[i];
            let pkgExists = false;
            for (let depPkg of depPkgsList) {
                if (depPkg.pkgName === depPkgName){
                    pkgExists = true;
                    break;
                }
            }
            if (pkgExists)
                continue;

            let depPkgPath = path.join(pkgPath, 'node_modules', depPkgName);    

            depPkgsList.push({
                pkgName: depPkgName,
                pkgPath: depPkgPath,
            });

            if (args[0] === 'git')
                await installAsync_Git(pkgPath, abInfo, depPkgName, depPkgPath);
            else if (args[0] === 'link')
                await installAsync_Link_NoCopy(pkgPath, abInfo, depPkgName, depPkgPath);

            if (fs.existsSync(path.join(depPkgPath, '.ab-dev'))) {
                let abInfo_New = new ABInfo(path.join(depPkgPath, '.ab-dev'));
                for (let depPkgName_New in abDependencies) {
                    if (depPkgName_New in abDependencies)
                        continue;

                    abDependencies[depPkgName_New] = 
                            abInfo_New.info.abDependencies[depPkgName_New];
                    pkgNames_New.push(depPkgName_New);
                }
            }
        }

        if (args[0] === 'link')
            await installAsync_Links(pkgPath, depPkgsList);
    } else if (args.length > 1) {
        let depPkgName = args[1];
        if (!depPkgName in abInfo.info.abDependencies)
            throw new Error(`AB dependecy '${depPkgName}' does not exist.`);

        let depPkgPath = path.join(pkgPath, 'node_modules', depPkgName);

        depPkgsList.push({
            pkgName: depPkgName,
            pkgPath: depPkgPath,
        });

        if (args[0] === 'git')
            await installAsync_Git( pkgPath, abInfo, depPkgName, depPkgPath);
        else if (args[0] === 'link')
            await installAsync_Link(pkgPath, abInfo, depPkgName, depPkgPath);
    }

    await installNPMDependenciesAsync(abInfo, pkgPath);
}

async function installAsync_Git(pkgPath, abInfo, depPkgName, depPkgPath) {
    let depPkgExist = false;
    if (fs.existsSync(depPkgPath)) {
        if (await helper.git_HasUnstagedChanges_Async(depPkgPath)) {
            console.log(`Cannot pull repo '${depPkgName}':`, 
                    abLog.cWarn('Unstaged changes.'));
            return;
        }

        if (!fs.existsSync(path.join(depPkgPath, '.git'))) {
            abFS.rmdirRecursiveSync(depPkgPath);
        } else
            depPkgExist = true;
    } else
        abFS.mkdirRecursiveSync(depPkgPath);

    let repo = simpleGit(depPkgPath);
    if (depPkgExist) {
        try {
            await repo.pull('origin', 'main');
            console.log(`Pulled repo: '${depPkgName}'.`);
        } catch (err) {
            abLog.error(`Cannot pull repo '${depPkgName}':`, err.stack);
            return;
        };
    } else {
        try {
            await repo.clone(abInfo.info.abDependencies[depPkgName], depPkgPath, 
                    [ '-b', 'main' ]);
            console.log(`Cloned repo: '${depPkgName}'.`);                
        } catch (err) {
            abLog.error(`Cannot clone repo '${depPkgName}':`, err.stack);
            return;
        }
    }

    copyDummyPackage(pkgPath, depPkgName, depPkgPath);

    // await installDependenciesAsync(depPkgPath, depPkgName);
    // await fixNPMLineEndings(repo);
    // removeDependencies(abInfo, depPkgPath, depPkgName);
}

async function installAsync_Link(pkgPath, abInfo, depPkgName, depPkgPath) {
    await new Promise((resolve, reject) => {
        if (fs.existsSync(depPkgPath))
            abFS.rmdirRecursiveSync(depPkgPath);

        let childExec = childProcess.exec(`npm link ${depPkgName}`,
                { cwd: pkgPath, }, (error, stdout, stderr) => {
            console.log(`Linking '${depPkgName}': `, stdout, stderr);

            if (error !== null)
                console.log(`Error linking '${depPkgName}':`, error);

            copyDummyPackage(pkgPath, depPkgName, depPkgPath);

            resolve();
        });
    });
}

async function installAsync_Link_NoCopy(pkgPath, abInfo, depPkgName, depPkgPath) {
    await new Promise((resolve, reject) => {
        if (fs.existsSync(depPkgPath))
            abFS.rmdirRecursiveSync(depPkgPath);

        let childExec = childProcess.exec(`npm link ${depPkgName}`,
                { cwd: pkgPath, }, (error, stdout, stderr) => {
            console.log(`Linking without copy '${depPkgName}': `, stdout, stderr);

            if (error !== null)
                console.log(`Error linking '${depPkgName}':`, error);

            resolve();
        });
    });
}

async function installAsync_Links(pkgPath, depPkgsList) {
    await new Promise((resolve, reject) => {
        let depPkgNames = [];
        for (let depPkg of depPkgsList) {
            if (fs.existsSync(depPkg.pkgPath))
                abFS.rmdirRecursiveSync(depPkg.pkgPath);
            depPkgNames.push(depPkg.pkgName);
        }

        let depPkgNames_Str = depPkgNames.join(' ');

        let childExec = childProcess.exec(`npm link ${depPkgNames_Str}`,
                { cwd: pkgPath, }, (error, stdout, stderr) => {
            console.log(`Linking '${depPkgNames_Str}': `, stdout, stderr);

            if (error !== null)
                console.log(`Error linking '${depPkgNames_Str}':`, error);

            for (let depPkg of depPkgsList)
                copyDummyPackage(pkgPath, depPkg.pkgName, depPkg.pkgPath);

            resolve();
        });
    });
}

async function installDependenciesAsync(pkgPath, pkgName) {
    return new Promise((resolve, reject) => {
        childProcess.exec(`npm install`,
                { cwd: pkgPath, }, (error, stdout, stderr) => {
            console.log(`Installing '${pkgName}' dependencies: `, stdout, stderr);

            if (error !== null)
                abLog.error(`Error installing '${pkgName}':`, error);

            resolve();
        });
    });
}

async function installNPMDependenciesAsync(abInfo, pkgPath) {
    let abDevMainPackageJSON = {
        name: "ab-dev-temp",
        version: '0.0.1',
        dependencies: {},
    };
    let pkgInfo = JSON.parse(fs.readFileSync(path.join(pkgPath, "package.json")));
    let pkgDepPkgNames = [];
    if ('dependencies' in pkgInfo) {
        for (let pkgDepPkgName in pkgInfo.dependencies) {
            abDevMainPackageJSON.dependencies[pkgDepPkgName] = 
                    pkgInfo.dependencies[pkgDepPkgName];
        }
    }

    if ('devDependencies' in pkgInfo) {
        for (let pkgDepPkgName in pkgInfo.devDependencies) {
            abDevMainPackageJSON.dependencies[pkgDepPkgName] = 
                    pkgInfo.devDependencies[pkgDepPkgName];
        }
    }

    for (let depPkgName in abInfo.info.abDependencies) {
        abDevMainPackageJSON.dependencies[depPkgName] = 
                `file:dummy-node-modules/${depPkgName}`;
    }

    let tempPath = path.join(pkgPath, '.ab-dev-temp');

    fs.writeFileSync(path.join(tempPath, 'package.json'), 
            JSON.stringify(abDevMainPackageJSON));

    await new Promise((resolve, reject) => {
        childProcess.exec(`npm install`,
                { cwd: tempPath, }, (error, stdout, stderr) => {
            console.log(`Installing dummy dependencies: `, stdout, stderr);

            if (error !== null)
                abLog.error(`Error installing dummy dependencies:`, error);

            resolve();
        });
    });

    /* Move Dependencies */
    let abDevMainNodeModulesDirPath = path.join(tempPath, 'node_modules');

    let pkgNodeModulesFiles = fs.readdirSync(path.join(pkgPath, 'node_modules'));
    for (let pkgDepPkgName of pkgNodeModulesFiles) {
        if (!abFS.existsDirSync(path.join(pkgPath, 'node_modules', pkgDepPkgName)))
            continue;
        if (pkgDepPkgName in abInfo.info.abDependencies)
            continue;

        let pkgDepPkgPath = path.join(pkgPath, 'node_modules', pkgDepPkgName)

        if (abFS.existsDirSync(pkgDepPkgPath))
            abFS.rmdirRecursiveSync(pkgDepPkgPath);
    }

    if (fs.existsSync(abDevMainNodeModulesDirPath)) {
        let abDevMainFiles = fs.readdirSync(abDevMainNodeModulesDirPath);
        for (let depPkgName of abDevMainFiles) {
            let abDevMain_DepPkgPath = path.join(abDevMainNodeModulesDirPath, depPkgName);

            if (depPkgName in abInfo.info.abDependencies) {
                
            } else if (false) {

            } else {
                let depPkgPath = path.join(pkgPath, 'node_modules', depPkgName);
                fs.renameSync(abDevMain_DepPkgPath, depPkgPath);
            }        
        }
    }

    abFS.rmdirRecursiveSync(tempPath);
}

function removeDependencies(abInfo, pkgPath, pkgName) {
    console.log(`Removing dependencies of '${pkgName}'...`);
    for (let depPkgName in abInfo.info.abDependencies) {
        let depPkgPath = path.join(pkgPath, 'node_modules', depPkgName);
        if (fs.existsSync(depPkgPath)) {
            if (fs.lstatSync(depPkgPath).isDirectory()) {
                abFS.rmdirRecursiveSync(depPkgPath);
                console.log(`Removed dependency: '${depPkgName}'.`);
            } else 
                fs.unlinkSync(depPkgPath);
        }
    }
}


module.exports = installAsync;