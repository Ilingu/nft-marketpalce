/* eslint-disable @next/next/no-img-element */
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";

import { nftaddress, nftmarketaddress } from "../lib/config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
// Types
import { LoadingStateType } from "../lib/types/types";
import {
  AssetMetaDataRes,
  NFTShape,
  UINFTShape,
} from "../lib/types/interfaces";
type UINFTSoldShape = UINFTShape & { sold: boolean };

const CreatorDashboard: NextPage = () => {
  const [nfts, setNfts] = useState<UINFTSoldShape[]>();
  const [loadingState, setLoadingState] =
    useState<LoadingStateType>("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);

      const signer = provider.getSigner();

      const marketContract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, signer);

      const data: NFTShape[] = await marketContract.fetchItemsCreated();
      const items = await Promise.all<Promise<UINFTSoldShape>[]>(
        data.map(async (i) => {
          const tokenUri = await tokenContract.tokenURI(i.tokenId);
          const meta: { data: AssetMetaDataRes } = await axios.get(tokenUri);
          const price = parseInt(
            ethers.utils.formatUnits(i.price.toString(), "ether")
          );
          const item: UINFTSoldShape = {
            description: meta.data.description,
            image: meta.data.image,
            name: meta.data.name,
            owner: i.owner,
            seller: i.seller,
            price,
            tokenId: i.tokenId,
            sold: i.sold,
          };
          return item;
        })
      );

      setNfts(items);
      setLoadingState("loaded");
    } catch (err) {
      console.error(err);
    }
  }

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No purchased NFTs</h1>;

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts?.map((nft, i) => (
            <div
              key={i}
              className="border shadow rounded-xl overflow-hidden relative"
            >
              <img src={nft.image} alt="NFT Img" />

              <div className="p-4">
                <p className="h-16 text-2xl font-semibold">{nft?.name}</p>
                <div className="h-16 overflow-hidden">
                  <p className="text-gray-500">{nft.description}</p>
                </div>
              </div>
              {nft.sold && (
                <div className="absolute top-0 bg-pink-500 z-10 text-xl py-1 px-3 font-bold text-white">
                  SOLD!
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
