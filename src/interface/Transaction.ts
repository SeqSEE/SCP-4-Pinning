export interface TransactionInput {
  txid: string;
  vout: number;
  sequence: number;
  CoinBase?: string;
  scriptSig?: {
    asm: string;
    hex: string;
  };
}

export interface TransactionOutput {
  value: number;
  valueSat: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    type:
      | 'nonstandard'
      | 'pubkey'
      | 'pubkeyhash'
      | 'scripthash'
      | 'multisig'
      | 'nulldata';
    reqSigs?: number;
    addresses?: string[];
  };
}

export default interface Transaction {
  txid: string;
  version: number;
  type: number;
  size: number;
  locktime: number;
  vin: TransactionInput[];
  vout: TransactionOutput[];
  hex: string;
  blockhash: string;
  height: number;
  confirmations: number;
  time: number;
  blocktime: number;
  instantlock: boolean;
  instantlock_internal: boolean;
  chainlock: boolean;
}
