import axios from 'axios';
import path from 'path';
import {fileURLToPath} from 'url';
import dotenv from 'dotenv';
import Block from './interface/Block';
import Transaction from './interface/Transaction';
import {fileTypeFromBuffer} from 'file-type';
import RPC from '@jskitty/bitcoin-rpc';
import {addPin} from './addPin.js';
const Bytes32 = /^[a-fA-F0-9]{64}$/;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const args = process.argv.slice(2);
dotenv.config({path: path.join(__dirname, '..', '.env')});

const rpc = new RPC(
  process.env.RPC_USER as string,
  process.env.RPC_PASS as string,
  process.env.RPC_HOST as string,
  process.env.RPC_PORT as string
);

let tries = 0;

const processBlock = async () => {
  if (args.length === 0) {
    console.log(`No arguments`);
    return;
  }
  const blockhash = args[0];
  if (!blockhash.match(Bytes32)) {
    console.log(`Invalid blockhash`);
    return;
  }
  try {
    const block: Block = await rpc.call('getblock', blockhash);
    for (const txid of block.tx) {
      const transaction: Transaction = await rpc.call(
        'getrawtransaction',
        txid,
        true
      );
      for (const vout of transaction.vout) {
        if (vout.scriptPubKey && vout.scriptPubKey.hex) {
          const {hex, asm, type} = vout.scriptPubKey;

          if (type === 'nulldata' && hex.startsWith('6a4c')) {
            const data = Buffer.from(asm.substring(10), 'hex')
              .toString('utf8')
              .split(' ');
            if (
              data.length >= 4 &&
              !(data[0] ? data[0] : '').startsWith('SCPCREATE')
            ) {
              const token = data.shift();
              const operation = data.shift();
              const cid = data.pop();
              const name = data.join(' ');
              console.log(`${operation} ${token}:${txid} "${name}" ${cid}`);

              if (cid != undefined && operation === 'mint') {
                let detectedFileType;
                let exists = false;

                try {
                  tries++;
                  const data = Buffer.from(
                    (
                      await axios.get(`${process.env.IPFS_GW}/ipfs/${cid}`, {
                        timeout: 300000,
                        timeoutErrorMessage: 'Timeout while fetching',
                      })
                    ).data
                  );

                  exists = true;
                  // Detect the MIME type of the file
                  detectedFileType = await fileTypeFromBuffer(data);
                } catch (e) {
                  if (
                    ((e as any).message ? (e as any).message : '') ===
                      'Timeout while fetching' &&
                    tries <= 3
                  ) {
                    setTimeout(async () => {
                      await processBlock();
                    }, 1200000);
                  }
                  //console.log(e);
                  exists = false;
                  console.log(`Failed to fetch ${cid}`);
                }
                if (exists === true) {
                  try {
                    await axios.post(
                      `${
                        process.env.IPFS_API
                      }/api/v0/files/cp?arg=/ipfs/${cid}&arg=/${cid}${
                        detectedFileType ? `.${detectedFileType.ext}` : ``
                      }`,
                      {timeout: 300000}
                    );
                  } catch (e) {
                    //console.log(e);
                    console.log(`Error while copying ${cid}`);
                  }
                  try {
                    await addPin(cid);
                  } catch (e) {
                    //console.log(e);
                    console.log(`Error while pinning ${cid}`);
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

processBlock();
