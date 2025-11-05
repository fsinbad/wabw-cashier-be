import { createClient } from '@supabase/supabase-js';
import config from '../config/index.js';

const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.serviceKey;

export const supabase = createClient(supabaseUrl, supabaseKey);