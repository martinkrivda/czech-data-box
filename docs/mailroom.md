# Mailroom Guide

This package can be used as the ISDS transport layer for a podatelna or inbox
bridge that regularly downloads messages and hands them off to an internal
workflow.

## Recommended Flow

1. Poll the inbox with `listReceivedMessages(...)` or `pollReceivedMessages(...)`
   in a bounded time range.
2. Persist message metadata, envelope, and full payload before any destructive
   follow-up steps.
3. Hand the downloaded payload to the downstream workflow queue or API.
4. Call `markMessageAsDownloaded(dmID)` only after the handoff succeeds.
5. For audit-heavy scenarios, also persist:
   - `getDeliveryInfo(dmID)`
   - `getSignedDeliveryInfo(dmID)`
   - `downloadSignedMessage(dmID)` or `downloadSignedBigMessage(dmID)`

## Polling Example

```ts
import ISDSBox from 'czech-data-box';

const client = new ISDSBox().loginWithUsernameAndPassword(
  process.env.ISDS_LOGIN ?? '',
  process.env.ISDS_PASSWORD ?? '',
  false,
);

const batch = await client.pollReceivedMessages({
  dmFromTime: new Date(Date.now() - 10 * 60 * 1000),
  dmToTime: new Date(),
  dmLimit: 25,
  includeEnvelope: true,
  includeMessage: true,
});

for (const item of batch.items) {
  const dmID = item.record.dmID;
  if (!dmID) {
    continue;
  }

  await workflow.enqueue({
    dmID,
    record: item.record,
    envelope: item.envelope,
    message: item.message,
  });

  await client.markMessageAsDownloaded(dmID);
}
```

## Long-Running Worker

For a daemon or queue worker, prefer the async generator:

```ts
import ISDSBox from 'czech-data-box';

const controller = new AbortController();

const client = new ISDSBox().loginWithUsernameAndPassword(
  process.env.ISDS_LOGIN ?? '',
  process.env.ISDS_PASSWORD ?? '',
  false,
);

for await (const batch of client.watchReceivedMessages({
  intervalMs: 30_000,
  signal: controller.signal,
  includeEnvelope: true,
  includeMessage: true,
  notifications: {
    scope: 'ALL',
  },
})) {
  for (const item of batch.items) {
    const dmID = item.record.dmID;
    if (!dmID) {
      continue;
    }

    await workflow.enqueue({
      dmID,
      record: item.record,
      envelope: item.envelope,
      message: item.message,
    });

    await client.markMessageAsDownloaded(dmID);
  }
}
```

Use `waitForNewMessages(...)` when you only need one blocking wait cycle instead
of a continuous watcher.

## Why `pollReceivedMessages(...)`

`pollReceivedMessages(...)` is intentionally conservative:

- it keeps listing and downloading explicit
- it does not mark inbox items as downloaded by default
- it automatically chooses `BigMessageDownload` for VoDZ records detected in the
  inbox listing
- `watchReceivedMessages(...)` deduplicates yielded items by `dmID` in-memory by
  default, so a broad inbox window does not immediately replay the same batch

That makes it a good default for backend integrations that need predictable
behavior and explicit control over acknowledgement timing.

## Large Messages

For VoDZ scenarios:

1. upload attachments with `uploadAttachment(...)`
2. build the external attachment references for `createBigMessage(...)`
3. use `downloadBigMessage(dmID)` or `downloadSignedBigMessage(dmID)` when
   reading the message back

## Archive and Re-stamping

When your workflow stores signed ISDS payloads long-term:

- `reSignIsdsDocument(dmDocBase64)` re-stamps a signed document through the
  classic message service
- `archiveIsdsDocument(dmMessageBase64)` calls the dedicated `dm_arch` SOAP 1.2
  service and returns `nextStampTo`

That value is useful for planning future maintenance jobs on archived payloads.
