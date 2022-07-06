import { server_data } from "data.js"
import { aterm, delay } from "lib.js"
import { hack_time } from "lib2.js"

/** @param {NS} ns */
export async function main(ns) {
	const server = server_data["n00dles"]
	let term_busy_until = 0
	// while (true) { // global/button to stop looping?
	for (let i = 20; i > 0; i--) { // global/button to stop looping?
		const hack_lvl = ns.getHackingLevel() // 0.05 GB
		const above_min = ns.getServerSecurityLevel("n00dles") - 1
		const money = ns.getServerMoneyAvailable("n00dles") / 1_750_000
		ns.toast(`${above_min.toFixed(3)} ${money.toFixed(3)}`)
		// add html info, svg visual?
		const now = performance.now()
		if (now >= term_busy_until) {
			let [ht, msg] = [200 * hack_time(server, hack_lvl), "c_n00dles; grow"]
			if (above_min > 0.051 || (money == 1 && above_min > 0)) {
				[ht, msg] = [1.25 * ht, "c_n00dles; weaken"]
			}
			term_busy_until = now + ht
			await aterm(msg)
		}
		await delay(Math.min(1_000, term_busy_until - now))
	}
}
