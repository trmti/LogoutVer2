import { supabase } from '@/utils/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';

type params = {
  address: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address }: params = req.body;
  try {
    if (req.method === 'POST') {
      const { error } = await supabase.rpc('remove_sleep', {
        useraddress: address,
      });
      if (!error) {
        res.status(200).json({ message: 'delete log success!' });
      } else {
        res.status(400).json({ message: 'delete log failed', error });
      }
    } else {
      res.status(401).json({ message: 'Invalid method' });
    }
  } catch (e) {
    res.status(500).json({ message: 'Internal Server Error', e: e.message });
  }
}
