import buildTS from "../helpers/build-ts.js";

export async function tsValidate_Async(args               )                {
    buildTS.watchTS(process.cwd(), true);
}

export async function tsWatch(args               )                {
    buildTS.watchTS(process.cwd(), true);
}