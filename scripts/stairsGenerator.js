import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const KEYWORD_EXCLUSIONS = [
    "format_version",
    "air",
    "light_block",
    "stair",
    "slab",
    "sign",
    "wall",
    "fence",
    "gate",
    "door",
    "button",
    "plate",
    "candle",
    "carpet",
    "shelf",
    "sapling",
    "flower",
    // "chain",
    "vine",
    "torch",
    "lantern",
    "campfire",
    "stonecutter",
    "grindstone",
    "lectern",
    "cauldron",
    "brewing_stand",
    "anvil",
    "scaffolding",
    "banner",
    "bed",
    "skull",
    "head",
    "pot",
    "tall_grass",
    "fern",
    "roots",
    "kelp",
    "seagrass",
    "dripstone",
    "composter",
    "bell",
    "beacon",
    "hopper",
    "rail",
    "trip",
    "string",
    "web",
    "rod",
    "resin_clump",
    "cluster",
    "rose",
    "daisy",
    "lily",
    "tulip",
    "fire",
    "lava",
    "water",
    "poppy",
    "propagule",
    "bush",
    "carrot",
    "wheat",
    "potatoes",
    "wart",
    "eyeblossom",
    "dandelion",
    "bud",
    "stem",
    "bubble",
    "cake",
    "bluet",
    "cluster",
    "dripleaf",
    "orchid",
    "peony",
    "short_grass",
    "crop",
    "fungus",
    "cocoa",
    "frog",
    "daylight",
    "allium",
    "wire",
    "pane",
    "dry",
    "beetroot",
    "dust",
    "egg",
    "short_grass",
    "sprouts",
    "lilac",
    "portal",
    "lever",
    "lichen",
    "plant",
    "bamboo",
    "sculk_sensor",
    "sculk_vein",
    "statue",
    "pickle",
    "core",
    "ghast",
    "conduit",
    "comparator",
    "repeater",
    "litter",
    "petal",
    "fan",
    "spike",
    "hanging",
    "cane",
    "blossom",
    "shrieker",
];
// Manually filter redstone dust (redstone), mushrooms (non-blocks), azalea, corals, etc.
// Because there are other solid blocks that use these keywords

const RENDER_MODE_BLEND_BLOCKS = [
    "glass",
    "leaves",
    "bars",
    "ladder",
    "barrier",
    "void",
    "grate",
    "mob_spawner",
    "vault",
    "trial",
];

const NAMESPACE = "mx_stairs_plus:";
const BLOCKS_LIST = "./scripts/src/blocks.json";
const BEHAVIOUR_PATH = "./scripts/src/stair_template.block.json";
const VANILLA_TEXTS_PATH = "./scripts/src/vanillaTexts";
const MY_TEXTS_PATH = "./scripts/src/myTexts";
const OUTPUT_DIRECTORY = "./scripts/output/";

/**
 * @type {Record<string, any>}
 */
const blocks = JSON.parse(readFileSync(BLOCKS_LIST, "utf8"));

/**
 * @type {Record<string, any>}
 */
const blockBehaviourTemplate = JSON.parse(readFileSync(BEHAVIOUR_PATH, "utf8"));

/**
 * @type {Record<string, string[]}
 */
let vanillaTexts = {};

/**
 * @type {Record<string, string[]}
 */
let texts = {};

/**
 * @type {Record<string, string>}
 */
let blocksJson = {
    format_version: "1.21.40",
};

for (const file of readdirSync(VANILLA_TEXTS_PATH)) {
    const textPath = join(VANILLA_TEXTS_PATH, file);

    vanillaTexts[file] = readFileSync(textPath, "utf8").split(/\r?\n/);
}

for (const file of readdirSync(MY_TEXTS_PATH)) {
    const textPath = join(MY_TEXTS_PATH, file);

    texts[file] = readFileSync(textPath, "utf8").split(/\r?\n/);
}

for (const [id, value] of Object.entries(blocks)) {
    if (value === undefined || value === null) {
        continue;
    }

    if (KEYWORD_EXCLUSIONS.some((keyword) => id.includes(keyword))) {
        continue;
    }

    const blockBehaviour = structuredClone(blockBehaviourTemplate);
    const srcTextures = value["textures"];
    const components = blockBehaviour["minecraft:block"]["components"];
    const renderMethod = RENDER_MODE_BLEND_BLOCKS.some((keyword) =>
        id.includes(keyword),
    )
        ? "blend"
        : "opaque";
    const materialInstances = components["minecraft:material_instances"];
    const itemVisualMaterials =
        components["minecraft:item_visual"]["material_instances"];

    // console.log(id);
    if (typeof srcTextures === "string") {
        const material = {
            texture: srcTextures,
            render_method: renderMethod,
        };

        materialInstances["*"] = material;
        itemVisualMaterials["*"] = material;
    } else {
        for (const [direction, texture] of Object.entries(srcTextures)) {
            const material = {
                texture: texture,
                render_method: renderMethod,
            };

            if (
                materialInstances["*"] === undefined &&
                (direction === "side" ||
                    direction === "north" ||
                    direction === "south" ||
                    direction === "east" ||
                    direction === "west")
            ) {
                materialInstances["*"] = material;
                itemVisualMaterials["*"] = material;
            }

            materialInstances[direction] = material;
            itemVisualMaterials[direction] = material;
        }
    }

    for (const [lang, keys] of Object.entries(vanillaTexts)) {
        const searchKey = `tile.${id}.name`;
        const returnKey = `tile.${NAMESPACE}${id}_stairs.name`;

        let key = keys.find((line) => {
            return line.includes(searchKey);
        });

        if (key === undefined) {
            const displayName = toTitleCase(id) + " Stairs";
            key = returnKey + "=" + displayName;

            texts[lang].push(key);
        } else {
            key = key.replace(searchKey, returnKey) + " Stairs";

            texts[lang].push(key);
        }

        console.log(key);
    }

    const newBlockId = `${id}_stairs`;

    blocksJson[NAMESPACE + newBlockId] = { sound: value["sound"] };

    blockBehaviour["minecraft:block"]["description"]["identifier"] =
        NAMESPACE + newBlockId;

    const outPath = `${OUTPUT_DIRECTORY}/blocks/stairs/${newBlockId}.block.json`;

    writeFileSync(outPath, JSON.stringify(blockBehaviour, null, 4), {
        encoding: "utf8",
    });
}

for (const [lang, keys] of Object.entries(texts)) {
    writeFileSync(`${OUTPUT_DIRECTORY}/texts/${lang}`, keys.join("\n"), {
        encoding: "utf8",
    });
}

writeFileSync(
    `${OUTPUT_DIRECTORY}/blocks.json`,
    JSON.stringify(blocksJson, null, 4),
    {
        encoding: "utf8",
    },
);

function toTitleCase(str) {
    return str
        .replaceAll("_", " ")
        .replaceAll(/\b\w/g, (char) => char.toUpperCase());
}
