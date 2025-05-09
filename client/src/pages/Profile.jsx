// client/src/pages/Perfil.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './style/Profile.css';


const Perfil = () => {
  const navigate = useNavigate();
  const userFromStorage = localStorage.getItem('user');
  const userData = userFromStorage ? JSON.parse(userFromStorage) : null;

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

  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    instructions: [''],
    category: '',
    preparationTime: '',
    difficulty: '',
    ingredients: []
  });

  const [ingredientInput, setIngredientInput] = useState({
    ingredient: '',
    quantity: '',
    notes: ''
  });

  const [availableIngredients, setAvailableIngredients] = useState([]);

  // Cargar ingredientes disponibles al montar el componente
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch('/api/ingredients');
        const data = await response.json();
        setAvailableIngredients(data);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      }
    };
    fetchIngredients();
  }, []);

  const handleIngredientAdd = () => {
    if (!ingredientInput.ingredient || !ingredientInput.quantity) return;

    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, {
        ingredient: ingredientInput.ingredient,
        quantity: Number(ingredientInput.quantity),
        notes: ingredientInput.notes
      }]
    }));

    setIngredientInput({
      ingredient: '',
      quantity: '',
      notes: ''
    });
  };

  const handleIngredientRemove = (index) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRecipe)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la receta');
      }

      const savedRecipe = await response.json();
      alert('Receta guardada con éxito!');

      // Resetear el formulario
      setNewRecipe({
        name: '',
        description: '',
        instructions: [''],
        category: '',
        preparationTime: '',
        difficulty: '',
        ingredients: []
      });

    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };


  const handleRecipeChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe(prev => ({
      ...prev,
      [name]: value
    }));
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
          {/* Formulario de Nueva Receta */}
          <div className="nueva-receta-section">
            <h3><FontAwesomeIcon icon={faPlus} /> Registrar Nueva Receta</h3>
            <form onSubmit={handleRecipeSubmit}>
              <input
                type="text"
                placeholder="Nombre de la receta"
                name="name"
                value={newRecipe.name}
                onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                required
              />

              <textarea
                placeholder="Descripción de la receta"
                name="description"
                value={newRecipe.description}
                onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                required
              />

              <div className="ingredients-section">
                <h4>Ingredientes</h4>
                {newRecipe.ingredients.map((ing, index) => (
                  <div key={index} className="ingredient-item">
                    <span>
                      {availableIngredients.find(a => a._id === ing.ingredient)?.name} -
                      {ing.quantity} {availableIngredients.find(a => a._id === ing.ingredient)?.unit}
                      {ing.notes && ` (${ing.notes})`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIngredientRemove(index)}
                      className="btn btn-sm btn-danger"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}

                <div className="add-ingredient">
                  <select
                    value={ingredientInput.ingredient}
                    onChange={(e) => setIngredientInput({ ...ingredientInput, ingredient: e.target.value })}
                  >
                    <option value="">Seleccionar ingrediente</option>
                    {availableIngredients.map(ing => (
                      <option key={ing._id} value={ing._id}>{ing.name}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={ingredientInput.quantity}
                    onChange={(e) => setIngredientInput({ ...ingredientInput, quantity: e.target.value })}
                  />

                  <input
                    type="text"
                    placeholder="Notas (opcional)"
                    value={ingredientInput.notes}
                    onChange={(e) => setIngredientInput({ ...ingredientInput, notes: e.target.value })}
                  />

                  <button
                    type="button"
                    onClick={handleIngredientAdd}
                    className="btn btn-sm btn-success"
                  >
                    Añadir
                  </button>
                </div>
              </div>

              <div className="instructions-section">
                <h4>Instrucciones</h4>
                {newRecipe.instructions.map((step, index) => (
                  <div key={index} className="instruction-step">
                    <textarea
                      placeholder={`Paso ${index + 1}`}
                      value={step}
                      onChange={(e) => {
                        const newInstructions = [...newRecipe.instructions];
                        newInstructions[index] = e.target.value;
                        setNewRecipe({ ...newRecipe, instructions: newInstructions });
                      }}
                      required
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newInstructions = newRecipe.instructions.filter((_, i) => i !== index);
                          setNewRecipe({ ...newRecipe, instructions: newInstructions });
                        }}
                        className="btn btn-sm btn-danger"
                      >
                        Eliminar paso
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setNewRecipe({ ...newRecipe, instructions: [...newRecipe.instructions, ''] })}
                  className="btn btn-sm btn-secondary"
                >
                  Añadir paso
                </button>
              </div>

              <select
                name="category"
                value={newRecipe.category}
                onChange={(e) => setNewRecipe({ ...newRecipe, category: e.target.value })}
                required
              >
                <option value="">Selecciona una categoría</option>
                <option value="postres">Postres</option>
                <option value="principales">Platos Principales</option>
                <option value="ensaladas">Ensaladas</option>
                <option value="bebidas">Bebidas</option>
              </select>

              <input
                type="number"
                placeholder="Tiempo de preparación (en minutos)"
                name="preparationTime"
                value={newRecipe.preparationTime}
                onChange={(e) => setNewRecipe({ ...newRecipe, preparationTime: e.target.value })}
                required
                min="1"
              />

              <select
                name="difficulty"
                value={newRecipe.difficulty}
                onChange={(e) => setNewRecipe({ ...newRecipe, difficulty: e.target.value })}
                required
              >
                <option value="">Selecciona dificultad</option>
                <option value="fácil">Fácil</option>
                <option value="media">Media</option>
                <option value="difícil">Difícil</option>
              </select>

              <button type="submit" className="btn btn-custom">Guardar Receta</button>
            </form>
          </div>
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