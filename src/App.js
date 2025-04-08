import React, { useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Profile from './pages/Profile';

function App() {
  
  useEffect(() => {
    axios.get('http://localhost:5000/api/mensaje')
      .then((res) => {        
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/perfil" element={<Profile />} />
        </Routes>
      </Router>
    </div>

  );
}

export default App;