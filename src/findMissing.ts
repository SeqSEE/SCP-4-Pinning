import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
import {APIProvider} from './APIProvider';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({path: path.join(__dirname, '..', '.env')});

export const findMissing = async () => {
  const provider = new APIProvider();
  const headers = await provider.getAllCollectionHeaders();
  const missing = new Map<string, Map<string, string>>();
  let obj: any = {};
  const exists = new Map<string, boolean>();
  for (const header of headers) {
    const missingIPFS = new Map<string, string>();
    const {contract, collectionName, totalTXs} = header;
    console.log(`Fetching ${collectionName}`);
    const collection = await provider.getCollection(contract);

    if (Object.keys(collection).length > 0 || totalTXs > 0) {
      let hasMissing = false;
      let count = 0;
      for (const token of collection) {
        console.log(
          `Processing ${collectionName}: ${++count}/${
            Object.keys(collection).length
          }`
        );
        const {id, imgUrl} = token;
        if (exists.get(imgUrl) === false) {
          missingIPFS.set(id, imgUrl);
          hasMissing = true;
        } else if (exists.get(imgUrl) === true) {
          //Do nothing because it already exists
        } else {
          try {
            const localFile = await axios.post(
              `${process.env.IPFS_API}/api/v0/get?arg=${imgUrl}&progress=false`,
              null,
              {timeout: 30000}
            );
            if (!localFile) {
              missingIPFS.set(id, imgUrl);
              hasMissing = true;
              exists.set(imgUrl, false);
            }
          } catch (e) {
            missingIPFS.set(id, imgUrl);
            hasMissing = true;
            exists.set(imgUrl, false);
          }
        }
      }
      if (hasMissing) missing.set(contract, missingIPFS);
    } else {
      console.log(`Skipping ${collectionName} which has no tokens`);
    }
  }
  for (const [contract, map] of missing.entries()) {
    let o: any = {};
    for (const [id, cid] of map.entries()) {
      o[id] = cid;
    }
    obj[contract] = o;
  }
  console.log(JSON.stringify(obj));
  fs.writeFileSync('missing.json', JSON.stringify(obj));
};
