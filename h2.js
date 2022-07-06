import { study } from "lib.js"

/** @param {NS} ns */
export async function main(ns) {
	study(3)
	await ns.hack("n00dles")
	study(2) // might not be on track if a hack failed...
	await ns.hack("n00dles")
	study(3)
	ns.tprint("INFO: START P1 !")
}
