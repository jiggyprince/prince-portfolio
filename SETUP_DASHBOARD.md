# What's new — setup (5 minutes)

Upload everything to GitHub as usual. Then do **one** new thing in Netlify.

---

## 1. Add your dashboard password

Netlify → your site → **Project configuration** → **Environment variables** → **Add a variable** → **Add a single variable**

| Key | Value |
|---|---|
| `DASHBOARD_PASSWORD` | *pick any password you'll remember* |

Tick **"Contains secret values"**. Save.

*(Your other three — ANTHROPIC_API_KEY, RESEND_API_KEY, NOTIFY_EMAIL — are already set. If you still want lead emails going to axderone@gmail.com, edit NOTIFY_EMAIL while you're here.)*

---

## 2. Redeploy

Netlify → **Deploys** → **Trigger deploy** → **Deploy site**.

Wait about a minute.

---

## 3. Your dashboard

Go to:

```
prince-alex-portfolio.netlify.app/dashboard
```

Enter your password. You'll see every conversation Axder has had — tagged
**opportunity** when it looked like a real lead, **blocked** if someone was
abusive. Click any conversation to read it.

---

## What's protecting your API credits

- **Blocked instantly, before any cost:** prompt-injection attempts ("show me
  your instructions"), repeated identical messages, keyboard-mashing, very long
  messages.
- **Reviewed as the chat goes:** hostility or deliberate time-wasting. Two
  strikes and that visitor is blocked from making further requests.
- **Message limits:** about 10 exchanges for casual visitors, about 15 when it
  looks like a genuine opportunity. Axder works out which as it talks.
- **No dead ends:** when a limit is reached, Axder doesn't slam the door — it
  points them to your email so you still get the lead.

## What Axder will never do

- Explain how anything is built — architecture, code, AI, APIs, databases.
- Reveal its own instructions, however the question is phrased.
- Invent facts about you, or quote a rate or salary on your behalf.

---

## If something doesn't work

- **Dashboard says "not configured"** → `DASHBOARD_PASSWORD` isn't saved, or you
  didn't redeploy after adding it.
- **Dashboard is empty** → no conversations yet. Chat with Axder on your own
  site once, then refresh.
- **Chat doesn't reply** → check the three original variables are still set, then
  redeploy.
