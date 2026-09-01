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
 * Returns a boolean indicating if the texture data provided is a direct path of type string.
 * @param {string | object | string[] | object[]} textures
 * @returns {boolean}
 */
export function isTexturePath(textures) {
    return typeof textures === "string";
}

/**
 * Returns a boolean indicating if the texture data provided is structured data of type object.
 * @param {string | object | string[] | object[]} textures
 * @returns {boolean}
 */
export function isTextureObject(textures) {
    return typeof textures === "object";
}

/**
 * Returns a boolean indicating if the texture data provided is an array of texture data.
 * @param {string | object | string[] | object[]} textures
 * @returns {boolean}
 */
export function isTextureArray(textures) {
    return Array.isArray(textures);
}

/**
 * Sets the block material data for a custom block during generation.
 *
 * Will generate textures and render methods for the main material, and item visual if possible.
 *
 * Applying materials via this method automatically adds them to the textures cache at texture_list.json.
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
 * Will attempt to push a texture to the textures cache at texture_list.json.
 *
 * Searches through data based on common structures until it finds a path it can push.
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
 * Pushes a texture to the textures cache at texture_list.json.
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
