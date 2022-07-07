// import { server_data } from "data.js"
import { get_term, term, delay, refocus, hack_time, grow_fraction, addCheckbox } from "lib.js"

/** @param {NS} ns */
export async function main(ns) {
	let loop = addCheckbox("Loop", true);
	ns.atExit(() => loop.remove());
	loop.addEventListener("change", () => {
		// ns.tprint(`just keep looping: ${loop.checked}`);
		just_keep_looping = loop.checked;
	});

	const server = ng_server_data["n00dles"]
	const gf = grow_fraction(server)
	let term_busy_until = 0
	let msg = "weak", ht
	while (just_keep_looping) {
		refocus()
		const hack_lvl = ns.getHackingLevel() // 0.05 GB
		let sec = ns.getServerSecurityLevel("n00dles") - 1
		let money = ns.getServerMoneyAvailable("n00dles") / 1_750_000
		ns.toast(`${sec.toFixed(3)} ${money.toFixed(3)}`)
		// add html info, svg visual?

		if (performance.now() >= term_busy_until) {
			await get_term()
			const sec = ns.getServerSecurityLevel("n00dles") - 1
			const money = ns.getServerMoneyAvailable("n00dles") / 1_750_000;
			[ht, msg] = [200 * hack_time(server, hack_lvl), "grow"] // watch out for those leading [] ;;
			if (sec > 0.051 || (money >= 1 && sec > 0)) {
				[ht, msg] = [1.25 * ht, "weaken"]
			}
			ns.toast(`${sec.toFixed(3)} ${money.toFixed(3)} ${msg}`, "info", ht + 1_000)
			term("c_n00dles; " + msg)
			term_busy_until = performance.now() + ht // build in extra delay?
		}
		await delay(Math.min(1_000, term_busy_until - performance.now()))
	}
}
