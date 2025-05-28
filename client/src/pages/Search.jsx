// client/src/pages/Search.jsx
import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import './style/Search.css';
import RecipeCard from '../components/RecipeCard';
import RecipeDetail from '../components/RecipeDetail';
import Spinner from '../components/Spinner';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const Buscar = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedRecipe, setSelectedRecipe] = useState(
    location.state?.preselectedRecipe || null
  );
  const [error] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const userFromStorage = localStorage.getItem('user');
  const userData = userFromStorage ? JSON.parse(userFromStorage) : null;
  

  //***********************//
  //Verificar autenticación//
  //***********************//
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  //***************//
  //Botón de scroll//
  //***************//
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  //***************//
  //Obtener recetas//
  //***************//
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Si hay token, es true; si no, false
    const fetchRecipes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/recipes');
        const data = await response.json();
        setRecipes(data);

        if (location.state?.preselectedRecipe) {
          const exists = data.some(r => r._id === location.state.preselectedRecipe._id);
          if (exists) {
            const index = data.findIndex(r => r._id === location.state.preselectedRecipe._id);
            if (index !== -1) {
              setActiveIndex(Math.floor(index / 2));
              setSelectedRecipe(location.state.preselectedRecipe);
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

  //***********************//
  //Recetas por ingrediente//
  //***********************//
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        let url = 'http://localhost:5000/api/recipes';
        if (ingredientSearch.trim() !== '') {
          url = `http://localhost:5000/api/recipes/search/ingredient?ingredient=${encodeURIComponent(ingredientSearch)}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        setRecipes(data);

        // Resto de tu lógica existente...
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [location.state, ingredientSearch]);

  //****************//
  //Mostrar detalles//
  //****************//
  const handleViewRecipe = async (recipe) => {
    setIsDetailLoading(true);
    setSelectedRecipe(recipe);
    await new Promise(resolve => setTimeout(resolve, 300));
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

  //*****************//
  //Filtro de recetas//
  //*****************//
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
  }, [recipes, selectedCategory, searchTerm, ingredientSearch]);

  //********************//
  //Filtro de categorías//
  //********************//
  const handleCategoryChange = (categoria) => {
    setSelectedCategory(categoria);
    setActiveIndex(0);
    setSelectedRecipe(null);
    setSearchTerm(''); // reset search when changing category
  };

  //*******************//
  //Termino de busqueda//
  //*******************//
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setActiveIndex(0);
  };

  //*******************//
  //Termino de busqueda//
  //*******************//
  const chunkRecipes = (recipesArray, size = 2) => {
    const chunks = [];
    for (let i = 0; i < recipesArray.length; i += size) {
      chunks.push(recipesArray.slice(i, i + size));
    }
    return chunks;
  };

  const currentCategoryRecipes = recipesByCategory[selectedCategory] || [];

  const handlePrev = () => {
    setActiveIndex(prev => {
      const newIndex =
        prev === 0
          ? Math.ceil(currentCategoryRecipes.length / 2) - 1
          : prev - 1;

      const carouselInner = document.querySelector('.carousel-inner');
      if (carouselInner) {
        carouselInner.style.animation = 'none';
        setTimeout(() => {
          carouselInner.style.animation = '';
        }, 10);
      }
      return newIndex;
    });
  };

  const handleNext = () => {
    setActiveIndex(prev => {
      const newIndex =
        prev === Math.ceil(currentCategoryRecipes.length / 2) - 1
          ? 0
          : prev + 1;

      const carouselInner = document.querySelector('.carousel-inner');
      if (carouselInner) {
        carouselInner.style.animation = 'none';
        setTimeout(() => {
          carouselInner.style.animation = '';
        }, 10);
      }
      return newIndex;
    });
  };

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

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

  const categories = ['todas', ...new Set(recipes.map(recipe => recipe.category))];

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info text-center">
          <h4>Por favor inicia sesión para acceder a tu perfil</h4>
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-primary mt-3"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          <h4>No se pudieron cargar los datos del usuario</h4>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
            className="btn btn-warning mt-3"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <header>
        <div className="logo-container d-flex justify-content-start align-items-center py-3">
          <img src="img/logo_invertido.png" alt="RecetApp Logo" className="logo hover-grow" />
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
        {/* Sección de búsqueda*/}
        <section className="search-container animate__animated animate__fadeInUp">
          <h2>Descubre nuevas recetas</h2>
          <form className="search-form" onSubmit={e => e.preventDefault()}>
            <div className="row g-2">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre de receta..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por ingrediente..."
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                />
              </div>
            </div>
            <button
              className="btn btn-custom mt-2"
              type="button"
              onClick={() => {
                if (filteredRecipes.length > 0) {
                  const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
                  handleViewRecipe(filteredRecipes[randomIndex]);
                }
              }}
            >
              <i className="bi bi-shuffle me-2"></i> Receta Aleatoria
            </button>
          </form>
        </section>

        {/* Si hay término de búsqueda, mostrar resultados filtrados */}
        {searchTerm.trim() !== '' ? (
          <section className="filtered-results animate__animated animate__fadeInUp">
            <h3>Resultados para "{searchTerm}"</h3>
            {filteredRecipes.length > 0 ? (
              <div className="search-results-grid">
                {filteredRecipes.map(recipe => (
                  <div className="search-result-card" key={recipe._id}>
                    <div className="position-relative overflow-hidden">
                      <img
                        src={recipe.imageUrl ? `http://localhost:5000${recipe.imageUrl}` : '/default-recipe.jpg'}
                        className="search-result-img"
                        alt={recipe.name}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewRecipe(recipe);
                        }}
                        className="favorite-btn position-absolute top-0 end-0 m-2"
                      >
                        <FontAwesomeIcon
                          icon={regularHeart}
                          color="white"
                          size="lg"
                        />
                      </button>
                    </div>

                    <div className="search-result-body">
                      <h4 className="search-result-title">{recipe.name}</h4>
                      <p className="search-result-description">{recipe.description}</p>

                      <div className="search-result-meta">
                        <span className="search-result-badge">{recipe.difficulty}</span>
                        <span className="search-result-badge">{recipe.preparationTime} min</span>
                      </div>
                    </div>

                    <div className="search-result-footer">
                      <button
                        onClick={() => handleViewRecipe(recipe)}
                        className="btn btn-custom btn-sm w-100"
                      >
                        <i className="bi bi-eye-fill me-2"></i> Ver receta completa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info mt-4 text-center py-4">
                <i className="bi bi-search me-2" style={{ fontSize: '1.5rem' }}></i>
                <h4 className="mt-2">No encontramos recetas que coincidan</h4>
                <p className="mb-0">Intenta con otros términos de búsqueda</p>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Sección de categorías mejorada */}
            <section className="carousel-section animate__animated animate__fadeInUp mt-5">
              <h2>Explora por categorías</h2>
              <div className="categorias mb-4 d-flex flex-wrap">
                {categories.map(categoria => (
                  <button
                    key={categoria}
                    className={`btn ${categoria === selectedCategory ? 'btn-custom' : 'btn-outline-custom'} me-2 mb-2`}
                    onClick={() => handleCategoryChange(categoria)}
                  >
                    {categoria === 'todas'
                      ? 'Todas'
                      : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </button>
                ))}
              </div>

              {currentCategoryRecipes.length > 0 ? (
                <>
                  <div id="recipeCarousel" className="carousel slide" style={{ minHeight: '450px' }}>
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
                                    isSelected={selectedRecipe?._id === recipe._id}
                                    onViewRecipe={handleViewRecipe}
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
                        <button className="carousel-control-prev" onClick={handlePrev}>
                          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                          <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" onClick={handleNext}>
                          <span className="carousel-control-next-icon" aria-hidden="true"></span>
                          <span className="visually-hidden">Next</span>
                        </button>
                      </>
                    )}
                  </div>

                  <div className="d-flex justify-content-center mt-4">
                    {chunkRecipes(currentCategoryRecipes, 2).map((_, index) => (
                      <button
                        key={`indicator-${index}`}
                        className={`mx-2 p-0 border-0 bg-${index === activeIndex ? 'dark' : 'secondary'} rounded-circle`}
                        style={{
                          width: '12px',
                          height: '12px',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => goToSlide(index)}
                        aria-label={`Slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="alert alert-info mt-4 text-center">
                  <i className="bi bi-info-circle me-2"></i>No hay recetas en esta categoría
                </div>
              )}
            </section>
          </>
        )}

        {selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={() => {
              setSelectedRecipe(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      <button
        id="btn-scroll-top"
        className={showScrollButton ? 'visible' : ''}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </button>

      <footer>
        <div className="container">
          <p>&copy; 2025 RecetApp - Todos los derechos reservados</p>
        </div>
      </footer>
    </>
  );
};

export default Buscar;