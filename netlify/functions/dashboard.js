// ════════════════════════════════════════════════════════════════════════════
//  DASHBOARD API — private. Returns the conversations Axder has had.
//  Protected by DASHBOARD_PASSWORD (Netlify env var). The password is checked
//  here on the server; it is never present in the page's source.
// ════════════════════════════════════════════════════════════════════════════

const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Bad request" }) };
  }

  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) {
    return { statusCode: 500, body: JSON.stringify({ error: "Dashboard password not configured." }) };
  }
  if (!body.password || body.password !== expected) {
    // Deliberately vague, and slightly delayed, to discourage guessing.
    await new Promise((r) => setTimeout(r, 700));
    return { statusCode: 401, body: JSON.stringify({ error: "Incorrect password" }) };
  }

  try {
    const convos = getStore("axder_conversations");
    const visitors = getStore("axder_visitors");

    const { blobs } = await convos.list();
    const items = [];
    for (const b of blobs.slice(0, 200)) {
      try {
        const convo = await convos.get(b.key, { type: "json" });
        if (!convo) continue;
        let meta = null;
        try {
          meta = await visitors.get(b.key, { type: "json" });
        } catch (e) {
          meta = null;
        }
        items.push({
          id: b.key,
          updated: convo.updated || 0,
          serious: !!convo.serious,
          blocked: !!(meta && meta.blocked),
          turns: (meta && meta.turns) || (convo.messages ? convo.messages.length : 0),
          messages: convo.messages || []
        });
      } catch (e) {
        // Skip any single unreadable record rather than failing the whole page.
      }
    }

    items.sort((a, b) => (b.updated || 0) - (a.updated || 0));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        count: items.length,
        conversations: items
      })
    };
  } catch (e) {
    console.error("Dashboard read failed:", e);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: 0, conversations: [], note: "No conversations stored yet." })
    };
  }
};
