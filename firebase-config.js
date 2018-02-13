var firebase = require("firebase");

// Initialize Firebase
var config = {
  apiKey: "AIzaSyC10qEMDGaWFFApCEFYnnlj0lwtmuzynwY",
  authDomain: "factoriosum.firebaseapp.com",
  databaseURL: "https://factoriosum.firebaseio.com",
  projectId: "factoriosum",
  storageBucket: "factoriosum.appspot.com",
  messagingSenderId: "149214283077"
};

firebase.initializeApp(config);
