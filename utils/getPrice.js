import { Fetcher, Route, ChainId } from 'quickswap-sdk';
import { provider } from './contracts';

const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

export async function getPrice(tokenAddress) {
  const token = await Fetcher.fetchTokenData(
    ChainId.MATIC,
    tokenAddress,
    provider
  );
  const usdc = await Fetcher.fetchTokenData(
    ChainId.MATIC,
    USDC_ADDRESS,
    provider
  );
  const pair = await Fetcher.fetchPairData(token, usdc, provider);
  const route = new Route([pair], token);
  return route.midPrice.toSignificant(6);
}
