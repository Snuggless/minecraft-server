import { system, world } from "@minecraft/server";

// Public protocol and storage limits. Keep history pages small enough for a Script API event payload.
const REQUEST_EVENT = "snugg-currency:request-v1";
const SCHEMA_VERSION = 1;
const CURRENCY_SYMBOL = "e";
const HISTORY_LIMIT = 10000;
const PAGE_LIMIT = 5;
const BALANCE_SHARDS = 64;
const OUTCOME_SHARDS = 64;
const CHUNK_SIZE = 40;
const META_PROPERTY = "snugg-currency:meta";
const ADDRESS_SEGMENT = /^[a-z0-9_-]{1,24}$/;
const CALLER_ID = /^[a-z0-9][a-z0-9_-]{0,31}$/;
const REQUEST_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,47}$/;
const EVENT_ID = /^[a-z0-9][a-z0-9._-]{0,31}:[a-z0-9][a-z0-9._/-]{0,63}$/;

/**
 * Processes the version 1 public currency request protocol. Consumers must
 * provide their own response event because Bedrock add-ons cannot import one
 * another at runtime.
 *
 * @param {import("@minecraft/server").ScriptEventCommandMessageAfterEvent} event The incoming Script API event.
 */
function handleRequest(event) {
  if (event.id !== REQUEST_EVENT) {
    return;
  }

  const request = parseRequest(event.message);
  if (!request.ok) {
    sendResponse(request.responseEvent, {
      version: SCHEMA_VERSION,
      requestId: request.requestId,
      ok: false,
      code: request.code
    });
    return;
  }

  const response = dispatch(request.value);
  sendResponse(request.value.responseEvent, response);
}

function parseRequest(message) {
  let value;
  try {
    value = JSON.parse(message);
  } catch (error) {
    console.warn(`[snugg-currency] Rejected malformed request JSON: ${error}`);
    return failureFromUnknownRequest("malformed_request");
  }

  if (!isRecord(value)) {
    return failureFromUnknownRequest("malformed_request");
  }

  const responseEvent = typeof value.responseEvent === "string" && EVENT_ID.test(value.responseEvent)
    ? value.responseEvent
    : undefined;
  const requestId = typeof value.requestId === "string" && REQUEST_ID.test(value.requestId)
    ? value.requestId
    : undefined;

  if (value.version !== SCHEMA_VERSION) {
    return { ok: false, code: "unsupported_version", responseEvent, requestId };
  }
  if (!responseEvent) {
    return { ok: false, code: "invalid_response_event", requestId };
  }
  if (!requestId) {
    return { ok: false, code: "invalid_request_id", responseEvent };
  }
  if (typeof value.operation !== "string") {
    return { ok: false, code: "invalid_operation", responseEvent, requestId };
  }
  if (typeof value.callerId !== "string" || !CALLER_ID.test(value.callerId)) {
    return { ok: false, code: "invalid_caller_id", responseEvent, requestId };
  }

  return { ok: true, value };
}

function failureFromUnknownRequest(code) {
  return { ok: false, code, responseEvent: undefined, requestId: undefined };
}

function dispatch(request) {
  switch (request.operation) {
    case "balance":
      return getBalance(request);
    case "history":
      return getHistory(request);
    case "deposit":
    case "withdraw":
    case "transfer":
      return applyTransaction(request);
    default:
      return response(request, false, "invalid_operation");
  }
}

function getBalance(request) {
  if (!isWalletAddress(request.address)) {
    return response(request, false, "invalid_address");
  }

  const balances = readObject(balanceProperty(request.address), "balance lookup");
  if (!balances.ok) {
    return response(request, false, balances.code);
  }

  return response(request, true, "success", {
    address: request.address,
    balance: validBalance(balances.value[request.address]) ? balances.value[request.address] : 0,
    currency: CURRENCY_SYMBOL
  });
}

function getHistory(request) {
  if (!isWalletAddress(request.address)) {
    return response(request, false, "invalid_address");
  }
  if (request.limit !== undefined && (!Number.isSafeInteger(request.limit) || request.limit < 1 || request.limit > PAGE_LIMIT)) {
    return response(request, false, "invalid_limit");
  }
  if (request.cursor !== undefined && (!Number.isSafeInteger(request.cursor) || request.cursor < 1)) {
    return response(request, false, "invalid_cursor");
  }

  const meta = readMeta();
  if (!meta.ok) {
    return response(request, false, meta.code);
  }

  const records = [];
  const limit = request.limit ?? PAGE_LIMIT;
  let hasMore = false;
  // Sequence cursors provide stable newest-first paging even when old records are pruned.
  for (let chunkIndex = meta.value.history.chunks.length - 1; chunkIndex >= 0; chunkIndex -= 1) {
    const chunk = readArray(historyProperty(meta.value.history.chunks[chunkIndex].id), "history lookup");
    if (!chunk.ok) {
      return response(request, false, chunk.code);
    }
    for (let recordIndex = chunk.value.length - 1; recordIndex >= 0; recordIndex -= 1) {
      const record = chunk.value[recordIndex];
      if (!isRecord(record) || record.sequence >= (request.cursor ?? Number.MAX_SAFE_INTEGER)) {
        continue;
      }
      if (record.from !== request.address && record.to !== request.address) {
        continue;
      }
      if (records.length === limit) {
        hasMore = true;
        break;
      }
      records.push(record);
    }
    if (hasMore) {
      break;
    }
  }

  return response(request, true, "success", {
    address: request.address,
    currency: CURRENCY_SYMBOL,
    records,
    nextCursor: hasMore ? records[records.length - 1].sequence : undefined
  });
}

function applyTransaction(request) {
  // The caller and request ID together define the idempotency boundary.
  const idempotencyKey = `${request.callerId}:${request.requestId}`;
  const existingOutcome = readObject(outcomeProperty(idempotencyKey), "idempotency lookup");
  if (!existingOutcome.ok) {
    return response(request, false, existingOutcome.code);
  }
  if (isRecord(existingOutcome.value[idempotencyKey])) {
    const outcome = existingOutcome.value[idempotencyKey];
    return response(request, outcome.ok, outcome.code, { ...outcome.data, operation: outcome.operation });
  }

  const validation = validateTransaction(request);
  if (validation) {
    return response(request, false, validation);
  }

  const meta = readMeta();
  if (!meta.ok) {
    return response(request, false, meta.code);
  }

  const fromAddress = request.operation === "deposit" ? undefined : request.from;
  const toAddress = request.operation === "withdraw" ? undefined : request.operation === "deposit" ? request.address : request.to;
  const creditedAddress = request.operation === "deposit" ? request.address : toAddress;
  const debitedAddress = request.operation === "withdraw" ? request.address : fromAddress;
  const debitBalances = debitedAddress ? readObject(balanceProperty(debitedAddress), "balance read") : { ok: true, value: {} };
  if (!debitBalances.ok) {
    return response(request, false, debitBalances.code);
  }
  const creditBalances = creditedAddress && (!debitedAddress || balanceProperty(creditedAddress) !== balanceProperty(debitedAddress))
    ? readObject(balanceProperty(creditedAddress), "balance read")
    : debitBalances;
  if (!creditBalances.ok) {
    return response(request, false, creditBalances.code);
  }

  const currentDebit = debitedAddress && validBalance(debitBalances.value[debitedAddress])
    ? debitBalances.value[debitedAddress]
    : 0;
  const currentCredit = creditedAddress && validBalance(creditBalances.value[creditedAddress])
    ? creditBalances.value[creditedAddress]
    : 0;
  if (debitedAddress && currentDebit < request.amount) {
    return persistOutcome(request, meta.value, idempotencyKey, false, "insufficient_funds", {
      address: debitedAddress,
      balance: currentDebit,
      currency: CURRENCY_SYMBOL
    });
  }
  if (creditedAddress && currentCredit > Number.MAX_SAFE_INTEGER - request.amount) {
    return persistOutcome(request, meta.value, idempotencyKey, false, "balance_limit", {
      address: creditedAddress,
      balance: currentCredit,
      currency: CURRENCY_SYMBOL
    });
  }

  if (debitedAddress) {
    debitBalances.value[debitedAddress] = currentDebit - request.amount;
  }
  if (creditedAddress) {
    creditBalances.value[creditedAddress] = currentCredit + request.amount;
  }

  const transaction = {
    sequence: meta.value.nextSequence,
    transactionId: request.requestId,
    callerId: request.callerId,
    type: request.operation,
    amount: request.amount,
    from: debitedAddress,
    to: creditedAddress,
    memo: request.memo,
    timestamp: new Date().toISOString()
  };
  const result = {
    transaction,
    currency: CURRENCY_SYMBOL,
    fromBalance: debitedAddress ? debitBalances.value[debitedAddress] : undefined,
    toBalance: creditedAddress ? creditBalances.value[creditedAddress] : undefined
  };

  const balanceWrites = {};
  if (debitedAddress) {
    balanceWrites[balanceProperty(debitedAddress)] = JSON.stringify(debitBalances.value);
  }
  if (creditedAddress) {
    balanceWrites[balanceProperty(creditedAddress)] = JSON.stringify(creditBalances.value);
  }

  const persistence = persistMutation(
    meta.value,
    idempotencyKey,
    { operation: request.operation, ok: true, code: "success", data: result },
    transaction,
    balanceWrites
  );
  return persistence.ok ? response(request, true, "success", result) : response(request, false, persistence.code);
}

function validateTransaction(request) {
  if (!Number.isSafeInteger(request.amount) || request.amount < 1) {
    return "invalid_amount";
  }
  if (request.memo !== undefined && (typeof request.memo !== "string" || request.memo.length > 64)) {
    return "invalid_memo";
  }
  if (request.operation === "deposit" || request.operation === "withdraw") {
    return isWalletAddress(request.address) ? undefined : "invalid_address";
  }
  if (!isWalletAddress(request.from) || !isWalletAddress(request.to) || request.from === request.to) {
    return "invalid_transfer_address";
  }
  return undefined;
}

function persistOutcome(request, meta, idempotencyKey, ok, code, data) {
  const persistence = persistMutation(meta, idempotencyKey, { operation: request.operation, ok, code, data }, undefined, {});
  return persistence.ok ? response(request, ok, code, data) : response(request, false, persistence.code);
}

function persistMutation(meta, idempotencyKey, outcome, transaction, changes) {
  // Work on a copy so storage is changed only after every required shard is valid.
  const nextMeta = JSON.parse(JSON.stringify(meta));
  const writes = { ...changes };

  const outcomeWrite = appendToCollection(nextMeta.outcomes, "outcomes", idempotencyKey, writes);
  if (!outcomeWrite.ok) {
    return outcomeWrite;
  }
  const outcomes = readObject(outcomeProperty(idempotencyKey), "idempotency write");
  if (!outcomes.ok) {
    return outcomes;
  }
  outcomes.value[idempotencyKey] = outcome;
  writes[outcomeProperty(idempotencyKey)] = JSON.stringify(outcomes.value);

  const outcomePrune = pruneCollection(nextMeta.outcomes, "outcomes", writes, (key) => {
    const property = outcomeProperty(key);
    // Reuse the pending map when the oldest and newest outcomes share a shard.
    const staleOutcome = property === outcomeProperty(idempotencyKey)
      ? { ok: true, value: outcomes.value }
      : readObject(property, "idempotency pruning");
    if (!staleOutcome.ok) {
      return staleOutcome;
    }
    delete staleOutcome.value[key];
    writes[property] = JSON.stringify(staleOutcome.value);
    return { ok: true };
  });
  if (!outcomePrune.ok) {
    return outcomePrune;
  }

  if (transaction) {
    nextMeta.nextSequence += 1;
    const historyWrite = appendToCollection(nextMeta.history, "history", transaction, writes);
    if (!historyWrite.ok) {
      return historyWrite;
    }
    const historyPrune = pruneCollection(nextMeta.history, "history", writes, () => ({ ok: true }));
    if (!historyPrune.ok) {
      return historyPrune;
    }
  }

  writes[META_PROPERTY] = JSON.stringify(nextMeta);
  try {
    world.setDynamicProperties(writes);
  } catch (error) {
    console.error(`[snugg-currency] Could not persist transaction ${idempotencyKey}: ${error}`);
    return { ok: false, code: "storage_error" };
  }
  return { ok: true };
}

function appendToCollection(collection, collectionName, item, writes) {
  let descriptor = collection.chunks[collection.chunks.length - 1];
  if (!descriptor || descriptor.count >= CHUNK_SIZE) {
    descriptor = { id: collection.nextChunk, count: 0 };
    collection.nextChunk += 1;
    collection.chunks.push(descriptor);
  }
  const property = collectionProperty(collectionName, descriptor.id);
  const chunk = readArray(property, `${collectionName} write`);
  if (!chunk.ok) {
    return chunk;
  }
  chunk.value.push(item);
  descriptor.count += 1;
  collection.total += 1;
  writes[property] = JSON.stringify(chunk.value);
  return { ok: true };
}

function pruneCollection(collection, collectionName, writes, onRemoved) {
  if (collection.total <= HISTORY_LIMIT) {
    return { ok: true };
  }
  const descriptor = collection.chunks[0];
  const property = collectionProperty(collectionName, descriptor.id);
  const chunk = readArray(property, `${collectionName} pruning`);
  if (!chunk.ok) {
    return chunk;
  }
  const removed = chunk.value.shift();
  const result = onRemoved(removed);
  if (!result.ok) {
    return result;
  }
  descriptor.count -= 1;
  collection.total -= 1;
  if (descriptor.count === 0) {
    // Removing an empty shard prevents unbounded dynamic-property identifiers.
    collection.chunks.shift();
    writes[property] = undefined;
  } else {
    writes[property] = JSON.stringify(chunk.value);
  }
  return { ok: true };
}

function readMeta() {
  const stored = world.getDynamicProperty(META_PROPERTY);
  if (stored === undefined) {
    // A world without metadata has no ledger state yet; initialize it on the first mutation.
    return {
      ok: true,
      value: {
        schema: SCHEMA_VERSION,
        nextSequence: 1,
        history: { total: 0, nextChunk: 0, chunks: [] },
        outcomes: { total: 0, nextChunk: 0, chunks: [] }
      }
    };
  }
  const parsed = parseStoredJson(stored, "metadata");
  if (!parsed.ok || !isMeta(parsed.value)) {
    console.error("[snugg-currency] Currency metadata is invalid. No request was processed.");
    return { ok: false, code: "storage_error" };
  }
  return parsed;
}

function readObject(property, operation) {
  const stored = world.getDynamicProperty(property);
  if (stored === undefined) {
    return { ok: true, value: {} };
  }
  const parsed = parseStoredJson(stored, operation);
  if (!parsed.ok || !isRecord(parsed.value)) {
    console.error(`[snugg-currency] Invalid ${operation} property ${property}.`);
    return { ok: false, code: "storage_error" };
  }
  return parsed;
}

function readArray(property, operation) {
  const stored = world.getDynamicProperty(property);
  if (stored === undefined) {
    return { ok: true, value: [] };
  }
  const parsed = parseStoredJson(stored, operation);
  if (!parsed.ok || !Array.isArray(parsed.value)) {
    console.error(`[snugg-currency] Invalid ${operation} property ${property}.`);
    return { ok: false, code: "storage_error" };
  }
  return parsed;
}

function parseStoredJson(stored, operation) {
  if (typeof stored !== "string") {
    console.error(`[snugg-currency] ${operation} property is not a string.`);
    return { ok: false, code: "storage_error" };
  }
  try {
    return { ok: true, value: JSON.parse(stored) };
  } catch (error) {
    console.error(`[snugg-currency] Could not parse ${operation} property: ${error}`);
    return { ok: false, code: "storage_error" };
  }
}

function response(request, ok, code, data = {}) {
  return {
    version: SCHEMA_VERSION,
    requestId: request.requestId,
    operation: request.operation,
    ok,
    code,
    ...data
  };
}

function sendResponse(eventId, payload) {
  if (!eventId) {
    console.warn(`[snugg-currency] Request rejected without a usable response event: ${payload.code}`);
    return;
  }
  try {
    system.sendScriptEvent(eventId, JSON.stringify(payload));
  } catch (error) {
    console.error(`[snugg-currency] Could not send ${payload.requestId ?? "unknown"} response to ${eventId}: ${error}`);
  }
}

function isWalletAddress(value) {
  if (typeof value !== "string") {
    return false;
  }
  const segments = value.split(":");
  return (segments.length === 2 || segments.length === 3) && segments.every((segment) => ADDRESS_SEGMENT.test(segment));
}

function isMeta(value) {
  return isRecord(value)
    && value.schema === SCHEMA_VERSION
    && Number.isSafeInteger(value.nextSequence)
    && isCollection(value.history)
    && isCollection(value.outcomes);
}

function isCollection(value) {
  return isRecord(value)
    && Number.isSafeInteger(value.total)
    && Number.isSafeInteger(value.nextChunk)
    && Array.isArray(value.chunks)
    && value.chunks.every((chunk) => isRecord(chunk) && Number.isSafeInteger(chunk.id) && Number.isSafeInteger(chunk.count));
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validBalance(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function balanceProperty(address) {
  // Sharding prevents one dynamic-property string from growing with every wallet.
  return `snugg-currency:balances-${hash(address) % BALANCE_SHARDS}`;
}

function outcomeProperty(key) {
  // Keep retry outcomes separate from the ordered outcome chunks used for pruning.
  return `snugg-currency:outcome-map-${hash(key) % OUTCOME_SHARDS}`;
}

function historyProperty(id) {
  return collectionProperty("history", id);
}

function collectionProperty(name, id) {
  return `snugg-currency:${name}-${id}`;
}

function hash(value) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

system.afterEvents.scriptEventReceive.subscribe(handleRequest);
