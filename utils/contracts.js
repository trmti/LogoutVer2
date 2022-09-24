import { ethers } from 'ethers';
import nftABI from './ABIs/BoostNFT.json';
import tokenABI from './ABIs/GoodNightToken.json';

const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);

// TODO: providerをminterのウォレットに変更。
export const wallet = new ethers.Wallet(process.env.MINTER_PRIVKEY, provider);

export const nftContract = new ethers.Contract(
  process.env.BOOSTTOKEN_ADDRESS,
  nftABI,
  wallet
);
export const tokenContract = new ethers.Contract(
  process.env.GNTOKEN_ADDRESS,
  tokenABI,
  wallet
);
