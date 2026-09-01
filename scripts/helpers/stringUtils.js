/**
 * @param {string} string
 * @param {string[]} keywords
 * @returns {boolean}
 */
export function isAnySubstringInString(string, keywords) {
    for (const keyword of keywords) {
        if (string.includes(keyword)) {
            return true;
        }
    }
    return false;
}

/**
 * @param {string} string
 * @param {string[]} comparisons
 * @returns {boolean}
 */
export function isAnyStringMatching(string, comparisons) {
    for (const string2 of comparisons) {
        if (string2 === string) {
            return true;
        }
    }
    return false;
}

/**
 * @param {string} searchKey
 * @param {string[]} list
 * @returns {string}
 */
export function findSubstringInList(searchKey, list) {
    for (const line of list) {
        if (line.includes(searchKey)) {
            return line;
        }
    }
}

/**
 * @param {string} searchKey
 * @param {Record<string, any>} object
 * @returns {any}
 */
export function findSubstringInObjectKeys(searchKey, object) {
    for (const [key, value] of Object.entries(object)) {
        if (searchKey.includes(key)) {
            return value;
        }
    }
}

/**
 * @param {string} str
 * @returns {string}
 */
export function toTitleCase(string) {
    return string
        .replaceAll("_", " ")
        .replaceAll(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * @param {string} key
 * @param {string} searchKey
 * @param {string} returnKey
 */
export function replaceTranslationKey(key, searchKey, returnKey, suffix) {
    return key.replace(searchKey, returnKey) + ` ${toTitleCase(suffix)}`;
}

/**
 * @param {string} newBlockId
 * @param {string} returnKey
 * @returns {string}
 */
export function generateTranslationKey(blockId, translationKey) {
    const displayName = toTitleCase(blockId);
    return translationKey + "=" + displayName;
}
