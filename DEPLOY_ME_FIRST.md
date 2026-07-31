# How to put your website online — step by step

Take your time. Do one step, then the next. Nothing here needs you to write code.

---

## Part 1 — Get two free accounts (5 minutes)

You need two free accounts so Axder (the chat bot) can actually work and email you.

1. **Resend** (sends the "someone wants to hire you" email alert)
   - Go to https://resend.com → Sign up (free)
   - Once inside, find **API Keys** → **Create API Key** → copy it somewhere safe (a Notes app). This is your `RESEND_API_KEY`.

2. **Your Anthropic API key** (this is what makes Axder smart)
   - If you already have one from building Axder-the-app, you can reuse it.
   - If not: go to https://console.anthropic.com → API Keys → Create Key → copy it. This is your `ANTHROPIC_API_KEY`.

Keep both of these copied somewhere. You'll paste them into Netlify in Part 3.

---

## Part 2 — Put this project on GitHub

You already have GitHub (`jiggyprince`), so:

1. Go to https://github.com/new
2. Name the repo something like `prince-portfolio`
3. Leave it Public or Private, doesn't matter — click **Create repository**
4. On the next page, GitHub shows you commands. If you're comfortable with terminal, use the "push an existing folder" instructions with this folder. If not, easier way:
   - On the new repo page, click **uploading an existing file**
   - Drag in ALL the files and folders from this project (keep the folder structure — `netlify/functions/chat.js` must stay inside those folders)
   - Commit the upload

---

## Part 3 — Deploy on Netlify

1. Go to https://app.netlify.com → Sign up / log in (use "Sign up with GitHub" — easiest)
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub**, then pick your `prince-portfolio` repo
4. Build settings: leave everything as default (this project doesn't need a build step) → click **Deploy**
5. Wait about a minute. Netlify gives you a live link like `princeesumei.netlify.app` — that's your site!

---

## Part 4 — Turn on Axder (the chat bot) — IMPORTANT

Without this step, the site looks great but the chat won't reply.

1. In Netlify, go to your site → **Site configuration** → **Environment variables**
2. Add these three, one at a time (click **Add a variable** each time):

   | Key | Value |
   |---|---|
   | `ANTHROPIC_API_KEY` | (paste your Anthropic key from Part 1) |
   | `RESEND_API_KEY` | (paste your Resend key from Part 1) |
   | `NOTIFY_EMAIL` | princealexesumei@gmail.com (or whichever email you want alerts sent to) |

3. After adding all three, go to **Deploys** → click **Trigger deploy** → **Deploy site** (this makes the new settings take effect)
4. Open your live site, click the chat bubble bottom-right, and say hello to Axder. It should reply!

---

## Part 5 — Custom domain (optional, later)

If you buy a domain (e.g. `princeesumei.com`), Netlify → **Domain settings** → **Add a domain** walks you through it. Not needed to apply for jobs — the free `.netlify.app` link works perfectly fine on a CV.

---

## If something doesn't work

- **Chat bubble doesn't reply at all:** double-check the three environment variables are spelled EXACTLY right (no extra spaces), then re-deploy (Part 4, step 3).
- **Site looks broken / images missing:** make sure the `assets` folder (with `profile.jpg` inside) was uploaded to GitHub along with everything else.
- Come back and tell Claude exactly what you see, and we'll fix it together.

You've got this. 👊
