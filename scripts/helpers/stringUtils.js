/**
 * @param {string} string
 * @param {string[]} keywords
 * @returns {boolean}
 */
export function isAnySubstringInString(string, keywords) {
    return keywords.some((keyword) => string.includes(keyword));
}

/**
 * @param {string} string
 * @param {string[]} comparisons
 * @returns {boolean}
 */
export function isAnyStringMatching(string, comparisons) {
    return comparisons.some((string2) => string === string2);
}

/**
 * @param {string} searchKey
 * @param {string[]} list
 * @returns {boolean}
 */
export function findSubstringInList(searchKey, list) {
    return list.find((line) => line.includes(searchKey));
}

/**
 * @param {string} searchKey
 * @param {string[]} list
 * @returns {boolean}
 */
export function findSubstringInObjectKeys(searchKey, object) {
    const result = Object.entries(object).find(([key]) =>
        searchKey.includes(key),
    );

    return result?.[1];
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
export function replaceTranslationKey(key, searchKey, returnKey, end) {
    return key.replace(searchKey, returnKey) + ` ${toTitleCase(end)}`;
}

/**
 * @param {string} newBlockId
 * @param {string} returnKey
 * @returns {string}
 */
export function generateTranslationKey(newBlockId, returnKey) {
    const displayName = toTitleCase(newBlockId);
    return returnKey + "=" + displayName;
}
