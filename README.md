# Riri & Haze 💕

A little pixel-art pet game for Riri. Play it at **https://usernamehaze.github.io/formyloveriri/**

## In the game
- **🏠 Home:** tap Home at the bottom to pick a room (outside, living room, kitchen, bedroom, CR, fur babies). Each room has its own actions: feed in the kitchen, sleep in the bedroom, bath in the CR, pet care in the fur babies room.
- **🖼️ Frames:** tap any frame on a wall to choose which photo goes in it (or from 📸 Photos → "put in a frame"). Synced between your phones.
- **🐾 Fur babies room:** Molly & Shiro have their own stats. Feed (bowls), play (ball / yarn), bath, nap, hug, and talk (they repeat you in a squeaky voice).
- **📱 Home screen:** in Safari tap Share → *Add to Home Screen* to get the pixel app icon and open it full screen.
- **🎮 Play:** two games. **🍒 Cherry Dash** is a 3-lane runner (swipe ← → to switch lanes, ↑ jump, ↓ slide), and **💖 Heart Quest** is a platformer where you run, jump and stomp bugs to reach your partner at the end.
- **Poses:** tap them, hug (they walk together and embrace), sleep (they share a bed), bath (bubble tub), and feed (they hold the food).
- **📷 Camera (bottom bar):** snap what you are doing and write a journal entry. Photos live in 💌 → 📸 Photos as a locket and a 📔 journal; you can edit or delete them.
- **💌 Letters:** every letter is an envelope (blue = from Me, pink = from Riri). Tap to open it and have the sender read it out loud. **✍️ write a letter** seals a new one.
- **🐱 Molly (Persian) & 🐶 Shiro (Great Pyrenees):** tap them to pet them. Rename them in `content.js` (`pets:`).

Letters and photos made *inside* the game are saved on that phone. To put one in the game for **both** of you,
add it to `content.js` (below), or send it to the person who updates the repo.

## Adding things for both of you (💌 Love Box)

Everything in the Love Box comes from `content.js`. When you add something, it shows up for her
with a **NEW** badge, a red dot on the 💌 button and an envelope bouncing over the wall photo.

You can do all of this from the GitHub website or app:

### ✉️ A letter
1. Open `content.js` → tap the ✏️ (edit) button.
2. Copy the letter block and paste it at the top of the `letters` list:
   ```js
   {
     date: '2026-11-25',
     from: 'me', to: 'riri',      // or from: 'riri', to: 'me'
     title: 'happy monday',
     body:
   `Hi baby,

   write anything you want here, you can use new lines.`,
   },
   ```
3. **Commit changes.** In the game, "Me" reads it out loud to her, line by line.

### 🎧 A voice message
1. Record a voice memo on your phone (`.m4a` or `.mp3` both work).
2. In the repo, open the `voice` folder → **Add file → Upload files** → upload it (e.g. `good-morning.m4a`).
3. In `content.js`, add to the `voice` list:
   ```js
   { date: '2026-11-25', title: 'good morning baby', src: 'voice/good-morning.m4a' },
   ```

### 📸 A photo (Locket-style)
1. Open the `photos` folder → **Add file → Upload files** → upload it (e.g. `beach.jpg`).
2. In `content.js`, add to the **top** of the `photos` list:
   ```js
   { date: '2026-11-25', caption: 'beach day 🌊', src: 'photos/beach.jpg' },
   ```
The newest photo shows up in the gold frame on the wall. She can tap it to see it full size and scroll through older ones.

Use lowercase file names with no spaces. GitHub Pages updates about a minute after you commit.

## 🔗 Syncing between your phones

With sync on, letters, photos, voice notes and the pets' stats (hunger, love meter…) are shared between your phones.
New things show up on the other phone within a few seconds.
It runs on a free **Cloudflare Worker** plus a **D1** database in your own Cloudflare account. You only set it up once.

### 1. Create the database
1. In the Cloudflare dashboard go to **Storage & Databases → D1 SQL Database → Create**.
2. Name it `riri-sync` → **Create**. (You don't need to make any tables. The Worker does that itself.)

### 2. Create the Worker
1. Go to **Workers & Pages → Create → Create Worker** (start from "Hello World").
2. Name it `riri-sync` → **Deploy**.
3. Click **Edit code**, delete everything, paste the whole contents of [`worker/worker.js`](worker/worker.js), then click **Deploy**.
4. Go back to the Worker → **Settings → Bindings → Add → D1 database**:
   - Variable name: **`DB`** (exactly this)
   - D1 database: **`riri-sync`**
   - **Save / Deploy**
5. Open your Worker's address (shown on its page, like `https://riri-sync.yourname.workers.dev`).
   You should see `{"ok":true,"app":"riri-and-me sync","db":true}`.

### 3. Connect the game to it
Open **`sync-config.js`** in this repo and change the line to your Worker's address, then commit:
```js
window.SYNC_URL = 'https://riri-sync.yourname.workers.dev';
```
(Or just send the address to Claude and it'll do it. The address isn't secret.)

### 4. Pair your phones
1. On your phone, open the game → tap **🔗** next to the title → pick who you are → **✨ new code** → **🔗 connect**.
2. Tap **📤 send code to Riri** and text her the link.
3. She opens the link → it connects automatically → she taps 🔗 and picks **🎀 Riri**.

The green dot on 🔗 means you're synced. Keep the pair code private, because anyone with it can see your stuff.
Letters and photos you made before syncing get moved into the shared box automatically.

> Using the Wrangler CLI instead of the dashboard? `cd worker`, run `npx wrangler d1 create riri-sync`,
> put the printed `database_id` into `wrangler.toml`, then run `npx wrangler deploy`.

> Want the game itself on Cloudflare too? **Workers & Pages → Create → Pages → Connect to Git**, pick this repo
> and the `claude/peaceful-sagan-4dxhbm` branch, with no build command and output folder `/`.
