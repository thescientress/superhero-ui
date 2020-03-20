/* globals Cypress */

import { MemoryAccount, Universal } from '@aeternity/aepp-sdk';
import { Node, RpcAepp } from '@aeternity/aepp-sdk/es';
import BrowserWindowMessageConnection from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/connection/browser-window-message';
import Detector from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/wallet-detector';
import { v4 as uuidv4 } from 'uuid';
import aeternity from './aeternity';

// Send wallet connection info to Aepp through content script
const NODE_URL = 'https://sdk-mainnet.aepps.com';
const NODE_INTERNAL_URL = 'https://sdk-mainnet.aepps.com';
const COMPILER_URL = 'https://latest.compiler.aepps.com';

// eslint-disable-next-line import/prefer-default-export
export const wallet = {
  client: null,
  height: null,
  pub: null,
  balance: null,
  walletName: null,

  async scanForWallets(successCallback) {
    const scannerConnection = await BrowserWindowMessageConnection({
      connectionInfo: { id: 'spy' },
    });
    const detector = await Detector({ connection: scannerConnection });
    const handleWallets = async ({ newWallet }) => {
      if (!newWallet) return;
      detector.stopScan();
      await this.client.connectToWallet(await newWallet.getConnection());
      await this.client.subscribeAddress('subscribe', 'current');
      
      // crypto auth
      const challengeString = uuidv4();
      console.log('Challenge string: ', challengeString);
      const signedChallenge = await this.signMessage(challengeString);
      console.log('Signed challenge: ', signedChallenge);
      
      const verifySignedChallenge = await this.client.verifyMessage(challengeString, signedChallenge, { onAccount: this.client.rpcClient.getCurrentAccount() });
      console.log(verifySignedChallenge)

      aeternity.client = this.client;
      await aeternity.initProvider(true);
      successCallback();
    };

    detector.scan(handleWallets.bind(this));
  },

  async init(successCallback) {
    if (typeof Cypress !== 'undefined') {
      this.client = await Universal({
        compilerUrl: COMPILER_URL,
        nodes: [{ name: 'testnet', instance: await Node({ url: 'https://sdk-testnet.aepps.com', internalUrl: 'https://sdk-testnet.aepps.com' }) }],
        accounts: [
          MemoryAccount({ keypair: { secretKey: Cypress.env('privateKey'), publicKey: Cypress.env('publicKey') } }),
        ],
        address: Cypress.env('publicKey'),
      });
      aeternity.client = this.client;
      this.height = await this.client.height();
      this.client.rpcClient = {
        getCurrentAccount: async () => Cypress.env('publicKey'),
      };
      await aeternity.initProvider(true);
      return successCallback();
    }

    this.client = await RpcAepp({
      name: 'Superhero',
      nodes: [{ name: 'mainnet', instance: await Node({ url: NODE_URL, internalUrl: NODE_INTERNAL_URL }) }],
      compilerUrl: COMPILER_URL,
    });
    this.height = await this.client.height();
    await this.scanForWallets(successCallback);
    return undefined;
  },

  signMessage(message) {
    return wallet.client.signMessage(message);
  },
};
