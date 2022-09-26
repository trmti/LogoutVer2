import { nftContract } from '@/utils/contracts';
import { supabase } from '@/utils/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';

type params = {
  toAddress: string;
  NFTMetaid: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { toAddress, NFTMetaid }: params = req.body;

  if (req.method === 'POST') {
    let txn = await nftContract.safeMint(toAddress, NFTMetaid);
    txn = await txn.wait();
    if (txn.status === 1) {
      const NFTid = txn.events[0].args.tokenId.toNumber();
      const { error } = await supabase
        .from('nftdatas')
        .insert([{ tokenid: NFTid }]);
      if (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
      } else {
        res.status(200).json({ NFTid });
      }
    }
  } else {
    res.status(400).json({ message: 'Invalid method' });
  }
}
