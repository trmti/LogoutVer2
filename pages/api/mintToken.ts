import { tokenContract, nftContract } from '@/utils/contracts';
import { supabase } from '@/utils/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';

type params = {
  NFTid: number;
  duration: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { NFTid, duration }: params = req.body;

  if (req.method === 'POST') {
    const useraddress = await nftContract.ownerOf(NFTid);
    const { data, error } = await supabase.rpc('add_sleep_logs', {
      useraddress: useraddress,
      duration: duration,
    });
    if (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Internal Server Error', error });
      return;
    } else if (!data) {
      res.status(400).json({ message: 'You already minted token today.' });
    } else {
      const { data, error } = await supabase.rpc('get_sleeps', { useraddress });
      if (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error', error });
      } else if (!data) {
        res.status(500).json({ message: 'Internal Server Error' });
      } else {
        let tx = await tokenContract.mint(
          useraddress,
          Math.floor(
            (data.reduce((partialsum, a) => partialsum + a, 0) / 7) * 10 ** 8
          )
        );
        tx = await tx.wait();
        if (tx.status === 1) {
          res.status(200).json({ message: 'mint success!' });
        } else {
          res.status(400).json({ message: 'mint failed' });
        }
      }
    }
  }
}
