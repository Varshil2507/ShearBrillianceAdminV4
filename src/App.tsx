import React, { useEffect } from 'react';
import { Navigate, useNavigate } from "react-router-dom";

//import Scss
import './assets/scss/themes.scss';

//imoprt Route
import Route from './Routes';

// Import Firebase Configuration file
// import { initFirebaseBackend } from "./helpers/firebase_helper";

// Fake Backend 
import fakeBackend from "./helpers/AuthType/fakeBackend";

// Activating fake backend
fakeBackend();

// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_APIKEY,
//   authDomain: process.env.REACT_APP_AUTHDOMAIN,
//   databaseURL: process.env.REACT_APP_DATABASEURL,
//   projectId: process.env.REACT_APP_PROJECTID,
//   storageBucket: process.env.REACT_APP_STORAGEBUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
//   appId: process.env.REACT_APP_APPID,
//   measurementId: process.env.REACT_APP_MEASUREMENTID,
// };

// // init firebase backend
// initFirebaseBackend(firebaseConfig);

function App() {
  const navigate = useNavigate(); // Initialize useNavigate hook for navigation
  useEffect(() => {
    // Check if this is the first app load
    const isInitialLoad = !sessionStorage.getItem('appStarted');

    if (isInitialLoad) {
      // Perform any cleanup or actions here
      localStorage.clear();
      sessionStorage.clear();
      
      // Set a flag to mark the app as started
      sessionStorage.setItem('appStarted', 'true');
      // navigate("/login");
      //  return <Navigate to="/login" />;
    } 
  }, [navigate]); // Runs once on component mount

  return (
    <React.Fragment>
      <Route />
    </React.Fragment>
  );
}

export default App;
