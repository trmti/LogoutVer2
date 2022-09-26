import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(500).json({ message: 'You must set valid api key' });
  return;
}
