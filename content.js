// 💌 LOVE BOX: the letters, voice notes and photos you see in the game come from this file.
// Newest items show first (sorted by date). Anything new gets a "NEW" badge / sealed envelope.
//
// To add something: copy one of the { ... } blocks, paste it at the top of its list,
// and change the text. Put photos in the photos/ folder and voice notes in voice/.
// Dates are YYYY-MM-DD.  from / to are 'me' or 'riri'.

window.LOVE = {
  pets: { cat: 'Molly', dog: 'Shiro' },

  // what you call each other (used in their speech bubbles)
  nicknames: {
    riri: ['pogi', 'my baby', 'my love', 'baby', 'love', 'sweetheart'],   // what Riri calls Me
    me:   ['my baby', 'pretty', 'my love', 'love', 'baby', 'misis ko'],    // what Me calls Riri
  },
  // favourite foods live in index.html (search "FOODS"). Tell Claude if you want to add more.

  letters: [
    {
      date: '2026-11-19',
      from: 'me', to: 'riri',
      title: 'my first letter to you',
      body:
`Hi my love,

I made this little world just for us. Every time you open it, I'm right here holding your hand.

Feed me cherries, give me hugs, and don't forget to put me to sleep when it's late.

You make every day feel like the best day ever. I love you so much.`,
    },
    // { date: '2026-11-20', from: 'riri', to: 'me', title: 'for you', body: `...` },
  ],

  voice: [
    // { date: '2026-11-20', from: 'me', title: 'good morning baby', src: 'voice/good-morning.m4a' },
  ],

  photos: [
    // featured: true = the photo every frame shows unless you pick another one
    { date: '2026-11-19', from: 'me', caption: 'us 🍒👍', src: 'photos/us-together.jpg', featured: true,
      journal: 'our first picture in our little world 💕' },
  ],
};
