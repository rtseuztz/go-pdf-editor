const firebaseConfig = {
  apiKey: "AIzaSyCdiRhDKUbJJxm-UZyC6DKtvHVt98mQT2w",
  authDomain: "go-pdf-editor.firebaseapp.com",
  projectId: "go-pdf-editor",
  storageBucket: "go-pdf-editor.appspot.com",
  messagingSenderId: "614738654470",
  appId: "1:614738654470:web:621f085dd8441faaab9a87",
  measurementId: "G-S8HCVQGJP1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

firebase.auth().signInAnonymously()
  .then(() => {
    // Signed in..
    console.log("signed in");
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
  });
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      var uid = user.uid;
      console.log(`user is ${uid}`)
      // ...
    } else {
        console.log("signed out")
      // User is signed out
      // ...
    }
  });
  