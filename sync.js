// 🔗 Sync between your phones (Firebase Firestore).
// Everything lives under rooms/<your secret pair code>/ so only phones with the code can see it.
const V = '10.12.2';
const cfg = window.FIREBASE_CONFIG;
const S = window.Sync = { configured: !!(cfg && cfg.apiKey), status: 'off', error: '', room: null, add: null, saveState: null, connect: null, disconnect: null };
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const setStatus = (st, err = '') => { S.status = st; S.error = err; emit('sync:status', { status: st, error: err }); };

if (!S.configured){
  setStatus('unconfigured');
} else {
  let fb = null;
  const load = async () => {
    if (fb) return fb;
    const [app, auth, fs] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`),
    ]);
    const a = app.initializeApp(cfg);
    fb = { auth: auth.getAuth(a), db: fs.getFirestore(a), authMod: auth, fs };
    return fb;
  };
  let unsubs = [];
  const KINDS = { letters: 300, photos: 80, voice: 100 };

  S.connect = async room => {
    room = String(room || '').trim();
    if (room.length < 16) throw new Error('pair code is too short');
    S.disconnect(true);
    setStatus('connecting');
    try {
      const { auth, db, authMod, fs } = await load();
      if (!auth.currentUser) await authMod.signInAnonymously(auth);
      S.room = room;
      try { localStorage.setItem('riri-room', room); } catch(e){}
      const base = ['rooms', room];
      Object.entries(KINDS).forEach(([kind, max]) => {
        const q = fs.query(fs.collection(db, ...base, kind), fs.orderBy('ts', 'desc'), fs.limit(max));
        let first = true;
        unsubs.push(fs.onSnapshot(q, snap => {
          const items = snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
          const added = first ? [] : snap.docChanges().filter(c => c.type === 'added' && !c.doc.metadata.hasPendingWrites).map(c => Object.assign({ id: c.doc.id }, c.doc.data()));
          first = false;
          emit('sync:items', { kind, items, added });
          if (S.status !== 'on') setStatus('on');
        }, err => setStatus('error', err.code === 'permission-denied' ? 'permission denied: check the Firestore rules & anonymous sign-in' : err.message)));
      });
      unsubs.push(fs.onSnapshot(fs.doc(db, ...base, 'meta', 'state'), d => { if (d.metadata.hasPendingWrites) return; emit('sync:state', d.exists() ? d.data() : null); }, () => {}));
      S.add = (kind, item) => {
        const id = item.id || (kind[0] + Date.now().toString(36) + Math.random().toString(36).slice(2, 7));
        const data = Object.assign({}, item); delete data.id; delete data.local;
        return fs.setDoc(fs.doc(db, ...base, kind, id), data);
      };
      S.saveState = state => fs.setDoc(fs.doc(db, ...base, 'meta', 'state'), state);
    } catch(e){
      setStatus('error', e.code === 'auth/admin-restricted-operation' || e.code === 'auth/operation-not-allowed' ? 'turn on Anonymous sign-in in Firebase Authentication' : (e.message || String(e)));
    }
  };
  S.disconnect = keepStatus => {
    unsubs.forEach(u => u()); unsubs = [];
    S.add = null; S.saveState = null;
    if (!keepStatus){ S.room = null; try { localStorage.removeItem('riri-room'); } catch(e){} setStatus('off'); }
  };

  let saved = null;
  try { saved = localStorage.getItem('riri-room'); } catch(e){}
  const join = (location.hash.match(/join=([\w-]{16,})/) || [])[1];
  if (join){ saved = join; history.replaceState(null, '', location.pathname + location.search); }
  if (saved) S.connect(saved); else setStatus('off');
}
emit('sync:ready', {});
