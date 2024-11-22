//client/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import SessionScreen from './components/SessionScreen';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/session" element={<SessionScreen />} />
      </Routes>
    </div>
  );
};

export default App;
