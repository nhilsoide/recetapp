// client/src/pages/Perfil.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './style/Profile.css';


const Perfil = () => {
  const navigate = useNavigate();
  const userFromStorage = localStorage.getItem('user');
  const userData = userFromStorage ? JSON.parse(userFromStorage) : null;

    const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    ingredients: '',
    instructions: '',
    category: '',
    time: ''
  });

  const [testimonial, setTestimonial] = useState('');

  // Datos de ejemplo
  const favoriteRecipes = [
    {
      id: 1,
      name: 'Tarta de Manzana',
      image: '/img/tarta-de-manzana.jpg',
      description: 'Una deliciosa tarta de manzana con un toque de canela.'
    },
    {
      id: 2,
      name: 'Pasta al Pesto',
      image: '/img/pasta.jpg',
      description: 'Receta tradicional italiana con albahaca fresca y queso parmesano.'
    },
    {
      id: 3,
      name: 'Pan Casero',
      image: '/img/pan.jpg',
      description: 'Aprende a hacer pan casero con pocos ingredientes.'
    },
    {
      id: 4,
      name: 'Ensalada de Quinoa',
      image: '/img/ensalada.jpg',
      description: 'Una ensalada saludable con quinoa y vegetales frescos.'
    }
  ];

  const recentActivities = [
    {
      id: 3,
      name: 'Pan Casero',
      image: '/img/pan.jpg',
      description: 'Aprende a hacer pan casero con pocos ingredientes.'
    },
    {
      id: 4,
      name: 'Ensalada de Quinoa',
      image: '/img/ensalada.jpg',
      description: 'Una ensalada saludable con quinoa y vegetales frescos.'
    }
  ];

  const handleRecipeChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestimonialChange = (e) => {
    setTestimonial(e.target.value);
  };

  const handleRecipeSubmit = (e) => {
    e.preventDefault();
    // Validación básica
    if (!newRecipe.name || !newRecipe.description || !newRecipe.ingredients ||
      !newRecipe.instructions || !newRecipe.category || !newRecipe.time) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    // Aquí iría la lógica para enviar la receta al backend
    console.log('Nueva receta:', newRecipe);
    alert('Receta guardada con éxito!');
    setNewRecipe({
      name: '',
      description: '',
      ingredients: '',
      instructions: '',
      category: '',
      time: ''
    });
  };

  const handleTestimonialSubmit = (e) => {
    e.preventDefault();
    if (!testimonial) {
      alert('Por favor, escribe tu testimonio.');
      return;
    }
    // Lógica para enviar testimonio
    console.log('Testimonio:', testimonial);
    alert('¡Gracias por tu testimonio!');
    setTestimonial('');
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

  // Estilos personalizados para el carrusel
  const carouselStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  };

  const carouselItemStyle = {
    height: '400px',
    backgroundColor: '#f8f2e7'
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
                  <a className="nav-link" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                    Inicio
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/buscar" onClick={(e) => { e.preventDefault(); navigate('/buscar'); }}>
                    Recetas
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/perfil" onClick={(e) => { e.preventDefault(); navigate('/perfil'); }}>
                    Perfil
                  </a>
                </li>
              </ul>
            </div>
            <a href="/login" className="btn btn-custom" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Iniciar Sesión
            </a>
          </div>
        </nav>
      </header>

      <main className="container mt-5">
        <section className="profile-section">
          <h2>Cocina de {userData.nombre}</h2>
          {/* <p><strong>Nombre:</strong> {userData.name}</p> */}
          <p>{userData.email}</p>
          <button className="btn btn-custom">Editar Perfil</button>

          {/* Recetas Favoritas */}
          {/* Carrusel de Recetas Favoritas */}
          <div className="favorite-recipes">
            <h3><FontAwesomeIcon icon={faHeart} /> Recetas Favoritas</h3>

            <div style={carouselStyle}>
              <Carousel
                prevIcon={<FontAwesomeIcon icon={faChevronLeft} size="2x" color="#000" />}
                nextIcon={<FontAwesomeIcon icon={faChevronRight} size="2x" color="#000" />}
                indicators={false}
              >
                {favoriteRecipes.map(recipe => (
                  <Carousel.Item key={recipe.id} style={carouselItemStyle}>
                    <div className="d-flex h-100">
                      <div className="w-50 h-100">
                        <img
                          className="d-block h-100 w-100 object-fit-cover"
                          src={recipe.image}
                          alt={recipe.name}
                        />
                      </div>
                      <div className="w-50 p-4 d-flex flex-column justify-content-center">
                        <h3 className="text-center mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {recipe.name}
                        </h3>
                        <p className="text-center">{recipe.description}</p>
                        <button
                          className="btn btn-custom align-self-center mt-3"
                          style={{ width: 'fit-content' }}
                        >
                          Ver Receta
                        </button>
                      </div>
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>
          </div>

          {/* Actividad Reciente
          <div className="recent-activity">
            <h3><FontAwesomeIcon icon={faHistory} /> Actividad Reciente</h3>
            {recentActivities.map(activity => (
              <div key={activity.id} className="recipe-card">
                <img src={activity.image} alt={activity.name} />
                <h4>{activity.name}</h4>
                <p>{activity.description}</p>
              </div>
            ))}
          </div> */}

          {/* Formulario de Nueva Receta */}
          <div className="nueva-receta-section">
            <h3><FontAwesomeIcon icon={faPlus} /> Registrar Nueva Receta</h3>
            <form onSubmit={handleRecipeSubmit}>
              <input
                type="text"
                placeholder="Nombre de la receta"
                name="name"
                value={newRecipe.name}
                onChange={handleRecipeChange}
                required
              />
              <textarea
                placeholder="Descripción de la receta"
                name="description"
                value={newRecipe.description}
                onChange={handleRecipeChange}
                required
              />
              <input
                type="text"
                placeholder="Ingredientes (separados por comas)"
                name="ingredients"
                value={newRecipe.ingredients}
                onChange={handleRecipeChange}
                required
              />
              <textarea
                placeholder="Instrucciones"
                name="instructions"
                value={newRecipe.instructions}
                onChange={handleRecipeChange}
                required
              />
              <select
                name="category"
                value={newRecipe.category}
                onChange={handleRecipeChange}
                required
              >
                <option value="">Selecciona una categoría</option>
                <option value="postres">Postres</option>
                <option value="principales">Platos Principales</option>
                <option value="ensaladas">Ensaladas</option>
                <option value="bebidas">Bebidas</option>
              </select>
              <input
                type="text"
                placeholder="Tiempo de preparación (en minutos)"
                name="time"
                value={newRecipe.time}
                onChange={handleRecipeChange}
                required
              />
              <button type="submit" className="btn btn-custom">Guardar Receta</button>
            </form>
          </div>

          {/* Formulario de Testimonios
          <div className="testimonial-form">
            <h3><FontAwesomeIcon icon={faComment} /> Deja un Testimonio o Sugerencia</h3>
            <form onSubmit={handleTestimonialSubmit}>
              <textarea 
                rows="5" 
                placeholder="Escribe tu testimonio o sugerencia aquí..." 
                value={testimonial}
                onChange={handleTestimonialChange}
              />
              <button type="submit" className="btn btn-custom">Enviar</button>
            </form>
          </div> */}
        </section>
      </main>

      <button id="btn-scroll-top" onClick={scrollToTop}>&#8679;</button>

      <footer>
        <p>&copy; 2025 RecetApp - Todos los derechos reservados</p>
      </footer>
    </>
  );
};

export default Perfil;