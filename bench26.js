const servers = [["n00dles", 2], ["foodnstuff", 9], ["sigma-cosmetics", 9], ["joesguns", 9], ["hong-fang-tea", 9], ["harakiri-sushi", 9], ["iron-gym", 18], ["zer0", 18], ["nectar-net", 9], ["max-hardware", 18], ["CSEC", 4], ["silver-helix", 37], ["phantasy", 18], ["omega-net", 18], ["neo-net", 18], ["netlink", 9], ["avmnite-02h", 37], ["the-hub", 37], ["I.I.I.I", 37], ["summit-uni", 9], ["zb-institute", 18], ["catalyst", 75], ["rothman-uni", 75], ["alpha-ent", 75], ["millenium-fitness", 37], ["lexo-corp", 18], ["aevum-police", 37], ["rho-construction", 9], ["global-pharm", 9], ["omnia", 37], ["unitalife", 18], ["univ-energy", 75], ["solaris", 9], ["titan-labs", 75], ["run4theh111z", 301], ["microdyne", 37], ["fulcrumtech", 75], ["helios", 37], ["vitalife", 37], [".", 9], ["omnitek", 301], ["blade", 75], ["powerhouse-fitness", 9], ["home", 19274]]
const TARGET = "rho-construction";
const EXP_PER_ACT = 51.26425925950231;

/** @param {NS} ns */
export async function main(ns) {
	// sEHT.js: 5141101744232.428
	// grader.js: INFO: Finished testing after 1 minute 0 seconds. Money increased by $5.141t, effective profit is $5.140t/min.

	await create_distribute_compile_scripts(ns);

	for (let i = 0; i < 13; i++) {
		ns.tprint(i);
		const acts = act_gen(ns);
		const hack_hosts = hack_host_gen();
		const g_delay = 0.8 * ns.getHackTime(TARGET);
		const h_delay = 3.75 * g_delay;
		const actor = {
			h: () => ns.exec("hack.js", hack_hosts.next().value, 1, h_delay),
			g: () => ns.exec("grow.js", "home", 1, g_delay),
			w: () => ns.exec("weaken.js", "home", 1, 0),
		}

		while (actor[acts.next().value]());

		// load-bearing "no-op", lets acts enqueue
		await 0;

		await ns.weaken(TARGET);
	}

	ns.tprint(ns.getPlayer().money);
}

function* act_gen(
	ns,
	sec = ns.getServerSecurityLevel(TARGET),
	money = ns.getServerMoneyAvailable(TARGET),
	exp = ns.getPlayer().exp.hacking,
	hack_level = ns.getPlayer().skills.hacking,
) {
	for (; ;) {
		const hack_const = 0.010934041966643679 * (1 - 504 / hack_level);
		const exp_for_next_lvl = Math.exp(0.013037547693914638 * (hack_level + 1) + 6.25) - 534.6;
		const acts = Math.ceil((exp_for_next_lvl - exp) / EXP_PER_ACT);

		yield* act_gen_at_lvl();

		hack_level += 1;
		exp += acts * EXP_PER_ACT;

		function* act_gen_at_lvl() {
			for (let i = 0; i < acts; i++) {
				const sec_after_w = sec - 0.05625;
				const money_after_g = (money + 1) * Math.exp(1.0254347658260865 * Math.log1p(0.03 / sec));
				if (sec_after_w >= 15) {
					sec = sec_after_w;
					yield "w";
				} else if (money_after_g <= 15_000_000_000) {
					money = money_after_g;
					sec += 0.004;
					yield "g";
				} else {
					money *= 1 - hack_const * (1 - 0.01 * sec);
					sec += 0.002;
					yield "h";
				}
			}
		}
	}
}

function* hack_host_gen() {
	for (const [server, threads] of servers) {
		for (let i = 0; i < threads; i++) {
			yield server;
		}
	}
}

async function create_distribute_compile_scripts(ns) {
	for (const command of ["hack", "grow", "weaken"]) {
		const file_name = command + ".js";
		const message = `export async function main(ns) {
	await ns.${command}("${TARGET}", { additionalMsec: ns.args[0] });\n}`;

		ns.write(file_name, message, "w");

		for (const [server] of servers) {
			ns.scp(file_name, server);
		}

		await ns.dynamicImport(file_name);
	}
}
