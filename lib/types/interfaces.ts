export interface NFTShape {
  itemId: number;
  nftContract: string;
  tokenId: number;
  seller: string;
  owner: string;
  price: number;
  sold: boolean;
}

export interface AssetMetaDataRes {
  image: string;
  name: string;
  description: string;
}
export interface UINFTShape extends AssetMetaDataRes {
  tokenId: number;
  seller: string;
  owner: string;
  price: number;
}
