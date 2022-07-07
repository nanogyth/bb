// import { server_data } from "data.js"
import { aterm, delay, refocus, hack_time, grow_fraction, addCheckbox } from "lib.js"

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
		const sec = ns.getServerSecurityLevel("n00dles") - 1
		const money = ns.getServerMoneyAvailable("n00dles") / 1_750_000
		ns.toast(`${sec.toFixed(3)} ${money.toFixed(3)}`)
		// add html info, svg visual?

		if (performance.now() >= term_busy_until) {
			// these don't update instantly???, so predict the future
			// probably looping here and waiting before last action finished
			// const g_threads = Math.min(25, Math.ceil(Math.log(1 / money) / Math.log(gf)))
			// const [p_sec, p_money] = msg == "grow" ? [sec + 0.004 * g_threads, money * gf ** g_threads] : [sec - 0.05, money]
			// const [p_sec, p_money] = [sec, money]
			[ht, msg] = [200 * hack_time(server, hack_lvl), "grow"]
			if (sec > 0.051 || (money >= 1 && sec > 0)) {
				[ht, msg] = [1.25 * ht, "weaken"]
			}
			ns.toast(`${sec.toFixed(3)} ${money.toFixed(3)} ${msg}`, "info", ht + 1_000)
			// term_busy_until = now + ht // this needs to be set after the await, with a live now
			await aterm("c_n00dles; " + msg)
			term_busy_until = performance.now() + ht // build in extra delay?
		}
		await delay(Math.min(1_000, term_busy_until - performance.now()))
	}
}
