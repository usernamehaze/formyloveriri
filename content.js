// 💌 LOVE BOX — everything Riri sees in the game comes from this file.
// Newest items show first (sorted by date). Anything new gets a "NEW" badge for her.
//
// To add something: copy one of the { ... } blocks, paste it at the top of its list,
// and change the text. Put photos in the photos/ folder and voice notes in voice/.
// Dates are YYYY-MM-DD.

window.LOVE = {
  letters: [
    {
      date: '2026-11-19',
      title: 'my first letter to you',
      body:
`Hi my love,

I made this little world just for us. Every time you open it, I'm right here holding your hand.

Feed me cherries, give me hugs, and don't forget to put me to sleep when it's late.

You make every day feel like the best day ever. I love you so much.`,
    },
  ],

  voice: [
    // { date: '2026-11-20', title: 'good morning baby', src: 'voice/good-morning.m4a' },
  ],

  photos: [
    { date: '2026-11-19', caption: 'us 🍒👍', src: 'photos/us.jpg' },
  ],
};
