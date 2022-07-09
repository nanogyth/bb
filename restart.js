import { restart } from "lib.js"

/** @param {NS} ns **/
export async function main(ns) {
    globalThis["now_offset"] = performance.now()
    ns.write("log.txt", `${new Date().toString()}`, "w")
    restart("run lib.js")
}
