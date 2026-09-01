export const blockRenderModeExceptions = {};

/**
 * @param {string} renderMethod
 * @param {string[]} blocks
 * @returns
 */
export function registerBlocksRenderMethod(renderMethod, blocks) {
    for (let keyword of blocks) {
        keyword = keyword.replace("minecraft:", "");

        if (keyword in blockRenderModeExceptions) {
            return console.error(
                `[${keyword}] Duplicate keywords registered to the blocks render method exceptions`,
            );
        }

        blockRenderModeExceptions[keyword] = renderMethod;
    }
}
