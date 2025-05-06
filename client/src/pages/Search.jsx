// client/src/pages/Buscar.jsx
import React, { useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/Search.css'; // Crearemos este archivo para los estilos

const Buscar = () => {
  const [recetaMostrada, setRecetaMostrada] = useState(null);
  const [filtros, setFiltros] = useState({
    tipoComida: '',
    tiempoPreparacion: '',
    dificultad: ''
  });

  //redirecciones
//   const navigate = useNavigate();

  // Datos de las recetas (podrían venir de una API)
  const recetas = {
    "Tarta de Manzana": {
      imagen: "/img/tarta-de-manzana.jpg",
      descripcion: "Una deliciosa tarta de manzana con un toque de canela y una base crujiente.",
      ingredientes: ["4 manzanas", "200g de harina", "100g de mantequilla", "100g de azúcar", "1 cucharadita de canela"],
      instrucciones: [
        "Precalienta el horno a 180°C.",
        "Pela y corta las manzanas en rodajas.",
        "Mezcla la harina, la mantequilla y el azúcar hasta obtener una masa homogénea.",
        "Coloca la masa en un molde y añade las rodajas de manzana encima.",
        "Espolvorea canela y hornea durante 30 minutos."
      ]
    },
    "Pasta al Pesto": {
      imagen: "/img/pasta.jpg",
      descripcion: "Receta tradicional italiana con albahaca fresca y queso parmesano.",
      ingredientes: ["300g de pasta", "50g de albahaca fresca", "50g de piñones", "50g de queso parmesano", "Aceite de oliva"],
      instrucciones: [
        "Cocina la pasta según las instrucciones del paquete.",
        "En un procesador, mezcla la albahaca, los piñones y el queso parmesano.",
        "Añade aceite de oliva hasta obtener una salsa homogénea.",
        "Mezcla la pasta con la salsa y sirve."
      ]
    }
  };

  const mostrarReceta = (nombreReceta) => {
    setRecetaMostrada({
      nombre: nombreReceta,
      ...recetas[nombreReceta]
    });
  };

  const mostrarRecetaAleatoria = () => {
    const recetasDisponibles = Object.keys(recetas);
    const recetaAleatoria = recetasDisponibles[Math.floor(Math.random() * recetasDisponibles.length)];
    mostrarReceta(recetaAleatoria);
  };

  const handleFiltrosChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitFiltros = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para filtrar recetas
    console.log("Filtros aplicados:", filtros);
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
                <li className="nav-item"><a className="nav-link" href="/">Inicio</a></li>
                <li className="nav-item"><a className="nav-link" href="/buscar">Buscar Recetas</a></li>
                <li className="nav-item"><a className="nav-link" href="/perfil">Perfil</a></li>
              </ul>
            </div>
            <a href="/login" className="btn btn-custom">Iniciar Sesión</a>
          </div>
        </nav>
      </header>

      <main className="container mt-5">
        {/* Formulario de búsqueda */}
        <section className="p-5 bg-light rounded shadow">
          <h2>Buscar Recetas</h2>
          <p className="lead">Ingresa los ingredientes que tienes y encuentra recetas ideales para ti.</p>
          <form className="search-form d-flex">
            <input type="text" className="form-control me-2" placeholder="Ingresa ingredientes" />
            <button type="submit" className="btn btn-custom">Buscar</button>
          </form>

          {/* Sugerencias de ingredientes */}
          <div className="ingredientes-sugeridos mt-4">
            {["Manzana", "Albahaca", "Harina", "Quinoa"].map((ingrediente) => (
              <span 
                key={ingrediente} 
                className="badge" 
                onClick={() => mostrarReceta(ingrediente === "Manzana" ? "Tarta de Manzana" : "Pasta al Pesto")}
              >
                {ingrediente}
              </span>
            ))}
          </div>

          {/* Botón de receta aleatoria */}
          <div className="mt-4">
            <button className="btn btn-custom" onClick={mostrarRecetaAleatoria}>
              Obtener una receta aleatoria
            </button>
          </div>
        </section>

        {/* Receta encontrada */}
        {recetaMostrada && (
          <section className="receta-encontrada mt-4">
            <h3>{recetaMostrada.nombre}</h3>
            <img src={recetaMostrada.imagen} alt={recetaMostrada.nombre} />
            <p>{recetaMostrada.descripcion}</p>
            <p><strong>Ingredientes:</strong></p>
            <ul>
              {recetaMostrada.ingredientes.map((ingrediente, index) => (
                <li key={index}>{ingrediente}</li>
              ))}
            </ul>
            <p><strong>Instrucciones:</strong></p>
            <ol>
              {recetaMostrada.instrucciones.map((instruccion, index) => (
                <li key={index}>{instruccion}</li>
              ))}
            </ol>
            <button className="btn btn-custom" onClick={() => alert("Receta añadida a favoritos")}>
              ♥ Añadir a Favoritos
            </button>
          </section>
        )}

        {/* Búsqueda avanzada */}
        <section className="p-5 bg-light rounded shadow mt-4">
          <h2>Búsqueda Avanzada</h2>
          <form onSubmit={handleSubmitFiltros}>
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="tipo-comida" className="form-label">Tipo de comida</label>
                <select 
                  className="form-select" 
                  id="tipo-comida"
                  name="tipoComida"
                  value={filtros.tipoComida}
                  onChange={handleFiltrosChange}
                >
                  <option value="">Cualquier tipo</option>
                  <option value="italiana">Italiana</option>
                  <option value="mexicana">Mexicana</option>
                  <option value="asiatica">Asiática</option>
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="tiempo-preparacion" className="form-label">Tiempo de preparación</label>
                <select 
                  className="form-select" 
                  id="tiempo-preparacion"
                  name="tiempoPreparacion"
                  value={filtros.tiempoPreparacion}
                  onChange={handleFiltrosChange}
                >
                  <option value="">Cualquier tiempo</option>
                  <option value="15">Menos de 15 minutos</option>
                  <option value="30">Menos de 30 minutos</option>
                  <option value="60">Menos de 1 hora</option>
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="dificultad" className="form-label">Dificultad</label>
                <select 
                  className="form-select" 
                  id="dificultad"
                  name="dificultad"
                  value={filtros.dificultad}
                  onChange={handleFiltrosChange}
                >
                  <option value="">Cualquier dificultad</option>
                  <option value="facil">Fácil</option>
                  <option value="media">Media</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-custom">Filtrar</button>
            </div>
          </form>
        </section>
      </main>

      <button id="btn-scroll-top" onClick={scrollToTop}>↑</button>

      <footer>
        <p>&copy; 2025 RecetApp - Todos los derechos reservados</p>
      </footer>
    </>
  );
};

export default Buscar;