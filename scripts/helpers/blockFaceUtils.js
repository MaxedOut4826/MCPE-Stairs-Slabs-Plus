/**
 * @param {string} face
 * @returns {boolean}
 */
export function isValidBlockFace(face) {
    return (
        face === "up" ||
        face === "down" ||
        face === "side" ||
        face === "north" ||
        face === "south" ||
        face === "east" ||
        face === "west" ||
        face === "*"
    );
}

/**
 * @param {string} face
 * @returns {boolean}
 */
export function isSideBlockFace(face) {
    return (
        face === "side" ||
        face === "north" ||
        face === "south" ||
        face === "east" ||
        face === "west"
    );
}