import { KEYWORD_EXCLUSIONS } from "../constants/keywordBlockExclusions.js";
import { NAMESPACE } from "../constants/namespace.js";
import { blockRenderModeExceptions } from "../renderMethods/blocksRenderManager.js";
import { isSideBlockFace } from "../helpers/blockFaceUtils.js";
import {
    parseJsonFileSync,
    parseLangDirectorySync,
    writeJsonFileSync,
    writeFileLinesSync,
} from "../helpers/fileUtils.js";
import {
    findSubstringInList,
    findSubstringInObjectKeys,
    isAnySubstringInString,
    replaceTranslationKey,
    generateTranslationKey,
} from "../helpers/stringUtils.js";
import {
    isTexturePath,
    setBlockMaterial,
    writeTextureList,
} from "../helpers/blockMaterialUtils.js";
import "../renderMethods/index.js";

const BLOCK_TYPE = "stairs";

// Base Directories
const SOURCE_DIRECTORY = "./scripts/io/src/";
const OUTPUT_DIRECTORY = "./scripts/io/output/";

// Paths
const BEHAVIOUR_PATH = `${SOURCE_DIRECTORY}/blocks/${BLOCK_TYPE}_template.block.json`;
const BLOCKS_LIST_PATH = SOURCE_DIRECTORY + "blocks.json";
const TERRAIN_TEXTURE_PATH = SOURCE_DIRECTORY + "terrain_texture.json";

const VANILLA_TEXTS_DIRECTORY = SOURCE_DIRECTORY + "vanillaTexts";
const MY_TEXTS_DIRECTORY = SOURCE_DIRECTORY + "myTexts";

const TERRAIN_TEXTURE_OUTPUT = OUTPUT_DIRECTORY + "texture_list.json";

export const terrainTextures = parseJsonFileSync(TERRAIN_TEXTURE_PATH);
const blocks = parseJsonFileSync(BLOCKS_LIST_PATH);
const blockBehaviourTemplate = parseJsonFileSync(BEHAVIOUR_PATH);
const vanillaTexts = parseLangDirectorySync(VANILLA_TEXTS_DIRECTORY);
const texts = parseLangDirectorySync(MY_TEXTS_DIRECTORY);

export let materialInstances = null;
export let itemVisualMaterials = null;

const blocksJson = {
    format_version: "1.21.40",
};

main();

function main() {
    for (const [id, vanillaData] of Object.entries(blocks)) {
        if (!vanillaData || isAnySubstringInString(id, KEYWORD_EXCLUSIONS)) {
            continue;
        }

        const blockBehaviour = structuredClone(blockBehaviourTemplate);
        const blockData = blockBehaviour["minecraft:block"];
        const components = blockData["components"];
        materialInstances = components["minecraft:material_instances"];
        itemVisualMaterials =
            components["minecraft:item_visual"]["material_instances"];

        const newBlockId = `${id}_${BLOCK_TYPE}`;
        const namespacedId = NAMESPACE + newBlockId;
        blockData["description"]["identifier"] = namespacedId;

        generateMaterials(id, vanillaData);
        generateLangKeys(vanillaTexts, {
            id: id,
            newBlockId: newBlockId,
            namespacedId: namespacedId,
        });
        generateBlocksJson(namespacedId, vanillaData);

        const blocksOutPath = `${OUTPUT_DIRECTORY}/blocks/${BLOCK_TYPE}/${newBlockId}.block.json`;
        writeJsonFileSync(blocksOutPath, blockBehaviour);
    }

    writeLangFiles(texts);
    writeJsonFileSync(OUTPUT_DIRECTORY + "blocks.json", blocksJson);
    writeTextureList(TERRAIN_TEXTURE_OUTPUT);
}

/**
 * @param {Record<string, string[]>} texts
 */
function writeLangFiles(texts) {
    for (const [lang, keys] of Object.entries(texts)) {
        const textOutputPath = `${OUTPUT_DIRECTORY}/texts/${lang}`;

        writeFileLinesSync(textOutputPath, keys);
    }
}

/**
 * @param {string} id
 * @param {Record<string, any>} vanillaData
 */
function generateMaterials(id, vanillaData) {
    const sourceTextures = vanillaData["textures"];
    const renderMethod =
        findSubstringInObjectKeys(id, blockRenderModeExceptions) ?? "opaque";

    if (isTexturePath(sourceTextures)) {
        setBlockMaterial(sourceTextures, renderMethod);
    } else {
        for (const [face, texture] of Object.entries(sourceTextures)) {
            if (!materialInstances["*"] && isSideBlockFace(face)) {
                setBlockMaterial(texture, renderMethod);
                continue;
            }

            setBlockMaterial(texture, renderMethod, face);
        }
    }
}

/**
 * @param {string} id
 * @param {Record<string, any>} vanillaData
 */
function generateBlocksJson(id, vanillaData) {
    blocksJson[id] = { sound: vanillaData["sound"] };
}

/**
 * @param {Record<string, string[]>} vanillaTexts
 * @param {Object} idReferences
 * @param {string} idReferences.id
 * @param {string} idReferences.newBlockId
 * @param {string} idReferences.namespacedId
 */
function generateLangKeys(vanillaTexts, idReferences) {
    const {
        id: id,
        newBlockId: newBlockId,
        namespacedId: namespacedId,
    } = idReferences;

    for (const [lang, keys] of Object.entries(vanillaTexts)) {
        const searchKey = `tile.${id}.name`;
        const returnKey = `tile.${namespacedId}.name`;

        let key = findSubstringInList(searchKey, keys);

        if (key) {
            key = replaceTranslationKey(key, searchKey, returnKey, BLOCK_TYPE);
        } else {
            key = generateTranslationKey(newBlockId, returnKey);
        }

        texts[lang].push(key);
    }
}
