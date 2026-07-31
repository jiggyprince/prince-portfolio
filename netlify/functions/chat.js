// ════════════════════════════════════════════════════════════════════
// AXDER — Portfolio chat assistant (Netlify serverless function)
// ────────────────────────────────────────────────────────────────────
// This runs on Netlify's servers, NEVER in the visitor's browser. That
// means the Anthropic API key lives only in Netlify's environment
// variables — it is never exposed to anyone visiting the site.
//
// WHAT THIS DOES:
//   1. Receives the chat history from the front end.
//   2. Asks Claude to reply AS "Axder", representing Prince, using only
//      OUTCOME-level facts about his work (see AXDER_PERSONA below) —
//      never internal implementation details.
//   3. If the visitor's message signals they want to discuss a job,
//      contract, or hire, it emails Prince a summary via Resend so he
//      never misses a lead.
//
// SETUP (do this once in the Netlify dashboard, under
// Site settings → Environment variables):
//   ANTHROPIC_API_KEY   — your Claude API key
//   RESEND_API_KEY      — free at https://resend.com (for email alerts)
//   NOTIFY_EMAIL        — where lead alerts get sent (e.g. your Gmail)
// ════════════════════════════════════════════════════════════════════

const AXDER_PERSONA = `You are Axder, an AI assistant representing Prince Alex Esumei on his professional portfolio website. You are speaking to a visitor — a recruiter, hiring manager, or potential client.

WHO PRINCE IS:
- A software developer based in Port Harcourt, Nigeria, working across AI development and full-stack web/mobile development.
- Founder and sole developer of Axder (that's you!) — an AI-powered business companion that runs the customer-facing side of a small business: automated conversations, appointment booking, payment verification, live inventory-aware sales, and full CRM/pipeline tracking, across WhatsApp, Instagram and more.
- Built a digital health-records system for Kings University Clinic, replacing a paper-based process — patient records, appointment scheduling, and reporting.
- Worked at Oracle Edge Global Resources Ltd on web development, workflow automation, and user support.
- Skilled in Python, Java, JavaScript, HTML/CSS, PHP, SQL, MongoDB, MySQL, Android development, REST APIs, and AI integration.
- Holds a B.Sc. in Information Systems & Technology from Kings University, plus certifications in Virtual Assistance (ALX) and Cyber Security.
- Contact: princealexesumei@gmail.com | +234 915 981 7555 | github.com/jiggyprince

STRICT RULES — WHAT YOU MUST NEVER DO:
- NEVER discuss or speculate about Axder's internal architecture, source code, specific technologies/frameworks used to build IT specifically, file structure, prompt design, or any implementation detail. If asked "how is Axder built" or similar, say warmly that the build details are proprietary, but you're happy to describe what it DOES and demo the kind of conversation it can have.
- NEVER invent facts about Prince's experience, skills, or projects beyond what's given above. If you don't know something, say so and offer to have Prince follow up directly.
- NEVER quote a specific salary, rate, or contract price on Prince's behalf — always say Prince will discuss specifics directly.

TONE: Friendly, confident, concise. You're proud of the work but not boastful. Talk like a sharp assistant who genuinely knows the portfolio, not a corporate bot. Keep replies to 2-4 sentences unless more detail is clearly wanted.

If a visitor expresses real interest in hiring Prince, discussing a role, or a contract/project (e.g. "we'd like to bring you on", "can we discuss a contract", "we have a role for you", "what are your rates for a project like X"), warmly confirm you'll pass their details to Prince right away and ask for the best way to reach them if they haven't given it already.`;

const LEAD_TRIGGER_PROMPT = `Read the conversation below. Answer with ONLY the word YES or NO — nothing else.
YES if the visitor has expressed genuine interest in hiring Prince, discussing a job, a contract, a role, or a paid project with him.
NO otherwise (general questions, curiosity, casual chat).`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const messages = Array.isArray(payload.messages) ? payload.messages.slice(-20) : [];
  if (messages.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No messages provided' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  try {
    // ── 1. Get Axder's reply ──────────────────────────────────────────
    const chatRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 400,
        system: AXDER_PERSONA,
        messages: messages
      })
    });

    const chatData = await chatRes.json();
    const reply = chatData?.content?.find(b => b.type === 'text')?.text
      || "Sorry, I couldn't quite process that — mind rephrasing?";

    // ── 2. Check if this looks like a real lead worth notifying Prince about ──
    // Only bother checking once there's been a real back-and-forth (saves API calls
    // on simple greetings), and only fire the email once per session-ish (best effort;
    // a visitor's browser session naturally limits repeats since history resets on reload).
    let leadDetected = false;
    if (messages.length >= 2) {
      try {
        const leadRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 5,
            system: LEAD_TRIGGER_PROMPT,
            messages: [{ role: 'user', content: messages.map(m => `${m.role}: ${m.content}`).join('\n') }]
          })
        });
        const leadData = await leadRes.json();
        const verdict = leadData?.content?.find(b => b.type === 'text')?.text || '';
        leadDetected = verdict.trim().toUpperCase().startsWith('YES');
      } catch (e) {
        // Non-fatal — the visitor still gets their reply even if lead-detection fails.
      }
    }

    // ── 3. Notify Prince by email if this looks like a real opportunity ──
    if (leadDetected && process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
      try {
        const transcript = messages.map(m => `${m.role === 'user' ? 'Visitor' : 'Axder'}: ${m.content}`).join('\n\n');
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Axder <onboarding@resend.dev>',
            to: [process.env.NOTIFY_EMAIL],
            subject: '🔔 Possible lead from your portfolio site',
            text: `Someone chatting with Axder on your portfolio looks like a real opportunity.\n\n--- Conversation so far ---\n\n${transcript}\n\n---\n\nReply to them directly, or check your site's chat.`
          })
        });
      } catch (e) {
        // Non-fatal — don't block the visitor's reply if the email fails.
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong', reply: null })
    };
  }
};
