import axios from 'axios';
import path from 'path';
import dotenv from 'dotenv';
import {fileTypeFromBuffer} from 'file-type';
import {APIProvider} from './APIProvider';
import {addPin} from './addPin.js';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({path: path.join(__dirname, '..', '.env')});

export const pinCurrentTokens = async () => {
  const provider = new APIProvider();
  const startTime = Date.now();
  const headers = await provider.getAllCollectionHeaders();
  console.log(`Fetched headers in ${Date.now() - startTime}ms`);
  let pins = BigInt(0);
  for (const header of headers) {
    const {index, contract, collectionName, totalTXs} = header;
    if (index === 46 || index === 109) {
      const collection = await provider.getCollection(contract);
      if (Object.keys(collection).length > 0 || totalTXs > 0) {
        console.log(`Fetched collection in ${Date.now() - startTime}ms`);
      } else {
        console.log(`Skipping ${collectionName} which has no tokens`);
      }
      let detectedFileType;
      const requested = new Map<string, boolean>();
      const exists = new Map<string, boolean>();
      for (const token of collection) {
        if (
          requested.get(token.imgUrl) != true &&
          exists.get(token.imgUrl) == undefined
        ) {
          try {
            console.log(`fetching ${collectionName}:${token.imgUrl}`);
            const data = Buffer.from(
              (
                await axios.get(`${process.env.IPFS_GW}/ipfs/${token.imgUrl}`, {
                  timeout: 300000,
                })
              ).data
            );
            requested.set(token.imgUrl, true);
            exists.set(token.imgUrl, true);
            // Detect the MIME type of the file
            detectedFileType = await fileTypeFromBuffer(data);
          } catch (e) {
            //console.log(e);
            exists.set(token.imgUrl, false);
            console.log(`Failed to fetch ${token.imgUrl}`);
          }
          if (exists.get(token.imgUrl) === true) {
            try {
              await axios.post(
                `${process.env.IPFS_API}/api/v0/files/cp?arg=/ipfs/${
                  token.imgUrl
                }&arg=/${token.imgUrl}${
                  detectedFileType ? `.${detectedFileType.ext}` : ``
                }`,
                {timeout: 300000}
              );
            } catch (e) {
              //console.log(e);
              console.log(`Error while copying ${token.imgUrl}`);
            }
            try {
              await addPin(token.imgUrl);
              pins++;
            } catch (e) {
              //console.log(e);
              console.log(`Error while pinning ${token.imgUrl}`);
            }
          }
        } else {
          console.log(
            `Skipping ${collectionName}:${token.id} already requested`
          );
        }
      }
    }
  }
  console.log(
    `Pinned ${pins.toString()} IPFS links in ${Date.now() - startTime}ms`
  );

  process.exit(0);
};
