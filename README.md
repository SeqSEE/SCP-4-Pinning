# SCP-4 Pinning

SCP-4 Pinning is an IPFS re-pinning service which can be used to copy and re-pin IPFS data published in SCP-4 token mints.

## Prerequisites

- [NodeJS v16+](https://nodejs.org/)
- [Kubo IPFS daemon](https://docs.ipfs.tech/install/)
- [StakeCubeCoin Wallet](https://github.com/stakecube/StakeCubeCoin/releases)

## Setup

### Kubo

- `StorageMax` is recommended to be set to at least 100GB
- Automatic garbage collection is recommended to be used to start your daemon `ipfs daemon --enable-gc`

### StakeCubeCoin

The node needs to be setup to respond to RPC calls.

#### Block Notify

##### Windows

- `blocknotify=node C:\path\to\SCP4-Repin\dist\processBlock.js %s`

##### \*nix

- `blocknotify=node /path/to/SCP4-Repin/dist/processBlock.js %s`

### SCP-4 Pinning

- Install the dependencies with `npm install`
- Build the app with `npm run build`

This app provides an [example config](https://github.com/SeqSEE/SCP-4-Pinning/blob/main/default.env) which must be copied and saved as `.env`

## Scripts

### findMissing

`npm run findMissing`
This script will go over the IPFS CIDs of SCP-4 tokens using the headers provided by the SCP API and generate a JSON report of the tokens which have IPFS CIDs with data that could not be retrieved.

### pinCurrentTokens

`npm run pinCurrentTokens`
This script will go over the IPFS CIDs of SCP-4 tokens using the headers provided by the SCP API, the IPFS CID will be used to copy the data and re-pin locally if it can be found on the IPFS network.

### processBlock

`npm run processBlock -- "blockhash"`
This script accepts a command line argument of a blockhash, if SCP-4 token mints are included in the block, the IPFS CID will be used to copy the data and re-pin locally.
