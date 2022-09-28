import { nftContract } from '@/utils/contracts';
import type { NextApiRequest, NextApiResponse } from 'next';

type params = {
  toAddress: string;
  NFTMetaid: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { toAddress, NFTMetaid }: params = req.body;

    if (req.method === 'POST') {
      let txn = await nftContract.safeMint(toAddress, NFTMetaid);
      txn = await txn.wait();
      if (txn.status === 1) {
        const NFTid = txn.events[0].args.tokenId.toNumber();
        res.status(200).json({ NFTid });
      } else {
        res
          .status(401)
          .json({ message: 'mint Transaction failed. please try again.' });
      }
    } else {
      res.status(400).json({ message: 'Invalid method' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
