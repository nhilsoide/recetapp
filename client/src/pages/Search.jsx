import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/Search.css';
import RecipeCard from '../components/RecipeCard';
import Spinner from '../components/Spinner';
import RecipeDetail from '../components/RecipeDetail';
import { useLocation } from 'react-router-dom';
const Buscar = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const location = useLocation();
  const [selectedRecipeId, setSelectedRecipeId] = useState(
    location.state?.preselectedRecipeId || null
  );
  const [error] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  const handleViewRecipe = async (recipe) => {
  setIsDetailLoading(true);
  setSelectedRecipe(recipe);
  setSelectedRecipeId(recipe._id);
  
  await new Promise(resolve => setTimeout(resolve, 300)); // Pequeña pausa para la animación
  
  // Usar requestAnimationFrame para mejor rendimiento
  requestAnimationFrame(() => {
    const detailSection = document.getElementById('recipe-detail-section');
    if (detailSection) {
      detailSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  });
  setIsDetailLoading(false);
};

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/recipes');
        const data = await response.json();
        setRecipes(data);
        // Si venimos de Home con una receta preseleccionada
        if (location.state?.preselectedRecipeId) {
          const exists = data.some(r => r._id === location.state.preselectedRecipeId);
          if (exists) {
            // Encontrar el índice para posicionar el carrusel
            const index = data.findIndex(r => r._id === location.state.preselectedRecipeId);
            if (index !== -1) {
              setActiveIndex(Math.floor(index / 3)); // Asumiendo 3 recetas por slide
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [location.state]);

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


  const handleCategoryChange = (categoria) => {
    setSelectedCategory(categoria);
    setActiveIndex(0);
    setSelectedRecipeId(null); // Resetear selección al cambiar categoría
  };

  // Manejar búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setActiveIndex(0);
  };

  const chunkRecipes = (recipes, size = 2) => {
    const chunks = [];
    for (let i = 0; i < recipes.length; i += size) {
      chunks.push(recipes.slice(i, i + size));
    }
    return chunks;
  };

  // Navegación del carrusel
  const currentCategoryRecipes = recipesByCategory[selectedCategory] || [];
  // Navegación del carrusel
  const handlePrev = () => {
    setActiveIndex(prev => {
      const newIndex = prev === 0 ?
        Math.ceil(currentCategoryRecipes.length / 2) - 1 :
        prev - 1;
      // Forzar reflow para la animación
      document.querySelector('.carousel-inner').style.animation = 'none';
      setTimeout(() => {
        document.querySelector('.carousel-inner').style.animation = '';
      }, 10);
      return newIndex;
    });
    setSelectedRecipeId(null);
  };

  const handleNext = () => {
    setActiveIndex(prev => {
      const newIndex = prev === Math.ceil(currentCategoryRecipes.length / 2) - 1 ?
        0 :
        prev + 1;
      // Forzar reflow para la animación
      document.querySelector('.carousel-inner').style.animation = 'none';
      setTimeout(() => {
        document.querySelector('.carousel-inner').style.animation = '';
      }, 10);
      return newIndex;
    });
    setSelectedRecipeId(null);
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
                  setSelectedRecipeId(filteredRecipes[randomIndex]._id); // Usamos el ID en lugar del objeto completo

                  // Opcional: Encontrar el índice en currentCategoryRecipes para posicionar el carrusel
                  const categoryIndex = currentCategoryRecipes.findIndex(
                    r => r._id === filteredRecipes[randomIndex]._id
                  );
                  if (categoryIndex !== -1) {
                    setActiveIndex(categoryIndex);
                  }
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
              <div id="recipeCarousel" className="carousel slide" style={{ minHeight: '400px' }}>
                <div className="carousel-inner">
                  {chunkRecipes(currentCategoryRecipes, 2).map((recipeGroup, groupIndex) => (
                    <div
                      className={`carousel-item ${groupIndex === activeIndex ? 'active' : ''}`}
                      key={`group-${groupIndex}`}
                    >
                      <div className="row mx-0 justify-content-center">
                        {recipeGroup.map(recipe => (
                          <div className="col-lg-6 col-md-6 mb-4" key={recipe._id}>
                            <div className="recipe-card-container">
                              <RecipeCard
                                recipe={recipe}
                                isExpanded={selectedRecipeId === recipe._id}
                                onViewRecipe={handleViewRecipe} // Pasar la nueva función
                                carouselMode={true}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {chunkRecipes(currentCategoryRecipes, 2).length > 1 && (
                  <>
                    <button
                      className="carousel-control-prev"
                      onClick={handlePrev}
                    >
                      <span className="carousel-control-prev-icon" />
                    </button>
                    <button
                      className="carousel-control-next"
                      onClick={handleNext}
                    >
                      <span className="carousel-control-next-icon" />
                    </button>
                  </>
                )}
              </div>

              {/* Indicadores */}
              <div className="d-flex justify-content-center mt-3">
                {chunkRecipes(currentCategoryRecipes, 2).map((_, index) => (
                  <button
                    key={`indicator-${index}`}
                    className={`mx-2 p-0 border-0 bg-${index === activeIndex ? 'dark' : 'secondary'} rounded-circle`}
                    style={{
                      width: '10px',
                      height: '10px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => goToSlide(index)}
                    aria-label={`Slide ${index + 1}`}
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

        {selectedRecipe && (
          <section
            id="recipe-detail-section"
            className="mt-5 animate__animated animate__fadeIn"
            style={{ paddingBottom: '100px' }} // Espacio para el footer
          >
            <RecipeDetail
              recipe={selectedRecipe}
              onBack={() => {
                setSelectedRecipe(null);
                setSelectedRecipeId(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </section>
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