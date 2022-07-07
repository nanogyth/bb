import { term } from "lib.js"

/** @param {NS} ns */
export async function main(ns) {
	set_multipliers(ns)
	// ns.tprint(ng_multipliers)
	setTimeout(term, 0, "home; run p0.js")
}

function set_multipliers(ns, player, owned_source_files) {
	const pc = player_constants(player ?? ns.getPlayer())
	pc.sfs = source_files(owned_source_files ?? ns.getOwnedSourceFiles())
	const bnc = bit_node_constants(pc)
	globalThis["ng_multipliers"] = Object.assign(pc, bnc)
}

function player_constants(player) {
	const f = ([key]) => key.endsWith('mult') || key === 'bitNodeN'
	return Object.fromEntries(Object.entries(player).filter(f))
}

function source_files(owned_source_files) {
	return Object.fromEntries(owned_source_files.map(sf => [sf.n, sf.lvl]))
}

function bit_node_constants(pc, bit_node = pc.bitNodeN, sf12 = pc.sfs['12']) {
	// 1.02 ** null == 1; 1.02 ** undefined == NaN
	const inc = 1.02 ** (sf12 ?? 0)
	const dec = 1 / inc

	const bnm = [
		// [0] base
		{ HackingLevelMultiplier: 1, StrengthLevelMultiplier: 1, DefenseLevelMultiplier: 1, DexterityLevelMultiplier: 1, AgilityLevelMultiplier: 1, CharismaLevelMultiplier: 1, ServerGrowthRate: 1, ServerMaxMoney: 1, ServerStartingMoney: 1, ServerStartingSecurity: 1, ServerWeakenRate: 1, HomeComputerRamCost: 1, PurchasedServerCost: 1, PurchasedServerSoftcap: 1, PurchasedServerLimit: 1, PurchasedServerMaxRam: 1, CompanyWorkMoney: 1, CrimeMoney: 1, HacknetNodeMoney: 1, ManualHackMoney: 1, ScriptHackMoney: 1, ScriptHackMoneyGain: 1, CodingContractMoney: 1, ClassGymExpGain: 1, CompanyWorkExpGain: 1, CrimeExpGain: 1, FactionWorkExpGain: 1, HackExpGain: 1, FactionPassiveRepGain: 1, FactionWorkRepGain: 1, RepToDonateToFaction: 1, AugmentationMoneyCost: 1, AugmentationRepCost: 1, InfiltrationMoney: 1, InfiltrationRep: 1, FourSigmaMarketDataCost: 1, FourSigmaMarketDataApiCost: 1, CorporationValuation: 1, CorporationSoftCap: 1, BladeburnerRank: 1, BladeburnerSkillCost: 1, GangSoftcap: 1, DaedalusAugsRequirement: 1, StaneksGiftPowerMultiplier: 1, StaneksGiftExtraSize: 0, WorldDaemonDifficulty: 1, },
		// [1] Source Genesis
		{},
		// [2] Rise of the Underworld
		{ HackingLevelMultiplier: 0.8, ServerGrowthRate: 0.8, ServerMaxMoney: 0.2, ServerStartingMoney: 0.4, CrimeMoney: 3, InfiltrationMoney: 3, FactionWorkRepGain: 0.5, FactionPassiveRepGain: 0, StaneksGiftPowerMultiplier: 2, StaneksGiftExtraSize: -6, PurchasedServerSoftcap: 1.3, CorporationSoftCap: 0.9, WorldDaemonDifficulty: 5 },
		// [3] Corporatocracy
		{ HackingLevelMultiplier: 0.8, RepToDonateToFaction: 0.5, AugmentationRepCost: 3, AugmentationMoneyCost: 3, ServerMaxMoney: 0.2, ServerStartingMoney: 0.2, ServerGrowthRate: 0.2, ScriptHackMoney: 0.2, CompanyWorkMoney: 0.25, CrimeMoney: 0.25, HacknetNodeMoney: 0.25, HomeComputerRamCost: 1.5, PurchasedServerCost: 2, StaneksGiftPowerMultiplier: 0.75, StaneksGiftExtraSize: -2, PurchasedServerSoftcap: 1.3, GangSoftcap: 0.9, WorldDaemonDifficulty: 2 },
		// [4] The Singularity
		{ ServerMaxMoney: 0.15, ServerStartingMoney: 0.75, ScriptHackMoney: 0.2, CompanyWorkMoney: 0.1, CrimeMoney: 0.2, HacknetNodeMoney: 0.05, CompanyWorkExpGain: 0.5, ClassGymExpGain: 0.5, FactionWorkExpGain: 0.5, HackExpGain: 0.4, CrimeExpGain: 0.5, FactionWorkRepGain: 0.75, StaneksGiftPowerMultiplier: 1.5, StaneksGiftExtraSize: 0, PurchasedServerSoftcap: 1.2, WorldDaemonDifficulty: 3 },
		// [5] Artificial intelligence
		{ ServerMaxMoney: 2, ServerStartingSecurity: 2, ServerStartingMoney: 0.5, ScriptHackMoney: 0.15, HacknetNodeMoney: 0.2, CrimeMoney: 0.5, InfiltrationRep: 1.5, InfiltrationMoney: 1.5, AugmentationMoneyCost: 2, HackExpGain: 0.5, CorporationValuation: 0.5, StaneksGiftPowerMultiplier: 1.3, StaneksGiftExtraSize: 0, PurchasedServerSoftcap: 1.2, WorldDaemonDifficulty: 1.5 },
		// [6] Bladeburner
		{ HackingLevelMultiplier: 0.35, ServerMaxMoney: 0.4, ServerStartingMoney: 0.5, ServerStartingSecurity: 1.5, ScriptHackMoney: 0.75, CompanyWorkMoney: 0.5, CrimeMoney: 0.75, InfiltrationMoney: 0.75, CorporationValuation: 0.2, HacknetNodeMoney: 0.2, FactionPassiveRepGain: 0, HackExpGain: 0.25, DaedalusAugsRequirement: 1.166, PurchasedServerSoftcap: 2, StaneksGiftPowerMultiplier: 0.5, StaneksGiftExtraSize: 2, GangSoftcap: 0.7, CorporationSoftCap: 0.9, WorldDaemonDifficulty: 2 },
		// [7] Bladeburner 2079
		{ BladeburnerRank: 0.6, BladeburnerSkillCost: 2, AugmentationMoneyCost: 3, HackingLevelMultiplier: 0.35, ServerMaxMoney: 0.4, ServerStartingMoney: 0.5, ServerStartingSecurity: 1.5, ScriptHackMoney: 0.5, CompanyWorkMoney: 0.5, CrimeMoney: 0.75, InfiltrationMoney: 0.75, CorporationValuation: 0.2, HacknetNodeMoney: 0.2, FactionPassiveRepGain: 0, HackExpGain: 0.25, FourSigmaMarketDataCost: 2, FourSigmaMarketDataApiCost: 2, DaedalusAugsRequirement: 1.166, PurchasedServerSoftcap: 2, StaneksGiftPowerMultiplier: 0.9, StaneksGiftExtraSize: -1, GangSoftcap: 0.7, CorporationSoftCap: 0.9, WorldDaemonDifficulty: 2 },
		// [8] Ghost of Wall Street
		{ ScriptHackMoney: 0.3, ScriptHackMoneyGain: 0, ManualHackMoney: 0, CompanyWorkMoney: 0, CrimeMoney: 0, HacknetNodeMoney: 0, InfiltrationMoney: 0, RepToDonateToFaction: 0, CorporationValuation: 0, CodingContractMoney: 0, StaneksGiftExtraSize: -7, PurchasedServerSoftcap: 4, GangSoftcap: 0, CorporationSoftCap: 0 },
		// [9] Hacktocracy
		{ HackingLevelMultiplier: 0.5, StrengthLevelMultiplier: 0.45, DefenseLevelMultiplier: 0.45, DexterityLevelMultiplier: 0.45, AgilityLevelMultiplier: 0.45, CharismaLevelMultiplier: 0.45, PurchasedServerLimit: 0, HomeComputerRamCost: 5, CrimeMoney: 0.5, ScriptHackMoney: 0.1, HackExpGain: 0.05, ServerStartingMoney: 0.1, ServerMaxMoney: 0.1, ServerStartingSecurity: 2.5, CorporationValuation: 0.5, FourSigmaMarketDataCost: 5, FourSigmaMarketDataApiCost: 4, BladeburnerRank: 0.9, BladeburnerSkillCost: 1.2, StaneksGiftPowerMultiplier: 0.5, StaneksGiftExtraSize: 2, GangSoftcap: 0.8, CorporationSoftCap: 0.7, WorldDaemonDifficulty: 2 },
		// [10] Digital Carbon
		{ HackingLevelMultiplier: 0.35, StrengthLevelMultiplier: 0.4, DefenseLevelMultiplier: 0.4, DexterityLevelMultiplier: 0.4, AgilityLevelMultiplier: 0.4, CharismaLevelMultiplier: 0.4, CompanyWorkMoney: 0.5, CrimeMoney: 0.5, HacknetNodeMoney: 0.5, ManualHackMoney: 0.5, ScriptHackMoney: 0.5, CodingContractMoney: 0.5, InfiltrationMoney: 0.5, CorporationValuation: 0.5, AugmentationMoneyCost: 5, AugmentationRepCost: 2, HomeComputerRamCost: 1.5, PurchasedServerCost: 5, PurchasedServerLimit: 0.6, PurchasedServerMaxRam: 0.5, BladeburnerRank: 0.8, StaneksGiftPowerMultiplier: 0.75, StaneksGiftExtraSize: -3, PurchasedServerSoftcap: 1.1, GangSoftcap: 0.9, CorporationSoftCap: 0.9, WorldDaemonDifficulty: 2 },
		// [11] The Big Crash
		{ HackingLevelMultiplier: 0.6, HackExpGain: 0.5, ServerMaxMoney: 0.1, ServerStartingMoney: 0.1, ServerGrowthRate: 0.2, ServerWeakenRate: 2, CrimeMoney: 3, CompanyWorkMoney: 0.5, HacknetNodeMoney: 0.1, AugmentationMoneyCost: 2, InfiltrationMoney: 2.5, InfiltrationRep: 2.5, CorporationValuation: 0.1, CodingContractMoney: 0.25, FourSigmaMarketDataCost: 4, FourSigmaMarketDataApiCost: 4, PurchasedServerSoftcap: 2, CorporationSoftCap: 0.9, WorldDaemonDifficulty: 1.5 },
		// [12] The Recursion
		{ DaedalusAugsRequirement: Math.min(inc, 1.34), HackingLevelMultiplier: dec, StrengthLevelMultiplier: dec, DefenseLevelMultiplier: dec, DexterityLevelMultiplier: dec, AgilityLevelMultiplier: dec, CharismaLevelMultiplier: dec, ServerMaxMoney: dec, ServerStartingMoney: dec, ServerGrowthRate: dec, ServerWeakenRate: dec, ServerStartingSecurity: 1.5, HomeComputerRamCost: inc, PurchasedServerCost: inc, PurchasedServerLimit: dec, PurchasedServerMaxRam: dec, PurchasedServerSoftcap: inc, ManualHackMoney: dec, ScriptHackMoney: dec, CompanyWorkMoney: dec, CrimeMoney: dec, HacknetNodeMoney: dec, CodingContractMoney: dec, CompanyWorkExpGain: dec, ClassGymExpGain: dec, FactionWorkExpGain: dec, HackExpGain: dec, CrimeExpGain: dec, FactionWorkRepGain: dec, FactionPassiveRepGain: dec, RepToDonateToFaction: inc, AugmentationRepCost: inc, AugmentationMoneyCost: inc, InfiltrationMoney: dec, InfiltrationRep: dec, FourSigmaMarketDataCost: inc, FourSigmaMarketDataApiCost: inc, CorporationValuation: dec, BladeburnerRank: dec, BladeburnerSkillCost: inc, StaneksGiftPowerMultiplier: inc, StaneksGiftExtraSize: inc, GangSoftcap: 0.8, CorporationSoftCap: 0.8, WorldDaemonDifficulty: inc },
		// [13] Church of the Machine God
		{ PurchasedServerSoftcap: 1.6, HackingLevelMultiplier: 0.25, StrengthLevelMultiplier: 0.7, DefenseLevelMultiplier: 0.7, DexterityLevelMultiplier: 0.7, AgilityLevelMultiplier: 0.7, ServerMaxMoney: 0.45, ServerStartingMoney: 0.75, ServerStartingSecurity: 3, ScriptHackMoney: 0.2, CompanyWorkMoney: 0.4, CrimeMoney: 0.4, HacknetNodeMoney: 0.4, CodingContractMoney: 0.4, CompanyWorkExpGain: 0.5, ClassGymExpGain: 0.5, FactionWorkExpGain: 0.5, HackExpGain: 0.1, CrimeExpGain: 0.5, FactionWorkRepGain: 0.6, FourSigmaMarketDataCost: 10, FourSigmaMarketDataApiCost: 10, CorporationValuation: 0.001, BladeburnerRank: 0.45, BladeburnerSkillCost: 2, StaneksGiftPowerMultiplier: 2, StaneksGiftExtraSize: 1, GangSoftcap: 0.3, CorporationSoftCap: 0.3, WorldDaemonDifficulty: 3 },
	]
	return Object.assign(bnm[0], bnm[bit_node])
}
