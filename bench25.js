/** @param {NS} ns */
export async function main(ns) {
	// grader.js: Finished testing after 1 hour 0 seconds. Money increased by $4.763t, effective profit is $79.382b/min

	const [h, g, w, shots, salvos] = [5, 11, 1, 1213, 13];
	// const host_list = [["n00dles", 2], ["foodnstuff", 9],];
	const host_list = [["n00dles", 2], ["foodnstuff", 9], ["sigma-cosmetics", 9], ["joesguns", 9], ["hong-fang-tea", 9], ["harakiri-sushi", 9], ["iron-gym", 18], ["zer0", 18], ["nectar-net", 9], ["max-hardware", 18], ["CSEC", 4], ["silver-helix", 37], ["phantasy", 18], ["omega-net", 18], ["neo-net", 18], ["netlink", 9], ["avmnite-02h", 37], ["the-hub", 37], ["I.I.I.I", 37], ["summit-uni", 9], ["zb-institute", 18], ["catalyst", 75], ["rothman-uni", 75], ["alpha-ent", 75], ["millenium-fitness", 37], ["lexo-corp", 18], ["aevum-police", 37], ["rho-construction", 9], ["global-pharm", 9], ["omnia", 37], ["unitalife", 18], ["univ-energy", 75], ["solaris", 9], ["titan-labs", 75], ["run4theh111z", 301], ["microdyne", 37], ["fulcrumtech", 75], ["helios", 37], ["vitalife", 37], [".", 9], ["omnitek", 301], ["blade", 75], ["powerhouse-fitness", 9], ["home", 19272],];
	// const target = "n00dles";
	const target = "rho-construction";

	create_distribute_scripts(ns, host_list, target);
	shot(ns, 1, 1, 1, 0, 0, "home", 1);
	await ns.sleep(1);

	for (let i = 0; i < salvos; i++) {
		ns.tprint(i);
		salvo(ns, h, g, w, target, host_list, shots);
		await ns.weaken(target);
		await ns.sleep(100);
	}

}

function salvo(ns, h, g, w, target, host_list, shots) {
	const hack_time = ns.getHackTime(target);
	const hack_delay = 3 * hack_time;
	const grow_delay = 0.8 * hack_time;
	let i = 0;
	for (let [host, hacks] of host_list) {
		while (hacks > 0) {
			shot(ns, h, g, w, hack_delay, grow_delay, host, hacks);
			hacks -= h;
			i++;
			if (i >= shots) {
				return;
			}
		}
	}
}

function shot(ns, h, g, w, hack_delay, grow_delay, host, hacks = h) {
	if (hacks >= h) {
		ns.exec("hack.js", host, h, hack_delay);
	} else {
		ns.exec("hack.js", host, hacks, hack_delay);
		ns.exec("hack.js", "home", h - hacks, hack_delay);
	}
	ns.exec("grow.js", "home", g, grow_delay);
	ns.exec("weaken.js", "home", w, 0);
}

function create_distribute_scripts(ns, servers, target) {
	for (const command of ["hack", "grow", "weaken"]) {
		create_distribute_script(ns, command, servers, target)
	}
}

function create_distribute_script(ns, command, servers, target) {
	const file_name = command + ".js";
	const message = `export async function main(ns) {
				await ns.${command}("${target}", { additionalMsec:  ns.args[0] });
		}`
	//  ns.tprint(["${command}", performance.now(), "jai"]); 

	ns.write(file_name, message, "w");

	for (const [server, _] of servers) {
		ns.scp(file_name, server);
	}
}
