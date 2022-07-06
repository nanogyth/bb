/** @param {NS} ns */
export async function main(ns) {
	const array_name = "test123"
	try {
		globalThis[array_name] = [[]]
		ns.exec("pong.js", "home", 1, array_name, 1, 100)
		ns.exec("pong.js", "n00dles", 1, array_name, 2, 320)
		ns.exec("pong.js", "joesguns", 1, array_name, 3, 400)

		for (let i = 20; i > 0;) {
			if (globalThis[array_name][0].length > 0) {
				globalThis[array_name][globalThis[array_name][0].pop()].next()
				i--
			} else {
				await delay(16)
			}
		}
	} finally {
		globalThis[array_name] = null
	}
}

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
