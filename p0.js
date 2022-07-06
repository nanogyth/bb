import { server_data } from "data.js"
import { term, study, hack_time, unfocusing_term, unfocusing_respawn } from "lib.js"

/** @param {NS} ns */
export async function main(ns) { // 1.85 GB // 8 - 3*1.7 = 2.9 available
	const [file = 'h.js', req_hack = 1, diff = 1, hack_sm = 1, int = 1] = ns.args
	const hack_constant = 1000 * (12.5 * req_hack * diff + 2500) / hack_sm / int
	let hack_lvl, ht
	term(`c_n00dles; run NUKE.exe`)
	for (const name of ["foodnstuff", "sigma-cosmetics", "joesguns",
		"hong-fang-tea", "harakiri-sushi", "nectar-net", "n00dles"]) {
		term(`home; scp ${file} ${name}`)
		term(`c_${name}; run NUKE.exe; run ${file} -t ${server_data[name].maxRam / 1.7}`); //await ns.sleep(0)
		await ns.sleep(16)

		// await ns.scp(file, name) // 0.6 GB
		// ns.nuke(name) // 0.05 GB
		// ns.exec(file, name, 9) // 1.3 GB
	}
	term(`home; run ${file} -t 3`)
	study(3)
	let max_study = true
	try {
		while (true) {
			if (ns.getServerMoneyAvailable("home") >= 700_000) { // 0.1 GB
				study(0)
				ns.killall("home", true) // 0.5 GB
				await unfocusing_respawn('home; run p1.js')
				return
			}
			hack_lvl = ns.getHackingLevel() // 0.05 GB
			if (hack_lvl != sessionStorage.hacking) {
				sessionStorage.hacking = hack_lvl
				ht = hack_constant / (+hack_lvl + 50)
				// ns.toast(`${hack_time}`, 'info')
				// logging ??
				if (hack_lvl >= 15 && max_study) {
					study(2)
					max_study = false
				}
			}
			const above_min = ns.getServerSecurityLevel('n00dles') - 1
			const money = ns.getServerMoneyAvailable("n00dles") / 1_750_000
			if (above_min > 0.051) { // 0.1 GB
				ns.toast(`weak n00dles ${above_min.toFixed(3)} ${(money * 100).toFixed(0)}%`)
				await unfocusing_term('c_n00dles; weaken', ht / 4)
			} else {
				ns.toast(`grow n00dles ${above_min.toFixed(3)} ${(money * 100).toFixed(0)}%`)
				await unfocusing_term('c_n00dles; grow', ht / 5)
			}
			// if (money < 0.56) { // 0.1 GB
			// 	ns.toast(`grow n00dles ${above_min.toFixed(3)} ${(money * 100).toFixed(0)}%`)
			// 	await unfocusing_term('c_n00dles; grow', ht / 5)
			// } else {
			// 	ns.toast(`weak n00dles ${above_min.toFixed(3)} ${(money * 100).toFixed(0)}%`)
			// 	await unfocusing_term('c_n00dles; weaken', ht / 4)
			// }

			// } else if (ns.getServerMoneyAvailable("n00dles") < 962_500) { // 1_750_000 * 0.55
			// } else if (hack_lvl >= 10) {
			// 	const jg = server_data["joesguns"]
			// 	jg.hackDifficulty = ns.getServerSecurityLevel("joesguns")
			// 	const ht_j = hack_time(jg, sessionStorage) * 1000
			// 	ns.toast(`weaken joesguns ${ht_j}`)
			// 	await unfocusing_term('c_joesguns; weaken', ht_j / 4)
			// }
		}
	} catch (err) {
		ns.toast(`? ${err} ?`, 'error', 10_000)
	}
}
