/** @param {NS} ns */
export async function main(ns) {
    async function process_name(name) {
        return fetch(`https://raw.githubusercontent.com/nanogyth/bb/master/${name}`)
            .then(response => response.text())
            .then(text => ns.write(name, text, "w"))
    }
    
    await Promise.all(["lib.js", "mult.js", "p0.js", "act.js", "loop0.js", "restart.js"].map(process_name))
    ns.tprint("setup options then run restart.js")
}
