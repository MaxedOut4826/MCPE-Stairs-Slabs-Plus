/**
 * Returns a boolean indicating if the provided block face key is valid.
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
 * Returns a boolean indicating if the provided block face key is a side face.
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
