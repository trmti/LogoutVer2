import { nftContract } from '@/utils/contracts';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id;
  if (req.method === 'GET' && typeof id === 'string') {
    let metaData;
    const data = await nftContract.getData(Number(id));
    if (data.metaId) {
      metaData = await fetch(
        `${process.env.IPFS_JSON_URL}${Number(data.metaId)}.json`
      );
    }
    metaData = await metaData?.json();
    const replacedURL = metaData.image.split('/')[3];
    if (data && metaData) {
      res.status(200).json({
        ...metaData,
        image: `${process.env.IPFS_IMAGE_URL}${replacedURL}`,
        attributes: {
          level: data.level,
          rarity: data.rarity,
          disabled: data.disabled,
        },
      });
      return;
    } else {
      res.status(400).json({ message: 'NFT is not exists' });
      return;
    }
  } else {
    res.status(400).json({ message: 'Invalid method or parameter' });
  }
}
