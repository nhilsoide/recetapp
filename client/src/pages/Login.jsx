// client/src/pages/Login.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/Login.css';
import axios from 'axios';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
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

    if (!formData.email || !formData.password) {
      // toast.error('Por favor, completa todos los campos.', {
      //   position: "top-center",
      //   autoClose: 5000,
      // });
      return;
    }

    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email: formData.email,
          password: formData.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (data.isAdmin) {
        localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        // toast.success('¡Bienvenido Administrador!', {
        //   position: "top-center",
        //   autoClose: 2000,
        //   onClose: () => navigate('/admin') // Redirige al panel de admin
        // });
      }else{
        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
  
          // toast.success('¡Inicio de sesión exitoso!', {
          //   position: "top-center",
          //   autoClose: 2000,
          //   onClose: () => navigate('/')
          // });
        } else {
          // toast.error(data.message, {
          //   position: "top-center",
          //   autoClose: 4000
          // });
        }
      }      

    } catch (err) {
      const errorMsg = err.response?.data?.message ||
        err.response?.data?.error ||
        'Error al conectar con el servidor';

      console.error('Error completo:', err.response?.data || err);

      // toast.error(errorMsg, {
      //   position: "top-center",
      //   autoClose: 5000
      // });
    }
  };


  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      // toast.error('Por favor ingresa tu email', {
      //   position: "top-center",
      //   autoClose: 3000
      // });
      return;
    }

    try {
      const { data } = await axios.post(
        '/api/auth/forgot-password', // URL completa
        { email: formData.email },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Mostrar mensaje según el entorno
      if (process.env.NODE_ENV === 'development' && data.password) {
        // toast.info(
        //   <div>
        //     <p>Para desarrollo: Tu contraseña es</p>
        //     <p><strong>{data.password}</strong></p>
        //     <p><small>En producción esto no sería visible</small></p>
        //   </div>,
        //   {
        //     position: "top-center",
        //     autoClose: 10000,
        //     closeButton: true
        //   }
        // );
      } else {
        // toast.success(
        //   'Si el email existe, se enviaron instrucciones a tu correo',
        //   {
        //     position: "top-center",
        //     autoClose: 5000
        //   }
        // );
      }

    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al procesar la solicitud';
      // toast.error(errorMsg, {
      //   position: "top-center",
      //   autoClose: 5000
      // });
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
      {/* <ToastContainer /> */}
    </>
  );
};

export default Login;