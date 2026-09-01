import { registerBlocksRenderMethod } from "../blocksRenderManager.js";
import { RenderMethods } from "../renderMethods.js";

registerBlocksRenderMethod(RenderMethods.Blend, [
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
]);
