import { nftContract } from '@/utils/contracts';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id;
  if (req.method === 'GET') {
    if (typeof id === 'string') {
      const results = await Promise.all([
        (async () => {
          return await nftContract.getLevel(id);
        })(),
        (async () => {
          return await nftContract.getDamages(id);
        })(),
        (async () => {
          return await nftContract.getMetaDataid(id);
        })(),
      ]);
      if (results[0] && results[1].length && results[2]) {
        res.status(200).json({ results });
        return;
      } else {
        res.status(400).json({ message: 'NFT is not exists' });
        return;
      }
    }
    res.status(400).json({ message: 'failed' });
  }
}
