import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import type { PostgrestResponse } from '@supabase/postgrest-js';

type sleeptype = {
  data: string;
  duration: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const useraddress = req.query.address;
  if (req.method === 'GET' && typeof useraddress === 'string') {
    const { data, error }: PostgrestResponse<{ sleeps: sleeptype[] }> =
      await supabase.rpc('get_sleeps', { useraddress });

    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    } else if (!data) {
      res.status(400).json({ message: 'Data is not found' });
      return;
    } else {
      res.status(200).json(data);
    }
  } else {
    res.status(400).json({ message: 'Invalid method or parameter' });
  }
}
