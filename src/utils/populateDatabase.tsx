
import { supabase } from '@/integrations/supabase/client';

export const populateDatabase = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('populate-books');
    
    if (error) {
      console.error('Error populating database:', error);
      return false;
    }
    
    console.log('Database population result:', data);
    return true;
  } catch (error) {
    console.error('Error invoking populate-books function:', error);
    return false;
  }
};
