import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Reads and returns the contents of the file at the path formatted as JSON if possible.
 * @param {string} path
 * @returns {Record<string, any>}
 */
export function parseJsonFileSync(path) {
    return JSON.parse(readFileSync(path, "utf8"));
}

/**
 * Reads and returns the contents of the file at the path divided into lines.
 * @param {string} path
 * @returns {string[]}
 */
export function parseFileLinesSync(path) {
    return readFileSync(path, "utf8").split(/\r?\n/);
}

/**
 * Reads and returns the contents of all files in the directory divided into lines.
 *
 * Formatted as { fileName: contents }.
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
 * Writes unstructured JSON data to the file at the output location structured as formatted JSON if possible.
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
 * Writes multi-line data to the file at the output location separated by new lines.
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
