/** @param {NS} ns */
export async function main(ns) {
	ns.tail()
	const name = "test.js"
	if (ns.fileExists(name)) {
		ns.rm(name)
		ns.print(`removing ${name}`)
		if (!ns.fileExists(name)) {
			ns.print("deleted")
		}
	}
	// await ns.wget(`https://raw.githubusercontent.com/nanogyth/bb/master/${name}`, name)

	// const res = await fetch(`https://raw.githubusercontent.com/nanogyth/bb/master/${name}`)
	// const txt = await res.text()
	// await ns.write(name, txt, "w")

	let x = fetch(`https://raw.githubusercontent.com/nanogyth/bb/master/${name}`)
		.then(response => response.text())
		.then(text => ns.write(name, text, "w"))

	// fetch/then train will allow script to keep running
	// so the script will close if nothing is there to keep it open
	await x
}
