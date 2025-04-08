import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';


function App() {
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/mensaje')
      .then((res) => {
        setMensaje(res.data.mensaje);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <h1>Mi Aplicación React + Node.js</h1>
      <p>Mensaje del backend: {mensaje}</p>
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
    </div>
    
  );
}

export default App;