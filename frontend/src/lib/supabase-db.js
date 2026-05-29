import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase Project URL and Anon Key.
// You can find them in your Supabase Dashboard -> Project Settings -> API
const SUPABASE_URL = "https://dkhhasxasztxmntjsuua.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_1PvFyWa2tUI7hT3qtvFaxg_SWmVrsLd";

// Only initialize if the URL is not the placeholder
export const supabase = (SUPABASE_URL.includes("your-project-id")) 
    ? null 
    : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function saveIncidentToDB(component, logLevel, message) {
    if (!supabase) {
        console.log("Supabase not configured. Simulated Log:", message);
        return;
    }
    
    try {
        const { error } = await supabase
            .from('incidents')
            .insert([{ 
                component_type: component, 
                log_level: logLevel, 
                message_text: message 
            }]);
            
        if (error) throw error;
    } catch (err) {
        console.error("Error saving incident log:", err.message);
    }
}

export async function incrementThreatsCounter() {
    if (!supabase) return 12842; // fallback simulated value

    try {
        // Fetch current count first
        const { data: currentData } = await supabase
            .from('system_metrics')
            .select('metric_value')
            .eq('metric_name', 'threats_mitigated')
            .single();

        let newCount = (currentData ? currentData.metric_value : 12842) + 1;

        // Update with the incremental value
        await supabase
            .from('system_metrics')
            .update({ metric_value: newCount })
            .eq('metric_name', 'threats_mitigated');

        return newCount;
    } catch (err) {
        console.error("Error updating threat counter:", err.message);
        return 12842;
    }
}

export async function fetchIncidentTimeline() {
    if (!supabase) return []; // Fallback to simulated empty array

    try {
        const { data, error } = await supabase
            .from('incidents')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(15);
            
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error("Error fetching logs from Supabase:", err.message);
        return [];
    }
}
