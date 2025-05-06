// client/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    // Validación básica
    if (!formData.email || !formData.password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    try {
      // Aquí iría la llamada a tu API de autenticación
      // const response = await axios.post('/api/auth/login', formData);
      console.log('Datos de login:', formData);
      
      // Simulamos un login exitoso
      alert('Inicio de sesión exitoso!');
      navigate('/'); // Redirige al home después del login
      
    } catch (err) {
      setError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
      console.error('Error al iniciar sesión:', err);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Tu cuenta será eliminada :p');
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
          <img src="/logo_invertido.png" alt="RecetApp Logo" className="logo" />
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
        <section className="login-section">
          <h2>Iniciar Sesión</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
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
            <button type="submit" className="btn btn-custom">Ingresar</button>
            <a href="#" onClick={handleForgotPassword} className="d-block text-center mt-3">
              ¿Olvidaste tu contraseña?
            </a>
            <Link to="/registro" className="d-block text-center mt-2">
              ¿No tienes una cuenta? Regístrate
            </Link>
          </form>
        </section>
      </main>

      <button id="btn-scroll-top" onClick={scrollToTop}>&#8679;</button>

      <footer>
        <p>&copy; 2025 RecetApp - Todos los derechos reservados</p>
      </footer>
    </>
  );
};

export default Login;