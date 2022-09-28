import { tokenContract, nftContract } from '@/utils/contracts';
import { supabase } from '@/utils/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';
import mintVolConf from '@/utils/mintVolConf';

type params = {
  NFTid: number;
  duration: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
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
        return;
      } else {
        try {
          const vol = await calculateMintVol(NFTid, useraddress);
          if (vol !== false) {
            let txn = await tokenContract.mint(useraddress, vol);
            txn = await txn.wait();
            if (txn.status === 1) {
              res.status(200).json({
                message: `mintSuccess! volume: ${vol} * 10e-8 GNT`,
              });
              return;
            } else {
              throw new Error();
            }
          } else {
            console.error('calculate failed');
            res.status(500).json({ message: 'Internal server error' });
            return;
          }
        } catch (e) {
          console.error(e);
          let err_count = 0;
          let fix_flag = false;
          while (err_count < 5) {
            const { error } = await supabase.rpc('remove_sleep', {
              useraddress,
            });
            if (!error) {
              fix_flag = true;
              break;
            }
          }
          if (fix_flag) {
            res.status(401).json({
              message: 'Contract transaction failed. Please try again.',
              e,
            });
            return;
          } else {
            res.status(402).json({
              message:
                'Contract transaction failed. \
                And revert Server props failed. \
                Please contact me trmtikko@gmail.com \
                ',
              e,
            });
            return;
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal Server Error', e });
    return;
  }
}

async function calculateMintVol(NFTid: number, useraddress: string) {
  const [sleeps, level] = await Promise.all([
    (async () => {
      const { data, error } = await supabase.rpc('get_sleeps', { useraddress });
      if (!error) {
        return data;
      } else {
        return false;
      }
    })(),
    (async () => {
      return await nftContract.getLevel(NFTid);
    })(),
  ]);
  let x;
  if (sleeps && sleeps.length != 1 && level) {
    const todaySleep = sleeps.shift();
    x =
      mintVolConf[
        Math.floor(
          (todaySleep +
            sleeps.reduce((pertialSum, a) => pertialSum + a, 0) /
              sleeps.length) /
            120
        ) - 1
      ][Math.floor((level - 1) / 5)] / 96;
    const gamma = (1 / 362880) * x ** 9 * Math.E ** x;
    return BigInt(Math.floor(gamma * 10 ** 18));
  } else if (sleeps && sleeps.length === 1 && level) {
    const todaySleep = sleeps.shift();
    x =
      mintVolConf[Math.floor(todaySleep / 120)][Math.floor((level - 1) / 5)] /
      96;
    const gamma = (1 / 362880) * x ** 9 * Math.E ** x;
    return BigInt(Math.floor(gamma * 10 ** 18));
  } else {
    return false;
  }
}
