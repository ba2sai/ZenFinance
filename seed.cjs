const { initializeApp, applicationDefault } = require('./functions/node_modules/firebase-admin/app');
const { getAuth } = require('./functions/node_modules/firebase-admin/auth');
const { getFirestore, FieldValue } = require('./functions/node_modules/firebase-admin/firestore');

initializeApp({ 
  projectId: 'zenfinance-f8a21',
  credential: applicationDefault() // Tries to use ADC
});

async function seed() {
  try {
    console.log('Creating test user...');
    let uid;
    try {
      const userRecord = await getAuth().createUser({
        email: 'test@zenfinance.com',
        password: 'password123',
        displayName: 'Usuario de Prueba',
      });
      uid = userRecord.uid;
      console.log('Successfully created new user:', uid);
    } catch (e) {
      if (e.code === 'auth/email-already-exists') {
        const userRecord = await getAuth().getUserByEmail('test@zenfinance.com');
        uid = userRecord.uid;
        console.log('User already exists, using uid:', uid);
      } else {
        throw e;
      }
    }

    const db = getFirestore();
    
    console.log('Seeding user profile...');
    await db.collection('users').doc(uid).set({
      email: 'test@zenfinance.com',
      displayName: 'Usuario de Prueba',
      onboardingCompleted: true,
      onboardingStep: 3,
      createdAt: FieldValue.serverTimestamp(),
      currency: 'USD'
    });

    console.log('Seeding incomes...');
    await db.collection('incomes').add({
      userId: uid,
      amount: 5000,
      description: 'Salario Mensual',
      date: new Date().toISOString().split('T')[0],
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log('Seeding expenses...');
    await db.collection('expenses').add({
      userId: uid,
      amount: 1500,
      description: 'Alquiler',
      category: 'housing',
      date: new Date().toISOString().split('T')[0],
      createdAt: FieldValue.serverTimestamp(),
      needsReview: false,
    });
    
    await db.collection('expenses').add({
      userId: uid,
      amount: 450,
      description: 'Supermercado',
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      createdAt: FieldValue.serverTimestamp(),
      needsReview: false,
    });

    console.log('Seeding saving goals...');
    await db.collection('saving_goals').add({
      userId: uid,
      name: 'Fondo de Emergencia',
      targetAmount: 10000,
      currentAmount: 2500,
      targetDate: '2026-12-31',
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}
seed();
