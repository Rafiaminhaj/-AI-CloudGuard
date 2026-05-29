async function getLocalSimulationResponse(prompt) {
  try {
    const res = await fetch('https://ai-cloudguard.onrender.com/rag-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: prompt })
    });
    if (res.ok) {
      const data = await res.json();
      return data.response;
    }
  } catch (e) {
    console.warn("RAG Backend is offline, using hardcoded fallback.");
  }

  const p = prompt.toLowerCase();
  if (p.includes("hello") || p.includes("hi") || p.includes("hii")) {
    return "Hello! I am connected via the local failover engine. How can I assist with your CloudGuard SOC today?";
  }
  return "I am currently running in Local Simulation Mode. Try asking me about 'DDoS', 'Bot Swarms', or 'Memory Exploits'.";
}

export async function askHuggingFace(prompt, token) {
  const cleanToken = token ? token.trim() : '';
  
  if (cleanToken && !cleanToken.startsWith("hf_")) {
    return "AI Error: Your token is invalid. Hugging Face tokens must start with 'hf_'. Please make sure you didn't accidentally paste your Supabase key here.";
  }

  // If no token is provided, jump straight to the Local Simulation Engine
  if (!cleanToken) {
    return getLocalSimulationResponse(prompt);
  }

  const model = "HuggingFaceH4/zephyr-7b-beta";
  
  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: `[INST] You are an elite AI Cybersecurity Assistant integrated into the AI CloudGuard platform. Answer the following concisely and professionally: ${prompt} [/INST]`,
        parameters: { max_new_tokens: 150, temperature: 0.7 }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.error && errorData.error.includes("loading")) {
        return `AI Model is currently booting up (Estimated time: ${Math.round(errorData.estimated_time || 20)}s). Please wait a moment and try again.`;
      }
      throw new Error(errorData.error || `HTTP ${response.status} from Hugging Face`);
    }

    const result = await response.json();
    let text = result[0]?.generated_text || "";
    
    if (text.includes("[/INST]")) {
      text = text.split("[/INST]")[1].trim();
    }
    
    return text;
  } catch (err) {
    console.warn("Hugging Face Blocked or Failed. Falling back to Local AI Engine.");
    return getLocalSimulationResponse(prompt);
  }
}
