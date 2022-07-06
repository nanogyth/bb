import { restart } from "lib.js"

/** @param {NS} ns **/
export async function main(ns) {
    ns.rm('data.js')
    sessionStorage.clear()
    // for (const s of ["foodnstuff", "sigma-cosmetics", "joesguns",
    //     "hong-fang-tea", "harakiri-sushi", "nectar-net", "n00dles", "home"]) {
    //     ns.killall(s, true)
    // }
    await restart("run lib.js")
}
