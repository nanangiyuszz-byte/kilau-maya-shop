import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wmlcqbeyjjmgbivdroml.supabase.co";
const SUPABASE_KEY = "sb_publishable_FosQlfJ-ClVWq1rH_EvteQ_-NycteOv";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export type Product = {
  id: string;
  name: string;
  price: number;
  whatsapp_number: string;
  image_url: string;
  created_at?: string;
};

export const formatRupiah = (n: number) =>
  "Rp " + Math.round(n).toLocaleString("id-ID");
