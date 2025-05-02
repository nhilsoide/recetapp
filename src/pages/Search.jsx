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
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('postres');
  const [activeIndex, setActiveIndex] = useState(0); // Para controlar el carrusel  

  //redirecciones

  // Datos de las recetas (podrían venir de una API)
  const recetas = {
    // Postres
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
      ],
      categoria: "postres",
      tiempo: "45 min",
      dificultad: "media"
    },
    "Cheesecake de Frutos Rojos": {
      imagen: "/img/cheesecake.jpg",
      descripcion: "Suave cheesecake con una base de galleta y topping de frutos rojos.",
      ingredientes: ["200g galletas digestivas", "100g mantequilla", "500g queso crema", "200ml nata", "150g azúcar", "200g frutos rojos"],
      instrucciones: [
        "Tritura las galletas y mézclalas con la mantequilla derretida.",
        "Prepara el relleno batiendo el queso crema con la nata y el azúcar.",
        "Vierte sobre la base de galletas y refrigera 4 horas.",
        "Decora con frutos rojos antes de servir."
      ],
      categoria: "postres",
      tiempo: "30 min",
      dificultad: "facil"
    },
    "Flan de Vainilla": {
      imagen: "/img/flan.jpg",
      descripcion: "Clásico flan casero con caramelo líquido.",
      ingredientes: ["5 huevos", "500ml leche", "150g azúcar", "1 vaina de vainilla", "100g azúcar para caramelo"],
      instrucciones: [
        "Prepara caramelo derritiendo azúcar y viértelo en el molde.",
        "Bate los huevos con el azúcar y la leche infusionada con vainilla.",
        "Vierte en el molde y cocina a baño María 45 minutos.",
        "Enfría y desmolda con cuidado."
      ],
      categoria: "postres",
      tiempo: "60 min",
      dificultad: "media"
    },

    // Platos principales
    "Pasta al Pesto": {
      imagen: "/img/pasta.jpg",
      descripcion: "Receta tradicional italiana con albahaca fresca y queso parmesano.",
      ingredientes: ["300g de pasta", "50g de albahaca fresca", "50g de piñones", "50g de queso parmesano", "Aceite de oliva"],
      instrucciones: [
        "Cocina la pasta según las instrucciones del paquete.",
        "En un procesador, mezcla la albahaca, los piñones y el queso parmesano.",
        "Añade aceite de oliva hasta obtener una salsa homogénea.",
        "Mezcla la pasta con la salsa y sirve."
      ],
      categoria: "platos principales",
      tiempo: "25 min",
      dificultad: "facil"
    },
    "Pollo al Curry": {
      imagen: "/img/pollo-curry.jpg",
      descripcion: "Pollo tierno en salsa de curry con leche de coco.",
      ingredientes: ["4 pechugas de pollo", "1 cebolla", "2 dientes de ajo", "2 cucharadas de curry", "400ml leche de coco", "1 pimiento rojo"],
      instrucciones: [
        "Dora el pollo cortado en cubos y reserva.",
        "Sofríe la cebolla, ajo y pimiento.",
        "Añade el curry y luego la leche de coco.",
        "Incorporar el pollo y cocinar 15 minutos."
      ],
      categoria: "platos principales",
      tiempo: "40 min",
      dificultad: "media"
    },
    "Lasagna Bolognesa": {
      imagen: "/img/lasagna.jpg",
      descripcion: "Clásica lasagna italiana con carne y bechamel.",
      ingredientes: ["12 láminas de lasaña", "500g carne picada", "1 cebolla", "800g tomate triturado", "50g mantequilla", "50g harina", "500ml leche", "200g queso rallado"],
      instrucciones: [
        "Prepara la salsa boloñesa sofriendo la carne con verduras.",
        "Haz la bechamel derritiendo mantequilla, añadiendo harina y luego leche.",
        "Alterna capas de pasta, salsa y bechamel.",
        "Hornea 30 minutos a 180°C."
      ],
      categoria: "platos principales",
      tiempo: "90 min",
      dificultad: "dificil"
    },

    // Bebidas
    "Limonada Fresca": {
      imagen: "/img/limonada.jpg",
      descripcion: "Refrescante limonada perfecta para días calurosos.",
      ingredientes: ["4 limones", "1 litro de agua", "100g de azúcar", "Hielo"],
      instrucciones: [
        "Exprime los limones para obtener su jugo.",
        "Disuelve el azúcar en un poco de agua caliente.",
        "Mezcla el jugo de limón con el agua azucarada y el resto del agua fría.",
        "Añade hielo y sirve frío."
      ],
      categoria: "bebidas",
      tiempo: "10 min",
      dificultad: "facil"
    },
    "Smoothie de Frutos Tropicales": {
      imagen: "/img/smoothie.jpg",
      descripcion: "Batido cremoso con mango, piña y plátano.",
      ingredientes: ["1 mango", "2 rodajas de piña", "1 plátano", "200ml leche", "1 cucharada de miel"],
      instrucciones: [
        "Pela y corta todas las frutas.",
        "Mezcla en la licuadora con la leche.",
        "Añade hielo si deseas y endulza con miel.",
        "Sirve inmediatamente."
      ],
      categoria: "bebidas",
      tiempo: "10 min",
      dificultad: "facil"
    },
    "Café Dalgona": {
      imagen: "/img/dalgona.jpg",
      descripcion: "Tendencia coreana de café batido cremoso.",
      ingredientes: ["2 cucharadas de café instantáneo", "2 cucharadas de azúcar", "2 cucharadas de agua caliente", "200ml leche"],
      instrucciones: [
        "Bate el café, azúcar y agua hasta que doble su volumen.",
        "Llena un vaso con leche fría.",
        "Vierte suavemente la mezcla de café encima.",
        "Remueve antes de beber."
      ],
      categoria: "bebidas",
      tiempo: "5 min",
      dificultad: "facil"
    },

    // Ensaladas
    "Ensalada César": {
      imagen: "/img/ensalada.jpg",
      descripcion: "Clásica ensalada César con crotones y aderezo cremoso.",
      ingredientes: ["1 lechuga romana", "50g de queso parmesano", "1 taza de crotones", "Aderezo César", "Pollo opcional"],
      instrucciones: [
        "Lava y corta la lechuga en trozos.",
        "Añade los crotones y el queso parmesano rallado.",
        "Mezcla con el aderezo César.",
        "Si deseas, añade pollo a la parrilla cortado en tiras."
      ],
      categoria: "ensaladas",
      tiempo: "15 min",
      dificultad: "facil"
    },
    "Ensalada Griega": {
      imagen: "/img/griega.jpg",
      descripcion: "Fresca ensalada mediterránea con queso feta.",
      ingredientes: ["1 pepino", "4 tomates", "1 cebolla roja", "200g queso feta", "Aceitunas kalamata", "Aceite de oliva", "Orégano"],
      instrucciones: [
        "Corta en cubos el pepino y tomate.",
        "Rebanar finamente la cebolla.",
        "Mezclar todo con aceitunas y cubrir con queso feta.",
        "Aliñar con aceite y orégano."
      ],
      categoria: "ensaladas",
      tiempo: "20 min",
      dificultad: "facil"
    },
    "Ensalada de Quinoa": {
      imagen: "/img/quinoa.jpg",
      descripcion: "Ensalada saludable con quinoa y vegetales frescos.",
      ingredientes: ["200g quinoa", "1 aguacate", "1 mango", "1 pimiento rojo", "50g arándanos secos", "Limón", "Aceite de oliva"],
      instrucciones: [
        "Cocina la quinoa según instrucciones.",
        "Corta en cubos el aguacate, mango y pimiento.",
        "Mezcla todo con los arándanos.",
        "Aliña con jugo de limón y aceite."
      ],
      categoria: "ensaladas",
      tiempo: "30 min",
      dificultad: "media"
    }
  };
  // Agrupar recetas por categoría
  const recetasPorCategoria = {
    postres: ["Tarta de Manzana", "Cheesecake de Frutos Rojos", "Flan de Vainilla"],
    "platos principales": ["Pasta al Pesto", "Pollo al Curry", "Lasagna Bolognesa"],
    bebidas: ["Limonada Fresca", "Smoothie de Frutos Tropicales", "Café Dalgona"],
    ensaladas: ["Ensalada César", "Ensalada Griega", "Ensalada de Quinoa"]
  };

  // Controladores del carrusel
  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? recetasPorCategoria[categoriaSeleccionada].length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === recetasPorCategoria[categoriaSeleccionada].length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  // Función para dividir las recetas en grupos para el carrusel

  const mostrarReceta = (nombreReceta) => {
    setRecetaMostrada({
      nombre: nombreReceta,
      ...recetas[nombreReceta]
    });
    // Desplazamiento suave
    setTimeout(() => {
      document.getElementById('receta-detalle')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
          <img src="img/logo_invertido.png" alt="RecetApp Logo" className="logo" />
        </div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav mx-auto">
                <li className="nav-item"><a className="nav-link" href="/">Inicio</a></li>
                <li className="nav-item"><a className="nav-link" href="/buscar">Recetas</a></li>
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

        {/* Recetas por categoría con carrusel */}
        <section className="p-5 bg-light rounded shadow mt-4">
          <h2>Recetas por Categoría</h2>
          <div className="categorias mb-4">
            {["postres", "platos principales", "bebidas", "ensaladas"].map((categoria) => (
              <button
                key={categoria}
                className={`btn ${categoria === categoriaSeleccionada ? 'btn-custom' : 'btn-outline-custom'} me-2`}
                onClick={() => {
                  setCategoriaSeleccionada(categoria);
                  setActiveIndex(0);
                }}
              >
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </button>
            ))}
          </div>

          {/* Carrusel mejorado */}
          <div id="recipeCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              {recetasPorCategoria[categoriaSeleccionada].map((nombreReceta, index) => {
                const receta = recetas[nombreReceta];
                return (
                  <div className={`carousel-item ${index === activeIndex ? 'active' : ''}`} key={nombreReceta}>
                    <div className="row justify-content-center g-4">
                      <div className="col-lg-8">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="row g-0 h-100">
                            <div className="col-md-5 d-flex">
                              <img
                                src={receta.imagen}
                                className="img-fluid rounded-start h-100 object-fit-cover"
                                alt={nombreReceta}
                                loading="lazy"
                                onClick={() => mostrarReceta(nombreReceta)}
                                style={{ cursor: 'pointer' }}
                              />
                            </div>
                            <div className="col-md-7 d-flex flex-column">
                              <div className="card-body d-flex flex-column">
                                <div className="flex-grow-1">
                                  <h3 className="card-title mb-3">{nombreReceta}</h3>
                                  <p className="card-text text-muted mb-4">{receta.descripcion}</p>
                                </div>
                                <div className="mt-auto">
                                  <div className="d-flex gap-2 mb-3">
                                    <span className="badge bg-light text-dark py-2">
                                      ⏱️ {receta.tiempo}
                                    </span>
                                    <span className="badge bg-light text-dark py-2">
                                      🏋️ {receta.dificultad}
                                    </span>
                                  </div>
                                  <button
                                    className="btn btn-custom w-100 py-2"
                                    onClick={() => mostrarReceta(nombreReceta)}
                                  >
                                    Ver receta completa
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Controles mejorados */}
            {recetasPorCategoria[categoriaSeleccionada].length > 1 && (
              <>
                <button
                  className="carousel-control-prev bg-dark bg-opacity-25 rounded-end"
                  type="button"
                  onClick={handlePrev}
                  style={{ width: '50px', left: '-1rem' }}
                >
                  <span className="carousel-control-prev-icon" />
                </button>
                <button
                  className="carousel-control-next bg-dark bg-opacity-25 rounded-start"
                  type="button"
                  onClick={handleNext}
                  style={{ width: '50px', right: '-1rem' }}
                >
                  <span className="carousel-control-next-icon" />
                </button>
              </>
            )}
          </div>

          {/* Indicadores de paginación mejorados */}
<div className="d-flex justify-content-center mt-4">
  {recetasPorCategoria[categoriaSeleccionada].map((_, index) => (
    <button
      key={index}
      type="button"
      className={`mx-1 p-0 border-0 bg-${
        index === activeIndex ? 'dark' : 'secondary'
      }`}
      style={{
        width: index === activeIndex ? '20px' : '8px',
        height: '8px',
        borderRadius: '4px',
        transition: 'all 0.3s ease'
      }}
      onClick={() => goToSlide(index)}
      aria-label={`Ir a receta ${index + 1}`}
    />
  ))}
</div>
        </section>

        {recetaMostrada && (
          <section className="receta-encontrada mt-4 p-4 bg-white rounded shadow" id="receta-detalle">
            <h3>{recetaMostrada.nombre}</h3>
            <img
              src={recetaMostrada.imagen}
              alt={recetaMostrada.nombre}
              className="img-fluid rounded mb-3"
            />
            <p>{recetaMostrada.descripcion}</p>
            <div className="row">
              <div className="col-md-6">
                <h5>Ingredientes:</h5>
                <ul>
                  {recetaMostrada.ingredientes.map((ingrediente, index) => (
                    <li key={index}>{ingrediente}</li>
                  ))}
                </ul>
              </div>
              <div className="col-md-6">
                <h5>Instrucciones:</h5>
                <ol>
                  {recetaMostrada.instrucciones.map((instruccion, index) => (
                    <li key={index}>{instruccion}</li>
                  ))}
                </ol>
              </div>
            </div>
            <button
              className="btn btn-custom mt-3"
              onClick={() => alert("Receta añadida a favoritos")}
            >
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