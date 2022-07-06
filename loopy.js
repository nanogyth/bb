// my modification of omuretsu's code
// https://discord.com/channels/415207508303544321/924855855457910855/994082951195263147

//Responsive checkboxes (change event)
import { addCheckbox } from "checkboxes";
export async function main(ns) {
    ns.tprint("INFO: Adding a loop checkbox that immediately tprints its value when changed.");
    globalThis["just_keep_looping"] = true

    //Add checkbox
    let loop = addCheckbox("Loop", true);

    //Clean up if script is killed
    ns.atExit(() => loop.remove());

    //Event listener for changing value of loop checkbox.
    loop.addEventListener("change", () => {
        ns.tprint(`just keep looping: ${loop.checked}`);
        just_keep_looping = loop.checked;
    });

    //Keep script alive until killed (required because ns function used inside loop change event)
    while (just_keep_looping) await delay(10_000);
}

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
