import type { NextApiRequest, NextApiResponse } from 'next';
import { nftContract } from '@/utils/contracts';

type jsonParams = {
  name: string;
  description: string;
  image: string;
  attributes: {
    level: number;
    damages: number;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<jsonParams[] | { message: string }>
) {
  const address = req.query.address;
  if (req.method === 'GET' && typeof address === 'string') {
    const NFTamount = (await nftContract.balanceOf(address)).toNumber();
    const jsons: jsonParams[] = await Promise.all(
      Array.from(Array(NFTamount), (v, k) => k).map(async (i) => {
        const id: number = await nftContract.tokenOfOwnerByIndex(address, i);
        const uri = await nftContract.tokenURI(id);
        return await (await fetch(uri)).json();
      })
    );
    console.log(jsons);
    res.status(200).json(jsons);
  } else {
    res.status(400).json({ message: 'Invalid method or parameter' });
  }
}
