// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAR2EDRnAzOc_nRrwD1kcUX68aOHLTNgMc",
  authDomain: "go-outside-b7486.firebaseapp.com",
  projectId: "go-outside-b7486",
  storageBucket: "go-outside-b7486.firebasestorage.app",
  messagingSenderId: "458485076262",
  appId: "1:458485076262:web:2ee5cd31cc0ed680a9f1e7",
  measurementId: "G-8T3149KV8C"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = firebase.firestore();

// Initialize Storage
const storage = firebase.storage(); 