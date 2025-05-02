// client/src/pages/Registro.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/Register.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Registro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.nombre || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Por favor, completa todos los campos.', {
        position: "top-center",
        autoClose: 5000,
      });
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden.', {
        position: "top-center",
        autoClose: 5000,
      });
      return;
    }
  
    try {
      const { data } = await axios.post(' http://localhost:5000/api/auth/register', {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password
      });
  
      localStorage.setItem('token', data.token);
      
      toast.success('¡Registro exitoso! Redirigiendo...', {
        position: "top-center",
        autoClose: 2000,
        onClose: () => navigate('/login')
      });
      
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error al registrar el usuario', {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

 

  // Efecto para el botón de scroll
  useEffect(() => {
    const handleScroll = () => {
      const btn = document.getElementById("btn-scroll-top");
      if (btn) {
        btn.style.display = (document.documentElement.scrollTop > 100) ? "block" : "none";
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header>
        <div className="logo-container d-flex justify-content-start align-items-center py-3">
          <img src="img/logo_invertido.png" alt="RecetApp Logo" className="logo" />
        </div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav mx-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Inicio</Link>
                </li>
              </ul>
            </div>
            <Link to="/login" className="btn btn-custom">Iniciar Sesión</Link>
          </div>
        </nav>
      </header>

      <main className="container mt-5">
        <section className="register-section">
          <h2>Registro</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              name="nombre"
              placeholder="Nombre completo" 
              value={formData.nombre}
              onChange={handleChange}
              required 
            />
            <input 
              type="email" 
              name="email"
              placeholder="Correo electrónico" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
            <input 
              type="password" 
              name="password"
              placeholder="Contraseña" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
            <input 
              type="password" 
              name="confirmPassword"
              placeholder="Confirmar contraseña" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
            <button type="submit" className="btn btn-custom">Registrarse</button>
            <Link to="/login" className="d-block text-center mt-3">
              ¿Ya tienes una cuenta? Inicia Sesión
            </Link>
          </form>
        </section>
      </main>

      <button id="btn-scroll-top" onClick={scrollToTop}>&#8679;</button>

      <footer>
        <p>&copy; 2025 RecetApp - Todos los derechos reservados</p>
      </footer>
      <ToastContainer />
    </>
  );
};

export default Registro;