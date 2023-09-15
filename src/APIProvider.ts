import axios from 'axios';
import {Provider} from './interface/Provider.js';
const Bytes32 = /^[a-fA-F0-9]{64}$/;

export class APIProvider implements Provider {
  public readonly baseURL: string = 'https://stakecubecoin.net/web3/scp/tokens';

  async getAllCollectionHeaders(): Promise<any[]> {
    let headers: any[] = [];
    const url = `${this.baseURL}/getallcollectionheaders`;
    try {
      const response = await axios.get(url);
      headers = response.data ? response.data : [];
    } catch (e) {
      console.log('Failed to get all collection headers');
    }
    return headers;
  }

  async getCollection(contract: string): Promise<any[]> {
    let nfts: any[] = [];
    try {
      if (!contract.match(Bytes32)) {
        throw new Error(
          `Malformed contract expected bytes32 got: '${contract}'`
        );
      }
      const url = `${this.baseURL}/getcollection/${contract}`;
      const response = await axios.get(url);
      nfts = response.data.nfts ? response.data.nfts : [];
    } catch (e) {
      console.log(`Failed to get collection ${contract}`);
    }
    return nfts;
  }
}
