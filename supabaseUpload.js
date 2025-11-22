import { createClient } from '@supabase/supabase-js';

// As chaves do Supabase devem ser configuradas num ficheiro .env na raiz do projeto:
// Ex: VITE_SUPABASE_URL="https://abc.supabase.co"
// Ex: VITE_SUPABASE_ANON_KEY="your_anon_public_key"
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão definidas.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);