import { multipliers } from "data.js"
import { usi, term, write_yield_data } from "lib.js"

/** @param {NS} ns */
export async function main(ns) {
    await write_yield_data(ns, yield_server_data)
    setTimeout(term, 0, "home; run p0.js")
}

function* yield_server_data(ns) {
    const server_data = { home: { route: "home" } }
    const found_names = ["home"]
    const props = ["numOpenPortsRequired", "maxRam", "baseDifficulty",
        "minDifficulty", "requiredHackingSkill", "serverGrowth", "moneyMax"]

    yield "export const server_data = {\n"
    yield* process_found_names()
    yield "};\n\n"

    function* process_found_names() {
        for (const name of found_names) {
            for (const new_name of ns.scan(name)) {
                if (!found_names.includes(new_name)) {
                    yield* process_name(new_name, server_data[name].route)
                }
            }
        }
    }

    function* process_name(name, base_route) {
        found_names.push(name)
        const server = ns.getServer(name)
        if (server.purchasedByPlayer) return

        yield `"${name}": {\n` // some names have dash-es, so need to be quoted
        yield* process_props(server)
        yield "},\n"

        process_route(name, base_route)
    }

    function* process_props(server) {
        for (const prop of props) {
            yield `  ${prop}: ${usi(server[prop])},\n`
        }
    }

    function process_route(name, base_route) {
        const new_route = `${base_route}; connect ${name}`
        term(`alias c_${name}="${new_route}"`)
        server_data[name] = { route: new_route }
    }
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

export function find_best(server_data, hacking, test_func = money_per_GB_s) {
    const best_list = Object.entries(server_data)
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
    const { hacking_money_mult, ScriptHackMoney = 1 } = multipliers
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
    const { hacking_grow_mult, ServerGrowthRate = 1 } = multipliers
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
    const { hacking_exp_mult, HackExpGain = 1 } = multipliers
    const { baseDifficulty } = server

    return (3 + 0.3 * baseDifficulty * hacking_exp_mult) * HackExpGain
}

export function hack_chance(server, hacking, _hackDifficulty, int) {
    const { hacking_chance_mult } = multipliers
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
    const { hacking_speed_mult } = multipliers
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
