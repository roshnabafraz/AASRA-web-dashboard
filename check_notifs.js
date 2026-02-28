import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyD3rgGLSLgX6UUSNNYFwmgXa-fmZHiqe98",
    authDomain: "aasra-fyp.firebaseapp.com",
    projectId: "aasra-fyp",
    storageBucket: "aasra-fyp.firebasestorage.app",
    messagingSenderId: "1048876079888",
    appId: "1:1048876079888:web:379f0e438ab58a0cb7e395"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDocs() {
    const snap = await getDocs(collection(db, 'notifications'));
    const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const sosNotif = notifs.find(n => !n.type);
    const webNotif = notifs.find(n => n.type === 'broadcast');

    console.log("=== SOS NOTIFICATION (FROM ANDROID) ===");
    console.log(sosNotif);

    console.log("=== WEB NOTIFICATION (FROM DASHBOARD) ===");
    console.log(webNotif);
}

checkDocs();
