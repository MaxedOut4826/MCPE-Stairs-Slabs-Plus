import { system } from "@minecraft/server";

system.beforeEvents.startup.subscribe(() => {
    console.log("Scripts startup");
});
