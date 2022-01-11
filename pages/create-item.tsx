/* eslint-disable @next/next/no-img-element */
import { NextPage } from "next";
import { useRouter } from "next/router";
import { ChangeEvent, useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import Web3Modal from "web3modal";

import { nftaddress, nftmarketaddress } from "../lib/config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

const client = ipfsHttpClient({ url: "https://ipfs.infura.io:5001/api/v0" });

const CreateItemPage: NextPage = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`Reveived: ${prog}`),
      });

      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (err) {
      console.error(err);
    }
  }

  async function createItem() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({ name, description, image: fileUrl });

    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      createSale(url);
    } catch (err) {
      console.error(err);
    }
  }

  async function createSale(url: string) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    const tx = await transaction.wait();

    const event = tx.events[0];
    const value = event.args[2];
    const tokenId = parseInt(value);

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    const listingPrice = (await contract.getListingPrice()).toString();
    transaction = await contract.createMarketItem(nftaddress, tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
    router.push("/");
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          type="text"
          placeholder="Asset Name"
          className="mt-8 border rounded p-4 outline-none focus:ring-2 focus:ring-pink-500 transition-all"
          onChange={({ target: { value } }) =>
            updateFormInput((prev) => ({ ...prev, name: value }))
          }
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4 outline-none focus:ring-2 focus:ring-pink-500 transition-all"
          onChange={({ target: { value } }) =>
            updateFormInput((prev) => ({ ...prev, description: value }))
          }
        />
        <input
          type="text"
          placeholder="Asset Price in MATIC"
          className="mt-2 border rounded p-4 outline-none focus:ring-2 focus:ring-pink-500 transition-all"
          onChange={({ target: { value } }) =>
            updateFormInput((prev) => ({ ...prev, price: value }))
          }
        />
        <input
          type="file"
          name="The Asset"
          placeholder="Asset Name"
          className="my-4"
          onChange={onChange}
        />
        {fileUrl && (
          <img
            src={fileUrl}
            alt="Your Asset Img"
            width={350}
            className="rounded mt-4"
          />
        )}
        <button
          onClick={createItem}
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
        >
          Create Digital Asset
        </button>
      </div>
    </div>
  );
};

export default CreateItemPage;
