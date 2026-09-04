import { isBlockExcluded } from "../constants/keywordBlockExclusions.js";
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
    replaceTranslationKey,
    generateTranslationKey,
} from "../helpers/stringUtils.js";
import {
    isTexturePath,
    setBlockMaterial,
    writeTextureList,
} from "../helpers/blockMaterialUtils.js";
import "../renderMethods/index.js";

const blockClassesRegistry = ["stairs", "slab"];

// Base Directories
const SOURCE_DIRECTORY = "./scripts/io/src/";
const OUTPUT_DIRECTORY = "./";

// Paths
const BLOCKS_LIST_PATH = SOURCE_DIRECTORY + "blocks.json";
const TERRAIN_TEXTURE_PATH = SOURCE_DIRECTORY + "terrain_texture.json";

const VANILLA_TEXTS_DIRECTORY = SOURCE_DIRECTORY + "vanillaTexts";
const MY_TEXTS_DIRECTORY = SOURCE_DIRECTORY + "myTexts";

export const terrainTextures = parseJsonFileSync(TERRAIN_TEXTURE_PATH);
const blocks = parseJsonFileSync(BLOCKS_LIST_PATH);
const vanillaTexts = parseLangDirectorySync(VANILLA_TEXTS_DIRECTORY);
const texts = parseLangDirectorySync(MY_TEXTS_DIRECTORY);

export let materialInstances = null;
export let itemVisualMaterials = null;

const blocksJson = {
    format_version: "1.21.40",
};

generateAllBlockClasses(blockClassesRegistry);

/**
 * @param {string[]} blockClasses
 */
function generateAllBlockClasses(blockClasses) {
    for (const blockClass of blockClasses) {
        generateBlockClass(blockClass);
    }

    writeLangFiles(OUTPUT_DIRECTORY + "RP/texts/", texts);
    writeJsonFileSync(OUTPUT_DIRECTORY + "RP/blocks.json", blocksJson);
    writeTextureList(OUTPUT_DIRECTORY + "RP/textures/texture_list.json");
}

/**
 * @param {string} blockClass
 */
function generateBlockClass(blockClass) {
    for (const [id, vanillaData] of Object.entries(blocks)) {
        if (!vanillaData || isBlockExcluded(id)) {
            console.log("SKIPPED " + id);
            continue;
        }

        console.log("ADD " + id);

        const blockBehaviourTemplatePath = `${SOURCE_DIRECTORY}/blocks/${blockClass}.block.json`;
        const blockBehaviourTemplate = parseJsonFileSync(
            blockBehaviourTemplatePath,
        );
        const blockBehaviour = structuredClone(blockBehaviourTemplate);

        const blockData = blockBehaviour["minecraft:block"];
        const components = blockData["components"];
        materialInstances = components["minecraft:material_instances"];
        itemVisualMaterials =
            components?.["minecraft:item_visual"]?.["material_instances"];

        const newBlockId = `${id}_${blockClass}`;
        const namespacedId = NAMESPACE + newBlockId;

        blockData["description"]["identifier"] = namespacedId;

        generateMaterials(id, vanillaData);
        generateLangKeys(
            vanillaTexts,
            {
                id: id,
                newBlockId: newBlockId,
                namespacedId: namespacedId,
            },
            blockClass,
        );
        generateBlocksJson(namespacedId, vanillaData);
        generateRecipe(
            {
                id: id,
                newBlockId: newBlockId,
                namespacedId: namespacedId,
            },
            blockClass,
        );

        const blocksOutPath = `${OUTPUT_DIRECTORY}/BP/blocks/${blockClass}/${newBlockId}.block.json`;
        writeJsonFileSync(blocksOutPath, blockBehaviour);

        // console.log(namespacedId);
    }
}

/**
 * @param {Object} idReferences
 * @param {string} idReferences.id
 * @param {string} idReferences.newBlockId
 * @param {string} idReferences.namespacedId
 * @param {string} blockClass
 */

function generateRecipe(idReferences, blockType) {
    const {
        id: recipeItem,
        newBlockId: resultItem,
        namespacedId: resultItemId,
    } = idReferences;
    let recipeItemId = recipeItem;

    if (!recipeItemId.startsWith("minecraft:")) {
        recipeItemId = `minecraft:${recipeItem}`;
    }

    const recipe = parseJsonFileSync(
        `${SOURCE_DIRECTORY}/recipes/${blockType}.recipe.json`,
    );
    const recipeData = recipe["minecraft:recipe_shaped"];
    const recipeOutPath = `${OUTPUT_DIRECTORY}/BP/recipes/crafting/${blockType}/${resultItem}.recipe.json`;

    recipeData["key"]["X"]["item"] = recipeItemId;
    recipeData["unlock"][0]["item"] = recipeItemId;
    recipeData["description"]["identifier"] = resultItemId;
    recipeData["result"]["item"] = resultItemId;

    writeJsonFileSync(recipeOutPath, recipe);
}

/**
 * @param {Record<string, string[]>} texts
 */
function writeLangFiles(directory, texts) {
    for (const [lang, keys] of Object.entries(texts)) {
        const textOutputPath = directory + lang;

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
        return;
    }

    for (const [face, texture] of Object.entries(sourceTextures)) {
        if (!materialInstances["*"] && isSideBlockFace(face)) {
            setBlockMaterial(texture, renderMethod);
            continue;
        }

        setBlockMaterial(texture, renderMethod, face);
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
 * @param {string} blockClass
 */
function generateLangKeys(vanillaTexts, idReferences, blockClass) {
    const { id, newBlockId, namespacedId } = idReferences;

    for (const [lang, keys] of Object.entries(vanillaTexts)) {
        const searchKey = `tile.${id}.name`;
        const returnKey = `tile.${namespacedId}.name`;

        let key = findSubstringInList(searchKey, keys);

        if (key) {
            key = replaceTranslationKey(key, searchKey, returnKey, blockClass);
        } else {
            key = generateTranslationKey(newBlockId, returnKey);
        }

        texts[lang].push(key);
    }
}
