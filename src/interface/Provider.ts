export interface Provider {
  getAllCollectionHeaders(): Promise<any[]>;

  getCollection(contract: string): Promise<any[]>;
}
