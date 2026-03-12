const { initializeApp } = require('./functions/node_modules/firebase-admin/app');
const { getAuth } = require('./functions/node_modules/firebase-admin/auth');
const { getFirestore } = require('./functions/node_modules/firebase-admin/firestore');

initializeApp({ projectId: 'zenfinance-f8a21' });

async function test() {
  try {
    const db = getFirestore();
    const snap = await db.collection('users').limit(1).get();
    console.log('Success, can read firestore. Docs:', snap.size);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
