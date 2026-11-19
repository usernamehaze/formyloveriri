# Riri & Me 💕

A little pixel-art pet game for Riri. Play it at **https://usernamehaze.github.io/formyloveriri/**

## In the game
- **📷 Camera (top right):** snap what you're doing. It goes on the polaroid on the wall, like Locket. Tap **send** to text it to your person.
- **💌 Letters:** every letter is an envelope (blue = from Me, pink = from Riri). Tap to open it and have the sender read it out loud. **✍️ write a letter** seals a new one.
- **🐱 Mochi & 🐶 Sunny:** tap them to pet them. Rename them in `content.js` (`pets:`).

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
