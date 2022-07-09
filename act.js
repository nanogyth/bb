/** @param {NS} ns */
export async function main(ns) {
	const [host = "unknown", threads = -1, act = "hack", target = "n00dles"] = ns.args
	if (act == "hack") {
		while (true) {
			const result = await ns.hack(target)
			const hack_lvl = ns.getHackingLevel()
			await ns.writePort(1, JSON.stringify([performance.now(), result, host, threads, act, target, hack_lvl]))
		}
	}
    const action = ns[act]
	while (true) {
        const result = await action(target)
        await ns.writePort(1, JSON.stringify([performance.now(), result, host, threads, act, target]))
    }
}