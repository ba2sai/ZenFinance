import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBsoGZtYhWFtaY5X6whBxrh4y1WyqMXaio",
  authDomain: "zenfinance-f8a21.firebaseapp.com",
  projectId: "zenfinance-f8a21",
  storageBucket: "zenfinance-f8a21.firebasestorage.app",
  messagingSenderId: "775051813889",
  appId: "1:775051813889:web:067cb5bad1c1e0508fcc00"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seed() {
  try {
    let user;
    console.log("Creating or logging in test user...");
    try {
      const cred = await createUserWithEmailAndPassword(auth, "test@zenfinance.com", "password123");
      user = cred.user;
      console.log("Created user", user.uid);
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        const cred = await signInWithEmailAndPassword(auth, "test@zenfinance.com", "password123");
        user = cred.user;
        console.log("Logged in existing user", user.uid);
      } else {
        throw e;
      }
    }

    const uid = user.uid;

    console.log("Seeding user doc...");
    await setDoc(doc(db, "users", uid), {
      email: "test@zenfinance.com",
      displayName: "Usuario de Prueba",
      onboardingCompleted: true,
      onboardingStep: 3,
      createdAt: serverTimestamp(),
      currency: "USD"
    });

    console.log("Seeding incomes...");
    await addDoc(collection(db, "incomes"), {
      userId: uid,
      amount: 5000,
      description: "Salario Mensual",
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
    });

    console.log("Seeding expenses...");
    await addDoc(collection(db, "expenses"), {
      userId: uid,
      amount: 1500,
      description: "Alquiler",
      category: "housing",
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      needsReview: false,
    });

    await addDoc(collection(db, "expenses"), {
      userId: uid,
      amount: 450,
      description: "Supermercado",
      category: "food",
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      needsReview: false,
    });

    console.log("Seeding saving_goals...");
    await addDoc(collection(db, "saving_goals"), {
      userId: uid,
      name: "Fondo de Emergencia",
      targetAmount: 10000,
      currentAmount: 2500,
      targetDate: "2026-12-31",
      createdAt: serverTimestamp(),
    });

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
}
seed();
