// import { multipliers } from "data.js" // globalize
// import { study, unfocus, term } from "lib.js"

export let checkboxes = {},
    doc = globalThis["document"],
    cbDiv = doc.querySelector(".checkboxContainer")

/** @param {NS} ns */
export async function main(ns) {
    globalThis["just_keep_looping"] = true
    study(3)
    cb_initialize({ ...ns.ui.getTheme(), ...ns.ui.getStyles() })
    unfocus()
    all_servers(ns)
    // ns.tprint(ng_server_data)
    setTimeout(term, 0, "home; run mult.js")
}

export let cb_initialize = ({ primary = "#fd0", secondary = "#28c", fontFamily = "Comic Sans MS" }) => {
    // checkbox methods from omuretsu
    // https://discord.com/channels/415207508303544321/924855855457910855/994342446555213916
    let style = `<style>
  .checkboxContainer input{
    appearance:none;
    font:14px "${fontFamily}";
  }
  .checkboxContainer input::after{
    content:attr(data-unchecked);
    color:${secondary};
  }
  .checkboxContainer input:checked::after{
    content:attr(data-checked);
    color:${primary};
  }</style>`;
    if (cbDiv) {
        //If already initialized but isn't on page, add it back to the page if possible.  
        if (!doc.body.contains(cbDiv)) return doc.querySelector(".react-draggable")?.appendChild(cbDiv);
        //If already initialized and was already on the page, just change the style to what was provided
        return cbDiv.querySelector("style").outerHTML = style;
    }
    cbDiv = doc.createElement("div");
    cbDiv.classList.add("checkboxContainer");
    cbDiv.innerHTML = style;
    doc.querySelector(".react-draggable").appendChild(cbDiv);
}

if (!cbDiv || !doc.body.contains(cbDiv)) cb_initialize({});

export let addCheckbox = (name, checked = false, uncheckedText = name + " OFF", checkedText = name + " ON") => {
    if (checkboxes[name]) {
        console.log(`Duplicate name ${name} was provided for a checkbox. Providing existing checkbox.`);
        return checkboxes[name];
    }
    let row = cbDiv.appendChild(doc.createElement("div"));
    row.innerHTML = `<input type=checkbox data-unchecked="${uncheckedText}" data-checked="${checkedText}"${checked ? " checked" : ""}>`;
    let checkbox = row.querySelector("input");
    checkbox.remove = () => {
        row.remove();
        delete checkboxes[name];
    };
    checkboxes[name] = checkbox;
    return checkbox;
};

export function kill_dots(str) {
    // "I.I.I.I" => "IIII"
    // "." => ""
    return str.replace(/\./g, "")
}

function all_servers(ns) {
    // needs open term for alias spam
    const server_data = {}
    for (const [name, route] of Object.entries(routes(ns))) {
        term(`alias c_${kill_dots(name)}="${route}"`) // alias dies on "I.I.I.I" and "."
        server_data[name] = process_name(ns, name)
    }
    globalThis["ng_server_data"] = server_data
}

function process_name(ns, name) {
    const { numOpenPortsRequired,
        maxRam,
        baseDifficulty,
        minDifficulty,
        requiredHackingSkill,
        serverGrowth,
        moneyMax } = ns.getServer(name)
    return {
        numOpenPortsRequired,
        maxRam,
        baseDifficulty,
        minDifficulty,
        requiredHackingSkill,
        serverGrowth,
        moneyMax
    }
}

function routes(ns) {
    const route_data = {}
    const found_names = ["home"]
    // can't loop over route_data directly
    // Object.keys won't iterate over keys added later
    for (const name of found_names) {
        for (const new_name of ns.scan(name)) {
            if (!route_data[new_name]) {
                found_names.push(new_name)
                route_data[new_name] = `${route_data[name] ?? "home"}; connect ${new_name}`
            }
        }
    }
    return route_data
}

function total_time_to_cash(server, hacking, available_threads, goal_money) {
    const total = time_to_prep(server, hacking, available_threads)
        + time_to_cash(server, hacking, available_threads, goal_money)
    if (isNaN(total)) return Infinity
    return total
}

function time_to_cash(server, hacking, available_threads, goal_money) {
    const effective_GB = 1.75 * available_threads
    const mps = money_per_GB_s(server, hacking) * effective_GB
    // money = mps * time; time = money / mps
    return goal_money / mps
}

function time_to_prep(server, hacking, available_threads) {
    const { baseDifficulty, minDifficulty } = server

    const weakens_needed = (baseDifficulty - minDifficulty) / 0.05
    const w_threads = 4 * weakens_needed
    const w_hack_times = w_threads / available_threads
    const avg_hack_time = (
        hack_time(server, hacking, baseDifficulty)
        + hack_time(server, hacking, minDifficulty)
    ) / 2
    const w_time = w_hack_times * avg_hack_time

    const grows_needed = Math.log(25) / Math.log(grow_fraction(server, hacking))
    const grow_weakens_needed = grows_needed * 0.004 / 0.05
    const gw_threads = 3.2 * grows_needed + 4 * grow_weakens_needed
    const gw_hack_times = gw_threads / available_threads
    const gw_time = gw_hack_times * hack_time(server, hacking)
    return w_time + gw_time
}

// need way to pass in more args to test_func
export function find_best(hacking, test_func = money_per_GB_s) {
    const best_list = Object.entries(ng_server_data)
        .map(([n, s]) => [n, test_func(s, hacking)])
        .sort((x, y) => y[1] - x[1])
        .filter(([n, rate]) => rate > 0)
    return best_list // can't return directly because of line continueation issues
}

export function money_per_GB_s(server, hacking) {
    // calculate money per second per GB

    const ht = hack_time(server, hacking)
    const [h, g, w] = hgw_calc(server, hacking)
    const cycle_GBs = ht * (1.7 * h + 3.2 * 1.75 * g + 4.0 * 1.75 * w)

    const hf = hack_fraction(server, hacking)
    const hc = hack_chance(server, hacking)
    const cycle_money = server.moneyMax * h * hf * hc

    return cycle_money / cycle_GBs || 0
}

export function hgw_calc(server, hacking, safety = 1.1) {
    const hf = hack_fraction(server, hacking)
    const gf = grow_fraction(server, hacking)
    const hc = hack_chance(server, hacking)

    // number of acts, calculate based on one grow
    // 1 / grow_fraction = fraction before grow to end at 100%
    // 1 - 1 / grow_fraction = amount to hack from 100% to end back at 100% after grow
    const h = (1 - 1 / gf) / hf / safety / hc
    const g = 1
    const w = (0.004 * g + 0.002 * h * hc) / 0.05 * safety
    return [h, g, w]

    // normalize, divide by total to get fractional part that add to 1
    // const total = h + g + w
    // return [h / total, g / total, w / total]
}

export function hack_fraction(server, hacking, _hackDifficulty) {
    const { hacking_money_mult, ScriptHackMoney } = ng_multipliers
    const { requiredHackingSkill, minDifficulty, hackDifficulty } = server
    _hackDifficulty = _hackDifficulty ?? hackDifficulty ?? minDifficulty
    // _hackDifficulty ??= hackDifficulty ??= minDifficulty // does this work???

    const hack_fraction =
        hacking_money_mult * ScriptHackMoney / 240
        * (1 - _hackDifficulty / 100)
        * (1 - (requiredHackingSkill - 1) / hacking)

    return Math.max(hack_fraction, 0)
}

export function grow_fraction(server, cores = 1, threads = 1, _hackDifficulty = null) {
    const { hacking_grow_mult, ServerGrowthRate } = ng_multipliers
    const { serverGrowth, minDifficulty, hackDifficulty } = server
    _hackDifficulty = _hackDifficulty ?? hackDifficulty ?? minDifficulty

    const grow_base = Math.min(1.0035, (1 + 0.03 / _hackDifficulty)) // 1.0035 when hackDifficulty < 8.571
    const grow_exp =
        hacking_grow_mult * ServerGrowthRate / 100
        * serverGrowth
        * (1 + (cores - 1) / 16)
        * threads

    return Math.pow(grow_base, grow_exp)
}

export function hack_xp(server) {
    const { hacking_exp_mult, HackExpGain } = ng_multipliers
    const { baseDifficulty } = server

    return (3 + 0.3 * baseDifficulty * hacking_exp_mult) * HackExpGain
}

export function hack_chance(server, hacking, _hackDifficulty, int) {
    const { hacking_chance_mult } = ng_multipliers
    const { requiredHackingSkill, minDifficulty, hackDifficulty } = server
    _hackDifficulty = _hackDifficulty ?? hackDifficulty ?? minDifficulty

    const hack_chance =
        hacking_chance_mult
        * (1 - requiredHackingSkill / hacking / 1.75)
        * (1 - _hackDifficulty / 100)
        * IBonus(int)

    return Math.max(0, Math.min(1, hack_chance))
}

export function hack_time(server, hacking, _hackDifficulty, int) {
    const { hacking_speed_mult } = ng_multipliers
    const { requiredHackingSkill, minDifficulty, hackDifficulty } = server
    _hackDifficulty = _hackDifficulty ?? hackDifficulty ?? minDifficulty

    const hack_time =
        (12.5 * requiredHackingSkill * _hackDifficulty + 2500)
        / (+hacking + 50)
        / hacking_speed_mult
        / IBonus(int)

    return hack_time
}

function IBonus(intelligence = 0, weight = 1) {
    return 1 + weight / 600 * intelligence ** 0.8
}

export function growthAnalyzeLambert(server, cores = 1) {
    const { moneyAvailable, moneyMax } = server

    return lambert_calc(moneyAvailable, moneyMax, grow_fraction(server, cores))
}

export function lambert_calc(start, end, grow_base, thread_multiplier = 1) {
    if (start < 0) start = 0
    if (start >= end) return 0
    if (start + 1 >= end) return 1
    if (grow_base <= 1 || thread_multiplier <= 0) return Math.ceil(end - start)
    if (!Number.isFinite(end)) end = Number.MAX_VALUE

    const B = 1 / (thread_multiplier * Math.log(grow_base))
    const H = B * Math.log(end)
    let threads = Math.min(end - start, H)
    let change = 0
    do {
        change = (B * Math.log(start + threads) + threads - H) * (start + threads) / (B + start + threads)
        threads -= change
    } while (Math.abs(change) > 1)

    threads = Math.round(threads)
    if ((start + threads) * grow_base ** (threads * thread_multiplier) < end) {
        threads++
    }
    return threads
}

export function hgw_split(ns, threads, target, hack_fraction, grow_fraction, moneyMax, hm, gm, wm) {
    hm ??= 1
    gm ??= 3.2 * hm
    wm ??= 4 * hm
    // const hfr = sessionStorage.hack_fortify_ratio ?? 0.04
    // const gfr = sessionStorage.grow_fortify_ratio ?? 0.08
    const { hack_fortify_ratio: hfr = 0.04, grow_fortify_ratio: gfr = 0.08 } = multipliers
    let h = 1 / hack_fraction
    let g = lambert_calc(0, moneyMax, grow_fraction, 1)
    let w = h * hfr + g * gfr
    const max_threads = hm * h + gm * g + wm * w
    if (threads > max_threads) {
        ns.tprintf(`WARN: ${target} would cap out at ${hm}*${h} +${gm}*${g} +${wm}*${w} = ${max_threads}`)
        return
    }

    const X = (gm + gfr * wm) + (hm + hfr * wm) / hack_fraction / moneyMax
    const A = (hm + hfr * wm) / hack_fraction / X
    const B = A - threads / X
    const C = A * Math.log(grow_fraction)
    g *= threads / max_threads
    let change
    do {
        change = (g - A * grow_fraction ** -g + B) / (1 + C * grow_fraction ** -g)
        g -= change
    } while (Math.abs(change) > 0.0001)

    h = 1 / hack_fraction * (1 - grow_fraction ** -g + g / moneyMax)
    w = h * hfr + g * gfr
    ns.tprintf(`${target} ${hm}*${h} +${gm}*${g} +${wm}*${w} = ${hm * h + gm * g + wm * w}`)

    g = Math.ceil(g)
    w = Math.ceil(w)
    h = Math.floor((threads - gm * g - wm * w) / hm)
    ns.tprintf(`${target} ${hm}*${h} +${gm}*${g} +${wm}*${w} = ${hm * h + gm * g + wm * w}`)
}

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// function underscore_separated_integer(n, separator = '_') {
export function usi(n, separator = '_') {
    let s = Math.round(n).toString()
    if (s.length > 3) {
        s = s.replace(/\B(?=(?:\d{3})+(?!\d))/g, separator);
    }
    return s
}

// const doc = eval("document")

export function unfocus() {
    return query_click("button", "Do something else simultaneously")
}

export function refocus() {
    return query_click("tr th button", "Focus")
}

function get_to_page(page, func) {
    const did_unfocus = unfocus()
    query_click("div[role='button'] div.MuiListItemText-root p", page)
    if (func) {
        func()
        click_all_aria_hidden()
        if (did_unfocus) refocus()
    }
    return did_unfocus
}

export function term(message) {
    get_to_page("Terminal")
    const terminal = doc.querySelector("#terminal-input");
    const event_key = Object.keys(terminal)[1];
    terminal[event_key].onChange({ target: { value: message } });
    terminal[event_key].onKeyDown({ key: 'Enter', preventDefault: () => null });
}

export async function aterm(message) {
    const [terminal, did_unfocus] = await get_term()
    const event_key = Object.keys(terminal)[1];
    terminal[event_key].onChange({ target: { value: message } });
    terminal[event_key].onKeyDown({ key: 'Enter', preventDefault: () => null });
    if (did_unfocus) refocus()
}

export async function get_term() {
    let did_unfocus, terminal
    while (true) {
        did_unfocus = get_to_page("Terminal") || did_unfocus
        terminal = doc.querySelector("#terminal-input")
        if (!terminal.matches(":disabled")) {
            return [terminal, did_unfocus]
        }
        await delay(16) // because of this await you might not stay on the right page
    }
}

// what if already joined??
export async function join_fac(target, work = "Hacking Contracts") {
    await join(target)
    for (const el of doc.querySelectorAll("div span h6 span")) {
        if (el.innerHTML == target) {
            el.parentNode.parentNode.previousSibling.firstChild.click()
        }
    }
    query_click("button", work)
}

async function join(target, loop_time = 1_000) {
    while (true) {
        get_to_page("Factions")
        for (const el of doc.querySelectorAll("div span h6 span")) {
            if (el.innerHTML == target) {
                sudo_click(el.parentNode.parentNode.previousSibling)
                return
            }
        }
        await delay(loop_time)
    }
}

function query_click(query, text_match) {
    for (let el of doc.querySelectorAll(query)) {
        if (el.innerHTML.startsWith(text_match)) { // innerText, textContent ??
            el.click()
            return true
        }
    }
    return false // not found, unable to click
}

function sudo_click(element) {
    element[Object.keys(element)[1]].onClick({ isTrusted: true })
}

function click_all_aria_hidden() {
    for (const el of doc.querySelectorAll("div[aria-hidden]")) {
        el.click()
    }
}

export function restart(msg) {
    get_to_page("Options")
    doc.querySelector("button[aria-label='Perform a soft reset. Resets everything as if you had just purchased an Augmentation.']").click()
    setTimeout(term, 0, msg)
}

export function study(lvl = 3) {
    // lvl cost/s xp/s
    //   0      0    1
    //   1    120    2
    //   2    240    4
    //   3    960    8
    get_to_page("City")
    doc.querySelector("span[aria-label='Rothman University']").click()
    doc.querySelectorAll("button[aria-label='Gain hacking experience!']")[lvl].click()
}

export function travel(target = "C") {
    get_to_page("Travel", () => {
        query_click("div h4~div p span", target)
    })
}

export function get_tor() {
    get_to_page("City", () => {
        doc.querySelector("span[aria-label='Alpha Enterprises'],\
        span[aria-label='ECorp'],\
        span[aria-label='CompuTek'],\
        span[aria-label='Omega Software']").click()

        query_click("button", "Purchase TOR")
    })
}
