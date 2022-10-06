import { nftContract } from '@/utils/contracts';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id;
  if (req.method === 'GET' && typeof id === 'string') {
    const [level, damages, metaData] = await Promise.all([
      (async () => {
        return await nftContract.getLevel(id);
      })(),
      (async () => {
        return await nftContract.getDamages(id);
      })(),
      (async () => {
        const metaDataid = await nftContract.getMetaDataid(id);
        if (metaDataid.toNumber() === 0) {
          return false;
        } else {
          // TODO: IPFSのURLを変更、もしくはL2上にデータを保存
          const IPFSdata = await fetch(
            `${process.env.IPFS_JSON_URL}/${metaDataid.toNumber()}.json`
          );
          return await IPFSdata.json();
        }
      })(),
    ]);
    const replacedURL = metaData.image.split('/')[3];
    if (level && damages.length && metaData) {
      res.status(200).json({
        ...metaData,
        image: `${process.env.IPFS_IMAGE_URL}/${replacedURL}`,
        attributes: { level, damages },
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
