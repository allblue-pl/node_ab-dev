import buildTS from "../helpers/build-ts.ts";

export async function tsValidate_Async(args: Array<string>): Promise<void> {
    buildTS.watchTS(process.cwd(), true);
}

export async function tsWatch(args: Array<string>): Promise<void> {
    buildTS.watchTS(process.cwd(), true);
}