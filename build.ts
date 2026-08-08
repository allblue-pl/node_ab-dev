import { abTSWatcher } from "@allblue/ab-ts-parser";
import path from "node:path";

abTSWatcher.watch(path.resolve("."), path.resolve("."));