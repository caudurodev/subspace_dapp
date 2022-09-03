# Subspace dapp - Rodrigo Cauduro

Demo frontend app created using [Subspace.network](https://subspace.network) 

## Overview

This dapp is an image sharing site that anyone can upload images to and receive a link to share with friends. The app connects to a polkadot wallet (only polkadto{js} currently supported) and lets you choose an image file to be uploaded to the subspace.network blockchain (currently only on local dev enviroment - see /subspace-dev folder). After signing the transaction and successfully uploading an image to the blockchain, the user will then receive a unique URL such as https://domain.com/img/imghash which can be shared with friends.

### Notes and issues:
- Currently testenet is down so only the local blockchain can be used
- Sometimes the blockchain has issues uploading and retrieving images. This can normally be solved by wyping docker clean of images and volumes
- Sometimes response times from the blockchain can be very slow and uploading and retrieving the image can vary from seconds to minutes (or sometimes fails forever).

### If there was more time

I would address the TODOS commented on the codebase as well as create a gallery of images to share. There are many possibilities here which could take the project in many directions (imugr on the blockchain?).

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

(add correct snapshot for your dev environment and your wallet address for farm reward-address ):

```chmod +x subspace-farmer-macos-x86_64-gemini-1b-2022-aug-17 subspace-node-macos-x86_64-gemini-1b-2022-aug-17```
```./subspace-node-macos-x86_64-gemini-1b-2022-aug-17 --dev --tmp ```
```./subspace-farmer-macos-x86_64-gemini-1b-2022-aug-17 farm --reward-address sufsKsx4kZ26i7bJXc1TFguysVzjkzsDtE2VDiCEBY2WjyGAj --plot-size 2G```


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
```$ cd modules/subspace.js && npm ci && npm run build```


<br />
<br />

## First run (development)

```$ cd ./subspace-dev && docker-compose up -d```
```$ pnpm dev```

To be able to interact with the backend you need to add the demo account //Alice to your [polkadot{js} browser extension](https://polkadot.js.org/extension/). An  overview of the steps can be found [here.](https://mirror.xyz/0x4659B666AC0e8D4c5D1B66eC5DCd57BAF2dA350B/bGFJYZhxBojZd0Dx6DEo8OifrJgIwNxwQ4CITWixUZw).
In short:
1) Import the account with the mnemonic/seed
2) Add `//Alice` as the derivation path

You should now be able to open http://127.0.0.1:3333/ on your local machine and interact with the dapp.

<br />
<br />

## Production build


1) ```$ pnpm build```
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

Testing has been implemented with Playwright. The tests load the polkadot{js} extension and pre-build state to create the  //Alice account so that the tests can faithfully replicate a user flow.
Most of the code for this repo was created utilizing Test Driven Development.

**Notes:**

- It is important to occasionally update the browser extension included inside the ./e2e/polkadot--js-extension so as not to become out of synch with what users currently have.
- TODO: Expand tests to include more browser configurations and screen resolutions.

#### RUN E2E

E2E tests must be run in browser mode (not headless) with the local chain available for querying by the frontend

```$ cd ./subspace-dev && docker-compose up -d```
```$ cd /testApp && pnpm dev```
```$ npx playwright test```

