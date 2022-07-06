import { server_data } from "data.js"
import { term } from "lib.js"

/** @param {NS} ns */
export async function main(ns) {
	const file = 'h.js'
	for (const [name, { numOpenPortsRequired, maxRam }] of Object.entries(server_data)) {
		if (numOpenPortsRequired == 0) {
			ns.nuke(name) // n00dles should be first, execs will fail if it isn't
			await ns.scp(file, "home", name)
			ns.exec(file, name, Math.floor(maxRam / 1.7)) // problematic to have the 2 go before the 9s?
            // exec rounds to nearest, instead of floor !!!
		}
	}
	ns.exec("loop0.js", "home")
	setTimeout(term, 0, "home; run h2.js -t 3")
}
