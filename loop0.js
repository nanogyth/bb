import { get_term, term, delay, refocus, hack_time, grow_fraction, addCheckbox, usi } from "lib.js"

/** @param {NS} ns */
export async function main(ns) {
    let loop = addCheckbox("Loop", true);
    ns.atExit(() => loop.remove());
    loop.addEventListener("change", () => {
        just_keep_looping = loop.checked;
    });

    const server = ng_server_data["n00dles"]
    const gf = grow_fraction(server)
    let term_busy_until = 0
    let msg = "weak", ht
    while (just_keep_looping) {
        const hack_lvl = ns.getHackingLevel() // 0.05 GB
        const home_money = usi(ns.getServerMoneyAvailable("home"))
        let sec = ns.getServerSecurityLevel("n00dles") - 1
        let money = ns.getServerMoneyAvailable("n00dles") / 1_750_000
        await ns.write("log.txt", `\r\n${usi(performance.now() - now_offset)} ${hack_lvl} ${home_money} ${sec.toFixed(3)} ${money.toFixed(3)}`)
        // ns.toast(`${sec.toFixed(3)} ${money.toFixed(3)}`)
        // add html info, svg visual?

        if (performance.now() >= term_busy_until) {
            await get_term()
            const sec = ns.getServerSecurityLevel("n00dles") - 1
            const money = ns.getServerMoneyAvailable("n00dles") / 1_750_000;
            [ht, msg] = [200 * hack_time(server, hack_lvl), "grow"] // watch out for those leading [] ;;
            if (sec > 0.051 || (money >= 1 && sec > 0)) {
                [ht, msg] = [1.25 * ht, "weaken"]
            }
            ns.toast(`${sec.toFixed(3)} ${money.toFixed(3)} ${msg}`, "info", ht)
            term("c_n00dles; " + msg)
            term_busy_until = performance.now() + ht // build in extra delay?
            await ns.write("log.txt", `\r\n  term ${msg} ${sec.toFixed(3)} ${money.toFixed(3)}`)
            while (true) {
                const out = ns.readPort(1)
                if (out == "NULL PORT DATA") break
                const [now, result, host, threads, act, target, hack_lvl = ""] = JSON.parse(out)
                await ns.write("log.txt", `\r\n  ${usi(now - now_offset)} ${usi(result)} ${host} ${threads} ${act} ${target} ${hack_lvl}`)
            }
        }
        refocus()
        await delay(Math.min(1_000, term_busy_until - performance.now()))
    }
}
