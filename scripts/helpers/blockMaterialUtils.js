import { isValidBlockFace } from "./blockFaceUtils.js";
import {
    terrainTextures,
    itemVisualMaterials,
    materialInstances,
} from "../generators/blocksGenerator.js";
import { writeJsonFileSync } from "./fileUtils.js";
import { isAnyStringMatching } from "./stringUtils.js";

let textureCache = [];

/**
 * @param {string | object | string[] | object[]} textures
 * @returns {boolean}
 */
export function isTexturePath(textures) {
    return typeof textures === "string";
}

/**
 * @param {string | object | string[] | object[]} textures
 * @returns {boolean}
 */
export function isTextureObject(textures) {
    return typeof textures === "object";
}

/**
 * @param {string | object | string[] | object[]} textures
 * @returns {boolean}
 */
export function isTextureArray(textures) {
    return Array.isArray(textures);
}

/**
 * @param {string} texture
 * @param {string} renderMethod
 * @param {string} face
 */
export function setBlockMaterial(texture, renderMethod, face) {
    if (!face || !isValidBlockFace(face)) {
        face = "*";
    }

    const material = {
        texture: texture,
        render_method: renderMethod,
    };

    materialInstances[face] = material;
    if (itemVisualMaterials !== undefined) {
        itemVisualMaterials[face] = material;
    }

    cacheTexture(texture);
}

/**
 * @param {string | object | string[] | object[]} textureData
 */
function tryPushTextureToCache(textureData) {
    if (!textureData) {
        return;
    }

    if (isTexturePath(textureData)) {
        if (!isAnyStringMatching(textureData, textureCache)) {
            textureCache.push(textureData);
            // console.info(
            //     `[${textureData}] Successfully pushed texture to cache`,
            // );
            return;
        }
        // console.error(
        //     `[${textureData}] Cannot register duplicate texture paths to cache`,
        // );
        return;
    }

    if (isTextureObject(textureData) && textureData["path"]) {
        tryPushTextureToCache(textureData["path"]);
        return;
    }

    if (isTextureArray(textureData)) {
        for (const texture of textureData) {
            tryPushTextureToCache(texture);
        }
        return;
    }

    return console.error(
        `[${JSON.stringify(textureData)}] Unknown texture data; cannot push to cache`,
    );
}

/**
 * @param {string} textureDefinition
 * @param {Record<string, string | object | string[] | object[]>} terrainTextures
 */
export function cacheTexture(textureDefinition) {
    const definitionData = terrainTextures["texture_data"][textureDefinition];

    if (!definitionData) {
        return console.error(
            `[${JSON.stringify(textureDefinition)}] Texture definition not found`,
        );
    }

    const textureData = definitionData["textures"];

    tryPushTextureToCache(textureData);
}

export function writeTextureList(path) {
    writeJsonFileSync(path, textureCache);
}
