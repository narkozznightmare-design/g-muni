export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const respond = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: {
          ...cors,
          "Content-Type": "application/json"
        }
      });

    if (request.method !== "POST") {
      return respond({ error: "Use POST" }, 405);
    }

    if (!env.DEEPSEEK_API_KEY) {
      return respond({ error: "API key is not configured" }, 500);
    }

    try {
      const body = await request.json();

      const upstream = await fetch(
        "https://api.deepseek.com/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: body.messages
          })
        }
      );

      const result = await upstream.json();
      return respond(result, upstream.status);
    } catch {
      return respond({ error: "Request failed" }, 500);
    }
  }
};
