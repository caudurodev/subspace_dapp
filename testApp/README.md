# Subspace dapp - Rodrigo Cauduro

Demo frontend app created using [Subspace.network](https://subspace.network) 

The foundation of the project is built on top of 2 great projects:
- [Vitesse](https://github.com/antfu/vitesse) for the opinionated Vue starter template with Vue3, Vite, TS, etc. and 
- [Subspace.js](https://github.com/subspace/subspace.js) to easily connect to the Subspace testnet

<br />
<br />

---
### Requirements
- Install [Docker Desktop](https://docs.docker.com/compose/install/compose-desktop/) for running local Farmer and Node inside Docker
- Node Version >= 16
- One of the following: pnpm, npm or yarn
- Browser with the [polkadot{.js} extension](https://polkadot.js.org/extension/) installed

<br />
<br />

## Installation

<br>

### Blockchain / Backend

As of the time of creating this repo, the Subspace testenets were not working as expected, so to preview this repo, it is necessary to create local farmer and node instances. 

The easiest way is via Docker. I have created a docker-compose that runs all the necessary rust tooling in the root of this project. If you already have Docker desktop installed you can simply run:

```$ docker-compose up -d```

Alternatively, you can install the Rust tooling and run Rust nodes and farmers natively on your machine by following the instructions found [here.](https://github.com/subspace/subspace/blob/main/docs/development.md)


The frontend expects the **farmer** to be available by default on `ws://localhost:9955` and the **node** to be running on `ws://localhost:9944`

This can be customized by editing the **.env** file in the root of the project
```
VITE_NODE_WS_PROVIDER=wss://test-rpc.subspace.network
VITE_FARMER_WS_PROVIDER=wss://test-rpc.subspace.network/farmer-rpc
```

<br>
<br>

### Frontend

#### Important Notes
The blockchain takes a while to make uploaded images availalble so the user must wait a few minutes before the results of the operations are available.

#### Install the custom project
```$ pnpm i```

#### Add the subspace node_module and build it
```$ cd modules/subspace.js && pnpm i && pnpm build```


<br />
<br />

## First run (development)

```$ pnpm dev```

To be able to interact with the backend you need to add the demo account //Alice to your polkadot{js} browser extension. An  overview of the steps can be found [here.](https://mirror.xyz/0x4659B666AC0e8D4c5D1B66eC5DCd57BAF2dA350B/bGFJYZhxBojZd0Dx6DEo8OifrJgIwNxwQ4CITWixUZw).
In short:
1) Import the account with the mnemonic/seed
2) Add `//Alice` as the derivation path

You should now be able to open http://127.0.0.1:3333/ on your local machine and interact with the dapp.

<br />
<br />

## Production build


2) ```$ pnpm build```
2) Sent environment variables to use live chain
3) Deploy /dist folder to netlify or other edge server (not available here as a shared testnet is not currently availalble/working)

<br />
<br />

### Updating submodule subspace.js from main branch 

You might need to update the subspace submodule as it is under active development:

```$ git submodule update --remote subspace.js```

<br />
<br />

## Testing


#### E2E
```$ pnpm test:e2e```

#### Unit
```$ pnpm test:unit```