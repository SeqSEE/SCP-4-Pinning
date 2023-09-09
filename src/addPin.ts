import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({path: path.join(__dirname, '..', '.env')});

export const addPin = async (cid: string) => {
  const response = await axios.post(
    `${process.env.IPFS_API}/api/v0/pin/add?arg=${cid}&recursive=true&progress=false`,
    {timeout: 300000}
  );
  return response.status === 200;
};
