import { term } from "lib.js"

/** @param {NS} ns */
export async function main(ns) {
    ns.exec("loop0.js", "home")
    const file = "act.js"
    for (const [name, { numOpenPortsRequired, maxRam }] of Object.entries(ng_server_data)) {
        if (numOpenPortsRequired == 0) {
            ns.nuke(name) // n00dles should be first, execs will fail if it isn't
            await ns.scp(file, "home", name)
            const threads = Math.floor(maxRam / 1.7)
            ns.exec(file, name, threads, name, threads, "hack", "n00dles") // problematic to have the 2 go before the 9s?
        }
    }
    setTimeout(term, 0, "home; run act.js -t 3 home 3 hack n00dles")
}
