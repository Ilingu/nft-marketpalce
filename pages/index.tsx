/* eslint-disable @next/next/no-img-element */
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";

import { nftaddress, nftmarketaddress } from "../lib/config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

// Type
import { LoadingStateType } from "../lib/types/types";
import {
  AssetMetaDataRes,
  NFTShape,
  UINFTShape,
} from "../lib/types/interfaces";
import Head from "next/head";

/* COMPONENT */
const Home: NextPage = () => {
  const [nfts, setNfts] = useState<UINFTShape[]>();
  const [loadingState, setLoadingState] =
    useState<LoadingStateType>("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      if (!provider) return;

      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
      const marketContract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        provider
      );

      const data: NFTShape[] = await marketContract.fetchMarketItems();
      const items = await Promise.all<Promise<UINFTShape>[]>(
        data.map(async (i) => {
          const tokenUri = await tokenContract.tokenURI(i.tokenId);
          const meta: { data: AssetMetaDataRes } = await axios.get(tokenUri);
          const price = parseInt(
            ethers.utils.formatUnits(i.price.toString(), "ether")
          );
          console.log(tokenUri);

          const item: UINFTShape = {
            description: meta.data.description,
            image: meta.data.image,
            name: meta.data.name,
            owner: i.owner,
            seller: i.seller,
            price,
            tokenId: i.tokenId,
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

  async function buyNft({ price, tokenId }: UINFTShape) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const priceToPay = ethers.utils.parseUnits(price.toString(), "ether");

    const transaction = await contract.createMarketSale(nftaddress, tokenId, {
      value: priceToPay,
    });
    await transaction.wait();
    loadNFTs();
  }

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">Not Items in Marketplace</h1>;

  return (
    <div className="flex justify-center">
      <Head>
        <title>Marketplace</title>
      </Head>
      <div className="px-4" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts?.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} alt="NFT Img" />

              <div className="p-4">
                <p className="h-16 text-2xl font-semibold">{nft?.name}</p>
                <div className="h-16 overflow-hidden">
                  <p className="text-gray-500">{nft.description}</p>
                </div>
              </div>

              <div className="p-4 bg-black">
                <p className="text-2xl mb-4 font-bold text-white">
                  {nft.price} MATIC
                </p>
                <button
                  className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                  onClick={() => buyNft(nft)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
