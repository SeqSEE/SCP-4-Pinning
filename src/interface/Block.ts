export default interface Block {
  hash: string;
  confirmations: number;
  size: number;
  height: number;
  version: number;
  versionHex: string;
  merkleroot: string;
  tx: string[];
  cbTx: {
    version: number;
    height: number;
    merkleRootMNList: string;
    merkleRootQuorums: string;
  };
  time: number;
  mediantime: number;
  nonce: number;
  bits: string;
  difficulty: number;
  chainwork: string;
  nTx: number;
  previousblockhash: string;
  chainlock: boolean;
}
