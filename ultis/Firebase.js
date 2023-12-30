const { initializeApp } = require('firebase/app');
const { getStorage, ref, deleteObject  } = require('firebase/storage');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDM8OQFO6rrCVUmZHqXWMpXj2Cp37D5NZo",
  authDomain: "rythm-party.firebaseapp.com",
  projectId: "rythm-party",
  storageBucket: "rythm-party.appspot.com",
  messagingSenderId: "613991631137",
  appId: "1:613991631137:web:72d345c9a14141f9891660",
  measurementId: "G-T9MN1K6GE8"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseStorage = getStorage(firebaseApp);
const deletefile = async(filePath, fileType, id) =>{
    const path = `${filePath}/${id}.${fileType}`;
    const objectRef = ref(firebaseStorage, path);
    return await deleteObject(objectRef);} 
module.exports = {firebaseApp, firebaseStorage, deletefile};