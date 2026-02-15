import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://aervhwynaxjyzqeiijca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnZod3luYXhqeXpxZWlpamNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTAxNTcsImV4cCI6MjA4MzkyNjE1N30.iV8wkRk4_u58kdXyYcaOdN2Pc_8lNP3-1w6oFTo45Ew";
const SUPABASE_SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnZod3luYXhqeXpxZWlpamNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM1MDE1NywiZXhwIjoyMDgzOTI2MTU3fQ.-cpMqukNyoSSyj4c3zw9KzVYTvOhJMHu0C5Hul4qb3o'

// Singleton instance
let supabaseInstance = null;
let initializationPromise = null;

function createSupabaseClient() {
    if (supabaseInstance) {
        return supabaseInstance;
    }
    
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storage: window.localStorage,
            storageKey: 'sb-auth-token',
            flowType: 'pkce'
        }
    });
    
    return supabaseInstance;
}

// Initialize and wait for ready
export async function initSupabase() {
    if (initializationPromise) {
        return initializationPromise;
    }
    
    initializationPromise = new Promise(async (resolve) => {
        const client = createSupabaseClient();
        
        // Wait a bit for internal initialization
        await new Promise(r => setTimeout(r, 300));
        
        // Verify it works with a simple call
        try {
            await client.auth.getSession();
        } catch (e) {
            // Ignore initial errors
        }
        
        resolve(client);
    });
    
    return initializationPromise;
}


export const supabase = createSupabaseClient();