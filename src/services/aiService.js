// Using HuggingFace Router for chat completions
const API_TOKEN = import.meta.env.VITE_AI_TOKEN;

export const chatWithAI = async (userMessage, dashboardData) => {
  if (!API_TOKEN) {
    return "AI not connected. Please add VITE_AI_TOKEN to your .env file and restart the dev server.";
  }

  const systemPrompt = `You are AstroNews Assistant. Only answer using this data:
ISS Latitude: ${dashboardData.iss.latitude}
ISS Longitude: ${dashboardData.iss.longitude}
ISS Speed: ${dashboardData.iss.speed.toFixed(2)} km/h
ISS Location: ${dashboardData.iss.nearestPlace}
People in Space: ${dashboardData.astronauts.count}
Crew: ${dashboardData.astronauts.people.map(p => `${p.name} (${p.craft})`).join(', ')}
News Headlines: ${dashboardData.news.slice(0, 5).map(a => a.title).join(' | ')}
Do NOT use outside knowledge.`;

  try {
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userMessage
            }
          ],
          max_tokens: 300,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 503) {
        return "The AI model is warming up. Please wait 20 seconds and try again.";
      }
      if (response.status === 401) {
        return "Invalid Hugging Face token. Please check VITE_AI_TOKEN in your .env file.";
      }
      const errData = await response.json().catch(() => ({}));
      return `AI Error (${response.status}): ${errData.error || 'Unknown error'}`;
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Chat Error:', error);
    return `Error: ${error.message}`;
  }
};
