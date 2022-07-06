/** @param {NS} ns */
export async function main(ns) {
	{ ns.getBitNodeMultipliers }
	// ns.tail()
	ns.tprint("start here")
	// term("run big2.js") // not enough ram
	setTimeout(term, 1, "run big2.js") // this occurs first??
	setTimeout(term, 0, "scan")
}

const doc = eval("document")

export function term(message) {
	const terminal = doc.querySelector("#terminal-input");
	const event_key = Object.keys(terminal)[1];
	terminal[event_key].onChange({ target: { value: message } });
	terminal[event_key].onKeyDown({ key: 'Enter', preventDefault: () => null });
}
