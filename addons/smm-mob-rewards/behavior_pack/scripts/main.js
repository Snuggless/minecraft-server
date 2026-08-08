import { system, world } from "@minecraft/server";

// Currency is independently loaded, so rewards use its documented Script Event contract.
const CURRENCY_REQUEST_EVENT = "snugg-currency:request-v1";
const CURRENCY_RESPONSE_EVENT = "smm-mob-rewards:currency-response-v1";
const CALLER_ID = "mob-rewards";
// The ledger deduplicates mutations by caller and request ID; keep IDs unique across reloads.
const REQUEST_SESSION = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
let requestSequence = 0;

// This allowlist excludes neutral, conditionally hostile, and player-provoked mobs.
const REWARD_AMOUNTS = Object.freeze({
  "minecraft:blaze": 1,
  "minecraft:bogged": 1,
  "minecraft:breeze": 1,
  "minecraft:cave_spider": 1,
  "minecraft:creeper": 1,
  "minecraft:drowned": 1,
  "minecraft:elder_guardian": 5,
  "minecraft:ender_dragon": 100,
  "minecraft:endermite": 1,
  "minecraft:evocation_illager": 3,
  "minecraft:ghast": 2,
  "minecraft:guardian": 2,
  "minecraft:husk": 1,
  "minecraft:magma_cube": 1,
  "minecraft:phantom": 1,
  "minecraft:pillager": 2,
  "minecraft:ravager": 5,
  "minecraft:shulker": 2,
  "minecraft:silverfish": 1,
  "minecraft:skeleton": 1,
  "minecraft:slime": 1,
  "minecraft:stray": 1,
  "minecraft:vex": 1,
  "minecraft:vindicator": 3,
  "minecraft:witch": 2,
  "minecraft:wither": 100,
  "minecraft:wither_skeleton": 2,
  "minecraft:zoglin": 2,
  "minecraft:zombie": 1,
  "minecraft:zombie_villager": 1
});

// Validate pack-authored configuration once at startup instead of silently skipping bad entries per kill.
validateRewardAmounts();

function validateRewardAmounts() {
  for (const [entityTypeId, reward] of Object.entries(REWARD_AMOUNTS)) {
    if (!Number.isSafeInteger(reward) || reward < 1) {
      console.error(`[smm-mob-rewards] Invalid reward for ${entityTypeId}: amounts must be positive safe integers.`);
    }
  }
}

function handleEntityDeath(event) {
  const reward = REWARD_AMOUNTS[event.deadEntity.typeId];
  if (!Number.isSafeInteger(reward) || reward < 1) {
    return;
  }

  const player = getKillingPlayer(event.damageSource.damagingEntity);
  if (!player) {
    return;
  }
  const playerName = normalizePlayerName(player.name);
  if (!playerName) {
    // Currency wallet segments have stricter character rules than player display names.
    console.warn(`[smm-mob-rewards] Skipped reward for ${event.deadEntity.typeId}: player name "${player.name}" cannot form a currency wallet address.`);
    return;
  }

  const requestId = `kill-${REQUEST_SESSION}-${++requestSequence}`;
  const request = {
    version: 1,
    operation: "deposit",
    requestId,
    callerId: CALLER_ID,
    responseEvent: CURRENCY_RESPONSE_EVENT,
    address: `player:${playerName}`,
    amount: reward,
    memo: `Hostile mob reward: ${event.deadEntity.typeId}`
  };

  try {
    system.sendScriptEvent(CURRENCY_REQUEST_EVENT, JSON.stringify(request));
  } catch (error) {
    console.error(`[smm-mob-rewards] Could not request reward for ${event.deadEntity.typeId}: ${error}`);
  }
}

function getKillingPlayer(damagingEntity) {
  if (!damagingEntity) {
    return undefined;
  }
  if (damagingEntity.typeId === "minecraft:player") {
    return damagingEntity;
  }

  // Projectile damage identifies the projectile, so resolve the player owner before rewarding.
  const projectile = damagingEntity.getComponent("minecraft:projectile");
  return projectile?.owner?.typeId === "minecraft:player" ? projectile.owner : undefined;
}

function normalizePlayerName(playerName) {
  const normalized = playerName.toLowerCase();
  return /^[a-z0-9_-]{1,24}$/.test(normalized) ? normalized : undefined;
}

function handleCurrencyResponse(event) {
  if (event.id !== CURRENCY_RESPONSE_EVENT) {
    return;
  }

  // Ledger requests complete asynchronously; only failures need operator-visible reporting here.
  try {
    const response = JSON.parse(event.message);
    if (!response.ok) {
      console.error(`[smm-mob-rewards] Currency reward ${response.requestId ?? "unknown"} failed: ${response.code ?? "unknown_error"}.`);
    }
  } catch (error) {
    console.error(`[smm-mob-rewards] Could not parse currency reward response: ${error}`);
  }
}

world.afterEvents.entityDie.subscribe(handleEntityDeath);
system.afterEvents.scriptEventReceive.subscribe(handleCurrencyResponse);
