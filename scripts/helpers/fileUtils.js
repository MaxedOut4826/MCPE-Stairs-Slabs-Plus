import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * @param {string} path
 * @returns {Record<string, any>}
 */
export function parseJsonFileSync(path) {
    return JSON.parse(readFileSync(path, "utf8"));
}

/**
 * @param {string} path
 * @returns {string[]}
 */
export function parseFileLinesSync(path) {
    return readFileSync(path, "utf8").split(/\r?\n/);
}

/**
 * @param {string} directory
 * @returns {Record<string, string[]>}
 */
export function parseLangDirectorySync(directory) {
    let texts = {};
    for (const file of readdirSync(directory)) {
        const textPath = join(directory, file);
        const fileContents = parseFileLinesSync(textPath);
        texts[file] = fileContents;
    }
    return texts;
}

/**
 * @param {import("node:fs").PathOrFileDescriptor} file
 * @param {string | ArrayBufferView} data
 * @param {import("node:fs").WriteFileOptions} options
 */
export function writeJsonFileSync(file, data, options) {
    if (!options) {
        options = { encoding: "utf8" };
    }

    writeFileSync(file, JSON.stringify(data, null, 4), options);
}

/**
 * @param {import("node:fs").PathOrFileDescriptor} file
 * @param {string | ArrayBufferView} data
 * @param {import("node:fs").WriteFileOptions} options
 */
export function writeFileLinesSync(file, keys, options) {
    if (!options) {
        options = { encoding: "utf8" };
    }

    writeFileSync(file, keys.join("\n"), options);
}
