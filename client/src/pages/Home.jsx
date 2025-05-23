import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/Home.css';
import { useEffect, useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import { useNavigate } from 'react-router-dom';
function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleViewRecipe = (recipe) => {
    navigate('/buscar', {
      state: {
        preselectedRecipeId: recipe._id,
        scrollToRecipe: true
      }
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Si hay token, es true; si no, false

    // Función para obtener recetas recientes
    const fetchRecentRecipes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/recipes?limit=3');
        if (!response.ok) throw new Error('Error al cargar recetas');

        const data = await response.json();
        setRecentRecipes(data);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Función para obtener recetas populares
    const fetchPopularRecipes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/favorites/popular?limit=4');
        if (!response.ok) throw new Error('Error al cargar recetas populares');
        const data = await response.json();
        setPopularRecipes(data);
      } catch (err) {
        console.error('Error fetching popular recipes:', err);
        setError(err.message);
      }
    };

    fetchRecentRecipes();
    fetchPopularRecipes();

    const handleScroll = () => {
      const btn = document.getElementById("btn-scroll-top");
      btn.style.display = (document.documentElement.scrollTop > 100) ? "block" : "none";
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
          <img src="/img/logo_invertido.png" alt="RecetApp Logo" className="logo" />
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
            {isAuthenticated ? (
              <>

                <button onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.reload(); // Recarga la página para actualizar el estado
                }} className="btn btn-danger mx-2">Cerrar Sesión</button>
              </>
            ) : (
              <a href="/login" className="btn btn-custom">Iniciar Sesión</a>
            )}


          </div>
        </nav>
      </header>

      <main className="container mt-5">

        {!isAuthenticated && (
          <div className="alert-login">
            ⚠️ Para disfrutar de todas las funcionalidades, por favor <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>inicia sesión</a>.
          </div>
        )}

        {/* Carrusel de recetas Populares */}
        <section>
          <h2>Populares</h2>
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">Error al cargar recetas populares: {error}</div>
          ) : popularRecipes.length === 0 ? (
            <div className="alert alert-info">No hay recetas populares para mostrar</div>
          ) : (
            <div id="carouselRecetas" className="carousel slide" data-bs-ride="carousel">
              <div className="carousel-inner">
                {popularRecipes.map((recipe, index) => (
                  <div key={recipe._id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                    <img
                      src={'http://localhost:5000' + recipe.imageUrl || '/img/default-recipe.jpg'}
                      className="d-block w-100 carousel-image"
                      alt={recipe.name}
                      style={{ height: '400px', objectFit: 'cover' }}
                    />
                    <div className="carousel-caption d-none d-md-block">
                      <h5>{recipe.name}</h5>
                      <p>⭐ {recipe.favoritesCount || 0} favoritos</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#carouselRecetas" data-bs-slide="prev">
                <span className="carousel-control-prev-icon"></span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#carouselRecetas" data-bs-slide="next">
                <span className="carousel-control-next-icon"></span>
              </button>
            </div>
          )}
        </section>

        {/* Sección de recetas recientes */}
        <section className="mt-5">
          <h2>Recién cocinadas</h2>
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">Error al cargar recetas: {error}</div>
          ) : recentRecipes.length === 0 ? (
            <div className="alert alert-info">No hay recetas recientes para mostrar</div>
          ) : (
            <div className="row">
              {recentRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onViewRecipe={handleViewRecipe}
                />
              ))}
            </div>
          )}
        </section>

        {/* Sección de categorías de recetas */}
        <section class="mt-5">
          <h2>Categorías de Recetas</h2>
          <div class="categorias">

            <div class="categoria">
              <img src="img/postre.jpg" alt="Postres" />
              <h3>Postres</h3>
            </div>

            <div class="categoria">
              <img src="img/principales.jpg" alt="Platos Principales" />
              <h3>Platos Principales</h3>
            </div>

            <div class="categoria">
              <img src="img/ensaladas.jpg" alt="Ensaladas" />
              <h3>Ensaladas</h3>
            </div>

            <div class="categoria">
              <img src="img/bebidas.jpg" alt="Bebidas" />
              <h3>Bebidas</h3>
            </div>

          </div>
        </section>
      </main>

      <button id="btn-scroll-top" onClick={scrollToTop}>&#8679;</button>

      <footer>
        <p>&copy; 2025 RecetApp - Todos los derechos reservados</p>
      </footer>
    </>


  );
}

export default Home;