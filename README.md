# czech-data-box

[![Node.js](https://img.shields.io/badge/node-%3E%3D22.20.0%20%3C25-339933?logo=node.js&logoColor=white)](./package.json)
[![npm version](https://img.shields.io/npm/v/czech-data-box?logo=npm)](https://www.npmjs.com/package/czech-data-box)
[![CI](https://img.shields.io/github/actions/workflow/status/martinkrivda/czech-data-box/ci.yaml?branch=main&label=CI)](https://github.com/martinkrivda/czech-data-box/actions/workflows/ci.yaml)
[![License](https://img.shields.io/github/license/martinkrivda/czech-data-box)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/martinkrivda/czech-data-box?style=social)](https://github.com/martinkrivda/czech-data-box/stargazers)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/martinkrivda?label=funding&logo=githubsponsors)](https://github.com/sponsors/martinkrivda)

TypeScript-first Node.js client for Czech Data Boxes (ISDS). The package wraps
message sending, inbox polling, message download, delivery metadata, VoDZ large
message operations, and document re-stamping/archive services.

## Requirements

- Development: Node.js `24.14.1`, pnpm `10.33.0`
- Supported runtime: Node.js `>=22.20.0 <25`

The repository is managed with `pnpm`, strict `TypeScript`, `Changesets`, and
GitHub Actions.

Bundled WSDL/XSD definitions are synced to the ISDS technical appendices from
September/December 2025.

## Installation

```bash
pnpm add czech-data-box
```

Consumers can use `npm` or `yarn` as well, but this repository itself is
maintained with `pnpm`.

## Quick Start

```ts
import ISDSBox, { DataBox } from 'czech-data-box';

const client = new ISDSBox().loginWithUsernameAndPassword(
  process.env.ISDS_LOGIN ?? '',
  process.env.ISDS_PASSWORD ?? '',
  false,
);

const ownerInfo = await client.getOwnerInfoFromLogin();
console.log(ownerInfo.ownerInfo);

const searchQuery = new DataBox().setDbId('abc123').setDbType('PO');
const searchResult = await client.findDataBox(searchQuery);
console.log(searchResult.dbResults);
```

## Mailroom Polling

For a podatelna-style application, the recommended flow is:

1. list received messages in a bounded time window
2. download envelope and full content
3. persist or enqueue the payload into your workflow system
4. mark the message as downloaded only after the handoff succeeds

```ts
import ISDSBox from 'czech-data-box';

const client = new ISDSBox().loginWithUsernameAndPassword(
  process.env.ISDS_LOGIN ?? '',
  process.env.ISDS_PASSWORD ?? '',
  false,
);

const batch = await client.pollReceivedMessages({
  dmFromTime: new Date(Date.now() - 15 * 60 * 1000),
  dmToTime: new Date(),
  dmLimit: 50,
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
    envelope: item.envelope,
    message: item.message,
    deliveryTime: item.record.dmDeliveryTime ?? null,
  });

  await client.markMessageAsDownloaded(dmID);
}
```

`pollReceivedMessages()` automatically switches to `BigMessageDownload` for VoDZ
records detected in the inbox listing.

For a long-running worker, use `watchReceivedMessages(...)` with `AbortSignal`:

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
      envelope: item.envelope,
      message: item.message,
    });

    await client.markMessageAsDownloaded(dmID);
  }
}
```

For a single blocking wait, use `waitForNewMessages(...)`.

Note: according to the ISDS operational rules, `GetListOfReceivedMessages` is
the operation with delivery semantics for inbox access. Design your polling job
and audit trail around that behavior.

## Sending Messages

```ts
import ISDSBox, { DataMessage } from 'czech-data-box';

const client = new ISDSBox().loginWithUsernameAndPassword(
  process.env.ISDS_LOGIN ?? '',
  process.env.ISDS_PASSWORD ?? '',
  false,
);

const message = new DataMessage({
  dbIDRecipient: 'abc123',
  dmAnnotation: 'Integration test',
  dmPersonalDelivery: true,
});

const result = await client.createMessage(message, [
  {
    dmFilePath: './document.pdf',
    dmMimeType: 'application/pdf',
    dmFileMetaType: 'main',
    dmFileDescr: 'document.pdf',
  },
]);

console.log(result.dmID);
```

The library also supports `createMultipleMessage(...)` for circular messages and
`createBigMessage(...)` for VoDZ payloads built from uploaded attachments.

## Message Operations

Inbox and download flow:

- `listReceivedMessages(...)`
- `downloadMessageEnvelope(dmID)`
- `downloadMessage(dmID)`
- `downloadBigMessage(dmID)`
- `markMessageAsDownloaded(dmID)`
- `pollReceivedMessages(...)`
- `waitForNewMessages(...)`
- `watchReceivedMessages(...)`

Sent and audit flow:

- `listSentMessages(...)`
- `getSentMessageEnvelope(dmID)`
- `verifyMessage(dmID)`
- `getDeliveryInfo(dmID)`
- `getSignedDeliveryInfo(dmID)`
- `downloadSignedMessage(dmID)`
- `downloadSignedSentMessage(dmID)`
- `getMessageStateChanges(...)`
- `getMessageAuthor(dmID)`
- `getMessageAuthorDetails(dmID)`

Lifecycle and notifications:

- `eraseMessage(...)`
- `getErasedMessages(...)`
- `pickUpAsyncResponse(...)`
- `listNotifications(...)`
- `registerForNotifications(action)`
- `reportSuspiciousMessage(...)`

Security, VoDZ, and archive:

- `uploadAttachment(...)`
- `downloadAttachment(...)`
- `authenticateMessage(...)`
- `authenticateBigMessage(...)`
- `downloadSignedBigMessage(dmID)`
- `downloadSignedSentBigMessage(dmID)`
- `reSignIsdsDocument(dmDocBase64)`
- `archiveIsdsDocument(dmMessageBase64)`

## Authentication Modes

The library reflects the connection variants documented in the ISDS operational
rules:

- `loginWithUsernameAndPassword(...)` uses `https://ws1.../DS/*`
- `loginWithPkcs12Certificate(...)` uses `https://ws1c.../cert/DS/*`
- `loginWithUsernamePasswordAndCertificate(...)` uses
  `https://ws1c.../certds/DS/*`
- `loginWithHostedSpisServiceCertificate(...)` uses
  `https://ws1c.../hspis/DS/*`

Example with certificate + basic authentication:

```ts
import { readFile } from 'node:fs/promises';
import ISDSBox from 'czech-data-box';

const pkcs12 = await readFile('./certificate.p12', { encoding: 'base64' });

const client = new ISDSBox().loginWithUsernamePasswordAndCertificate(
  process.env.ISDS_LOGIN ?? '',
  process.env.ISDS_PASSWORD ?? '',
  pkcs12,
  process.env.ISDS_CERT_PASSPHRASE ?? '',
  false,
);
```

`dm_arch` and `dm_VoDZ` are exposed through SOAP 1.2 clients. The bundled WSDLs
explicitly publish the base `ws2` endpoints. Certificate variants for `ws2c`
are implemented by inference from the same endpoint pattern used by `ws1/ws1c`.

## Development

```bash
pnpm install
pnpm verify
```

Useful scripts:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:watch`
- `pnpm build`
- `pnpm test:package`
- `pnpm changeset`

## Docs

- [Development guide](./docs/development.md)
- [Mailroom guide](./docs/mailroom.md)
- [Release guide](./docs/releasing.md)

## Examples

The runnable examples in [`examples/`](./examples) import from `dist`, so build
the package first:

```bash
pnpm build
node examples/db_search.mjs
```

For real ISDS integration testing, use test credentials and prefer the ISDS
test environment (`productionMode = false`).

## Versioning and Changelog

This project follows SemVer through `Changesets`. Every user-facing change
should ship with a changeset, and releases update
[`CHANGELOG.md`](./CHANGELOG.md) automatically.

## License

[MIT](./LICENSE)
