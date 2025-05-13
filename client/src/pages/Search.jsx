import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/Search.css';
import RecipeCard from '../components/RecipeCard';
import RecipeDetail from '../components/RecipeDetail';
import Spinner from '../components/Spinner';

const Buscar = () => {
  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // Obtener recetas de la API
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/recipes');
        
        if (!response.ok) throw new Error(`Error ${response.status}`);
        
        const data = await response.json();
        setRecipes(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Filtrar y categorizar recetas
  const { filteredRecipes, recipesByCategory } = useMemo(() => {
    const filtered = recipes.filter(recipe => {
      const matchesCategory = selectedCategory === 'todas' || 
                            recipe.category === selectedCategory;
      const matchesSearch = recipe.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    const byCategory = {
      postres: recipes.filter(r => r.category === 'postres'),
      principales: recipes.filter(r => r.category === 'principales'),
      bebidas: recipes.filter(r => r.category === 'bebidas'),
      ensaladas: recipes.filter(r => r.category === 'ensaladas'),
      todas: recipes
    };

    return { filteredRecipes: filtered, recipesByCategory: byCategory };
  }, [recipes, selectedCategory, searchTerm]);

  // Manejar cambio de categoría
  const handleCategoryChange = (categoria) => {
    setSelectedCategory(categoria);
    setActiveIndex(0);
  };

  // Manejar búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setActiveIndex(0);
  };

  // Navegación del carrusel
  const currentCategoryRecipes = recipesByCategory[selectedCategory] || [];
  
  const handlePrev = () => {
    setActiveIndex(prev => (prev === 0 ? currentCategoryRecipes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex(prev => (prev === currentCategoryRecipes.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  // Renderizado condicional
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-5 mx-3">
        Error al cargar recetas: {error}
      </div>
    );
  }

  // Categorías disponibles
  const categories = ['todas', ...new Set(recipes.map(recipe => recipe.category))];

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
        {/* Sección de búsqueda */}
        <section className="p-5 bg-light rounded shadow">
          <h2>Buscar Recetas</h2>
          <form className="search-form d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Buscar por nombre"
              value={searchTerm}
              onChange={handleSearch}
            />
          </form>

          <div className="mt-4">
            <button
              className="btn btn-custom"
              onClick={() => {
                if (filteredRecipes.length > 0) {
                  const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
                  setSelectedRecipe(filteredRecipes[randomIndex]);
                }
              }}
            >
              Receta Aleatoria
            </button>
          </div>
        </section>

        {/* Sección de categorías */}
        <section className="p-5 bg-light rounded shadow mt-4">
          <h2>Recetas por Categoría</h2>
          <div className="categorias mb-4">
            {categories.map(categoria => (
              <button
                key={categoria}
                className={`btn ${categoria === selectedCategory ? 'btn-custom' : 'btn-outline-custom'} me-2 mb-2`}
                onClick={() => handleCategoryChange(categoria)}
              >
                {categoria === 'todas' ? 'Todas' : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </button>
            ))}
          </div>

          {/* Carrusel */}
          {currentCategoryRecipes.length > 0 ? (
            <>
              <div id="recipeCarousel" className="carousel slide">
                <div className="carousel-inner">
                  {currentCategoryRecipes.map((recipe, index) => (
                    <div className={`carousel-item ${index === activeIndex ? 'active' : ''}`} key={recipe._id}>
                      <div className="row justify-content-center g-4">
                        <div className="col-lg-8">
                          <RecipeCard
                            recipe={recipe}
                            onClick={() => setSelectedRecipe(recipe)}
                            carouselMode={true}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {currentCategoryRecipes.length > 1 && (
                  <>
                    <button
                      className="carousel-control-prev bg-dark bg-opacity-25 rounded-end"
                      type="button"
                      onClick={handlePrev}
                    >
                      <span className="carousel-control-prev-icon" />
                    </button>
                    <button
                      className="carousel-control-next bg-dark bg-opacity-25 rounded-start"
                      type="button"
                      onClick={handleNext}
                    >
                      <span className="carousel-control-next-icon" />
                    </button>
                  </>
                )}
              </div>

              <div className="d-flex justify-content-center mt-4">
                {currentCategoryRecipes.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`mx-1 p-0 border-0 bg-${index === activeIndex ? 'dark' : 'secondary'}`}
                    style={{
                      width: index === activeIndex ? '20px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="alert alert-info mt-4">
              No hay recetas en esta categoría
            </div>
          )}
        </section>

        {/* Detalle de receta */}
        {selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={() => setSelectedRecipe(null)}
          />
        )}
      </main>

      <button 
        id="btn-scroll-top" 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </button>

      <footer className="mt-5 py-3 bg-dark text-white text-center">
        <p>&copy; 2025 RecetApp - Todos los derechos reservados</p>
      </footer>
    </>
  );
};

export default Buscar;