/** @param {NS} ns */
export async function main(ns) {
	const [array_name, slot, wait] = ns.args
	globalThis[array_name][slot] = doit()
	globalThis[array_name][slot].next()

	async function* doit() {
		let i = 0
		while (true) {
			globalThis[array_name][0].push(slot)
			yield
			await delay(wait)
			ns.tprint(`${slot} ${i++}`)
		}
	}

	while (globalThis[array_name]) {
		await delay(1_000)
	}

	ns.tprint(`closing slot ${slot}`)
}

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
