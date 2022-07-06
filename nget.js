/** @param {NS} ns */
export async function main(ns) {
	ns.tail()
	const name = "test"
	await ns.wget(`https://raw.githubusercontent.com/nanogyth/bb/master/${name}.js`, `${name}.js`)
}
