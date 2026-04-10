import childProcess from "child_process";
import fs from "fs";
import path from "path";

import abFS from "ab-fs";
import abLog from "ab-log";
import simpleGit from "simple-git";

import helper from "./helper.ts";

import ABInfo from "./ABInfo.ts";

class installer_Class {
    constructor() {
        
    }

    async install_Async(args: Array<string>) {
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
        let depPkgsList: Array<{ pkgName: string, pkgPath: string }> = [];

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

                if (args[0] === 'git') {
                    if (!(await this.#installAsync_Git(pkgPath, abInfo, depPkgName, 
                            depPkgPath)))
                        return;
                } else if (args[0] === 'link') {
                    if (!(await this.#installAsync_Link_NoCopy(pkgPath, abInfo, depPkgName, 
                            depPkgPath))) {
                        console.error('Cannot install link without copy:', pkgPath);
                        return;
                    }
                }

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

            if (args[0] === 'link') {
                if (!(await this.#installAsync_Links(pkgPath, depPkgsList))) {
                    console.error('Cannot install links:', pkgPath);
                    return;
                }
            }
        } else if (args.length > 1) {
            let depPkgName = args[1];
            if (!(depPkgName in abInfo.info.abDependencies))
                throw new Error(`AB dependecy '${depPkgName}' does not exist.`);

            let depPkgPath = path.join(pkgPath, 'node_modules', depPkgName);

            depPkgsList.push({
                pkgName: depPkgName,
                pkgPath: depPkgPath,
            });

            if (args[0] === 'git') {
                if (!(await this.#installAsync_Git( pkgPath, abInfo, depPkgName, 
                        depPkgPath)))
                    return;
            } else if (args[0] === 'link') {
                if (!(await this.#installAsync_Link(pkgPath, abInfo, depPkgName, depPkgPath))) {
                    console.error('Cannot install link:', pkgPath);
                    return;
                }
            }
        }

        await this.#installNPMDependenciesAsync(abInfo, pkgPath);
    }


    #copyDummyPackage(pkgPath: string, depPkgName: string, depPkgPath: string) {
        let tempPath = path.join(pkgPath, '.ab-dev-temp');
        let dummyPkgDirPath = path.join(tempPath, 'dummy-node-modules', 
                depPkgName);
        fs.mkdirSync(dummyPkgDirPath);
        fs.copyFileSync(path.join(depPkgPath, 'package.json'), path.join(
                dummyPkgDirPath, 'package.json'));
    }

    // async #fixNPMLineEndings(repo: SimpleGit) {
    //     try {
    //         let index = await repo.refreshIndex();

    //         await index.addByPath('package.json');
    //         await index.addByPath('package-lock.json');
    //     } catch (err) {
    //         abLog.error(`Cannot fix NPM line ending by adding 'package.json' and 'package-lock.json': `, err);
    //     }
    // }

    async #installAsync_Git(pkgPath: string, abInfo: ABInfo, depPkgName: string, 
                depPkgPath: string): Promise<boolean> {
        let depPkgExist = false;
        if (fs.existsSync(depPkgPath)) {
            if (await helper.git_HasUnstagedChanges_Async(depPkgPath)) {
                console.log(`Cannot pull repo '${depPkgName}':`, 
                        abLog.cWarn('Unstaged changes.'));
                return false;
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
            } catch (err: any) {
                abLog.error(`Cannot pull repo '${depPkgName}':`, err.stack);
                return false;
            };
        } else {
            try {
                await repo.clone(abInfo.info.abDependencies[depPkgName].url, 
                        depPkgPath, [ '-b', 'main' ]);
                console.log(`Cloned repo: '${depPkgName}'.`);                
            } catch (err: any) {
                abLog.error(`Cannot clone repo '${depPkgName}':`, err.stack);
                return false;
            }
        }

        this.#copyDummyPackage(pkgPath, depPkgName, depPkgPath);

        // await installDependenciesAsync(depPkgPath, depPkgName);
        // await fixNPMLineEndings(repo);
        // removeDependencies(abInfo, depPkgPath, depPkgName);

        return true;
    }

    #installAsync_Link(pkgPath: string, abInfo: ABInfo, depPkgName: string, 
                depPkgPath: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (fs.existsSync(depPkgPath))
                abFS.rmdirRecursiveSync(depPkgPath);

            let childExec = childProcess.exec(`npm link ${depPkgName}`,
                    { cwd: pkgPath, }, (error, stdout, stderr) => {
                console.log(`Linking '${depPkgName}': `, stdout, stderr);

                if (error !== null) {
                    console.error(`Error linking '${depPkgName}':`, error);
                    resolve(false);
                }

                this.#copyDummyPackage(pkgPath, depPkgName, depPkgPath);

                resolve(true);
            });
        });
    }

    async #installAsync_Link_NoCopy(pkgPath: string, abInfo: ABInfo, 
                depPkgName: string, depPkgPath: string) {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(depPkgPath))
                abFS.rmdirRecursiveSync(depPkgPath);

            let childExec = childProcess.exec(`npm link ${depPkgName}`,
                    { cwd: pkgPath, }, (error, stdout, stderr) => {
                console.log(`Linking without copy '${depPkgName}': `, stdout, stderr);

                if (error !== null) {
                    console.error(`Error linking '${depPkgName}':`, error);
                    resolve(false);
                }

                this.#validateLinkedBranch_Async(depPkgName, depPkgPath, 
                        abInfo.info.abDependencies[depPkgName].branch)
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        });
    }

    async #installAsync_Links(pkgPath: string, 
            depPkgsList: Array<{ pkgPath: string, pkgName: string}>) {
        return await new Promise((resolve, reject) => {
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

                if (error !== null) {
                    console.error(`Error linking '${depPkgNames_Str}':`, error);
                    resolve(false);
                }

                for (let depPkg of depPkgsList)
                    this.#copyDummyPackage(pkgPath, depPkg.pkgName, depPkg.pkgPath);

                resolve(true);
            });
        });
    }

    // async #installDependenciesAsync(pkgPath: string, pkgName: string) {
    //     return new Promise((resolve, reject) => {
    //         childProcess.exec(`npm install`,
    //                 { cwd: pkgPath, }, (error, stdout, stderr) => {
    //             console.log(`Installing '${pkgName}' dependencies: `, stdout, stderr);

    //             if (error !== null)
    //                 abLog.error(`Error installing '${pkgName}':`, error);

    //             resolve(true);
    //         });
    //     });
    // }

    async #installNPMDependenciesAsync(abInfo: ABInfo, pkgPath: string) {
        let abDevMainPackageJSON: { name: string, version: string, 
                dependencies: { [key:string]: string} } = {
            name: "ab-dev-temp",
            version: '0.0.1',
            dependencies: {},
        };
        let pkgInfo = JSON.parse(fs.readFileSync(path.join(pkgPath, "package.json"))
                .toString());
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

                resolve(true);
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

    // #removeDependencies(abInfo: ABInfo, pkgPath: string, pkgName: string) {
    //     console.log(`Removing dependencies of '${pkgName}'...`);
    //     for (let depPkgName in abInfo.info.abDependencies) {
    //         let depPkgPath = path.join(pkgPath, 'node_modules', depPkgName);
    //         if (fs.existsSync(depPkgPath)) {
    //             if (fs.lstatSync(depPkgPath).isDirectory()) {
    //                 abFS.rmdirRecursiveSync(depPkgPath);
    //                 console.log(`Removed dependency: '${depPkgName}'.`);
    //             } else 
    //                 fs.unlinkSync(depPkgPath);
    //         }
    //     }
    // }

    async #validateLinkedBranch_Async(depPkgName: string, depPkgPath: string, 
                branch: string) {
        let depPkgPath_Real = fs.realpathSync(depPkgPath);

        let repo = simpleGit(depPkgPath_Real);
        let branchSummary = await repo.branchLocal();
        if (branchSummary.current === branch)
            return true;
        else if (!(branch in branchSummary.branches)) {
            console.error(`Branch '${branch}' does not exist in '${depPkgName}'.`);
            return false;
        } 

        if (await helper.git_HasUnstagedChanges_Async(depPkgPath_Real)) {
            console.error(`Repo '${depPkgName}:${branchSummary.current}'` +
                    ` has unstaged changes. Cannot change branch.`);
            return false;
        }

        await repo.checkout(branch);

        return true;
    }
}
const installer = new installer_Class();
export default installer;