// client/src/pages/Perfil.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faPlus, faChevronLeft, faChevronRight, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
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
    ingredients: [],
    image: null // Nuevo campo para la imagen
  });

  const [showIngredientModal, setShowIngredientModal] = useState(false);

  const [ingredientInput, setIngredientInput] = useState({
    ingredient: '',
    quantity: '',
    notes: ''
  });

  const [availableIngredients, setAvailableIngredients] = useState([]);

  const [newIngredient, setNewIngredient] = useState({
    name: '',
    unit: 'unidad',
    category: 'otros' // Valor por defecto
  });

  // Cargar ingredientes disponibles al montar el componente
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/ingredients');

        if (!response.ok) {
          throw new Error('Error al cargar ingredientes');
        }

        const data = await response.json();
        console.log('Ingredientes cargados:', data); // Para debug
        setAvailableIngredients(data);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
        alert('Error al cargar ingredientes: ' + error.message);
      }
    };

    fetchIngredients();
  }, []);

  const handleIngredientAdd = () => {
    if (!ingredientInput.ingredient || !ingredientInput.quantity) {
      alert('Selecciona un ingrediente y especifica la cantidad');
      return;
    }

    const selectedIngredient = availableIngredients.find(
      ing => ing._id === ingredientInput.ingredient
    );

    setNewRecipe({
      ...newRecipe,
      ingredients: [
        ...newRecipe.ingredients,
        {
          ingredient: ingredientInput.ingredient,
          name: selectedIngredient.name, // Guardamos el nombre para mostrar
          quantity: ingredientInput.quantity,
          unit: selectedIngredient.unit, // Guardamos la unidad
          notes: ingredientInput.notes || ''
        }
      ]
    });

    // Resetea el formulario de ingrediente
    setIngredientInput({
      ingredient: '',
      quantity: '',
      notes: ''
    });
  };

  // Función para manejar la carga de imágenes
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewRecipe({ ...newRecipe, image: file });
    }
  };

  const handleCreateIngredient = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newIngredient)
      });

      if (!response.ok) throw new Error('Error al crear ingrediente');

      const createdIngredient = await response.json();

      // Actualiza la lista de ingredientes disponibles
      setAvailableIngredients([...availableIngredients, createdIngredient]);

      // Selecciona automáticamente el nuevo ingrediente
      setIngredientInput({
        ...ingredientInput,
        ingredient: createdIngredient._id
      });

      setShowIngredientModal(false);
      setNewIngredient({ name: '', unit: 'unidad', category: '' });

    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const handleIngredientRemove = (index) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!newRecipe.name || !newRecipe.description || !newRecipe.difficulty) {
      alert("Nombre, descripción y dificultad son obligatorios");
      return;
    }

    try {
      const formData = new FormData();

      // Agregar campos individualmente
      formData.append('name', newRecipe.name);
      formData.append('description', newRecipe.description);
      formData.append('instructions', JSON.stringify(newRecipe.instructions));
      formData.append('ingredients', JSON.stringify(
        newRecipe.ingredients.map(ing => ({
          ingredient: ing.ingredient,
          quantity: Number(ing.quantity),
          notes: ing.notes || ''
        }))
      ));
      formData.append('category', newRecipe.category);
      formData.append('preparationTime', newRecipe.preparationTime.toString());
      formData.append('difficulty', newRecipe.difficulty);

      // Agregar imagen si existe
      if (newRecipe.image) {
        formData.append('image', newRecipe.image);
      }

      // 4. Debug: Verificar contenido
      console.log("Datos a enviar:", Object.fromEntries(formData.entries()));

      const response = await fetch('http://localhost:5000/api/recipes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      if (!response.ok) {
        let errorMessage = 'Error al guardar la receta';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          const text = await response.text(); // Captura el texto plano
          errorMessage = `Respuesta no válida: ${text}`;
        }
        throw new Error(errorMessage);
      }


      const result = await response.json();
      alert(`Receta "${result.name}" guardada con ID: ${result._id}`);
      // Reset form after successful submission
      setNewRecipe({
        name: '',
        description: '',
        instructions: [''],
        category: '',
        preparationTime: '',
        difficulty: '',
        ingredients: [],
        image: null
      });


      // Si todo está bien, parsea la respuesta como JSON
      alert(`Receta "${result.name}" guardada con ID: ${result._id}`);

    } catch (error) {
      console.error("Error completo:", error);
      alert(`Error: ${error.message}`);
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
            <form onSubmit={handleRecipeSubmit} encType="multipart/form-data">

              {/* Sección de imagen */}
              <div className="form-group">
                <label>Imagen de la receta</label>
                <div className="image-upload-container">
                  {newRecipe.image ? (
                    <div className="image-preview">
                      <img
                        src={typeof newRecipe.image === 'string'
                          ? newRecipe.image
                          : URL.createObjectURL(newRecipe.image)}
                        alt="Vista previa"
                        className="img-thumbnail"
                      />
                      <button
                        type="button"
                        onClick={() => setNewRecipe({ ...newRecipe, image: null })}
                        className="btn btn-sm btn-danger mt-2"
                      >
                        Eliminar imagen
                      </button>
                    </div>
                  ) : (
                    <div className="upload-area">
                      <label htmlFor="imageUpload" className="upload-label">
                        <FontAwesomeIcon icon={faCloudUploadAlt} size="3x" />
                        <span> Haz clic para subir una imagen</span>
                      </label>
                      <input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Campos básicos */}
              <div className="form-group">
                <label>Nombre de la receta</label>
                <input
                  type="text"
                  name="name"
                  value={newRecipe.name}
                  onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={newRecipe.description}
                  onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                  rows="3"
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Categoría</label>
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
                </div>

                <div className="form-group">
                  <label>Tiempo de preparación (minutos)</label>
                  <input
                    type="number"
                    name="preparationTime"
                    value={newRecipe.preparationTime}
                    onChange={(e) => setNewRecipe({ ...newRecipe, preparationTime: e.target.value })}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dificultad</label>
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
              </div>

              {/* Sección de ingredientes mejorada */}
              <div className="ingredients-section">
                <h4>Ingredientes ({newRecipe.ingredients.length})</h4>

                {/* Lista de ingredientes agregados */}
                <div className="ingredients-list">
                  {newRecipe.ingredients.map((ing, index) => (
                    <div key={index} className="ingredient-item">
                      <div className="ingredient-info">
                        <span className="ingredient-name">
                          {ing.name || availableIngredients.find(a => a._id === ing.ingredient)?.name} -
                          {ing.quantity} {ing.unit || availableIngredients.find(a => a._id === ing.ingredient)?.unit}
                        </span>
                        {ing.notes && <span className="ingredient-notes">({ing.notes})</span>}
                      </div>
                      <button
                        onClick={() => handleIngredientRemove(index)}
                        className="btn btn-sm btn-danger"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>

                {/* Formulario para agregar nuevo ingrediente */}
                <div className="add-ingredient-form">
                  <div className="row">
                    <div className="col-md-5">
                      <select
                        value={ingredientInput.ingredient}
                        onChange={(e) => {
                          if (e.target.value === 'new') {
                            setShowIngredientModal(true);
                          } else {
                            setIngredientInput({ ...ingredientInput, ingredient: e.target.value });
                          }
                        }}
                        className="form-control"
                      >
                        <option value="">Seleccionar ingrediente</option>
                        {availableIngredients.map(ing => (
                          <option key={ing._id} value={ing._id}>
                            {ing.name} ({ing.unit})
                          </option>
                        ))}
                        <option value="new">➕ Crear nuevo ingrediente</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        placeholder="Cantidad"
                        value={ingredientInput.quantity}
                        onChange={(e) => setIngredientInput({
                          ...ingredientInput,
                          quantity: e.target.value
                        })}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="text"
                        placeholder="Notas (opcional)"
                        value={ingredientInput.notes}
                        onChange={(e) => setIngredientInput({
                          ...ingredientInput,
                          notes: e.target.value
                        })}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-1">
                      <button
                        onClick={handleIngredientAdd}
                        className="btn btn-success"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>


              {/* Modal para nuevo ingrediente */}
              <div className={`modal ${showIngredientModal ? 'show' : ''}`}>
                <div className="modal-content">
                  <h4>Registrar Nuevo Ingrediente</h4>

                  <div className="form-group">
                    <label>Nombre del Ingrediente</label>
                    <input
                      type="text"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Unidad de Medida</label>
                    <select
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                    >
                      <option value="g">Gramos (g)</option>
                      <option value="kg">Kilogramos (kg)</option>
                      <option value="ml">Mililitros (ml)</option>
                      <option value="l">Litros (l)</option>
                      <option value="unidad">Unidades</option>
                      <option value="taza">Tazas</option>
                    </select>
                  </div>
                  <label>Categoría</label>
                  <select
                    value={newIngredient.category}
                    onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
                  >
                    <option value="lácteos">Lácteos</option>
                    <option value="carnes">Carnes</option>
                    <option value="vegetales">Vegetales</option>
                    <option value="frutas">Frutas</option>
                    <option value="granos">Granos</option>
                    <option value="condimentos">Condimentos</option>
                    <option value="otros">Otros</option>
                  </select>
                  <div className="modal-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowIngredientModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleCreateIngredient}
                    >
                      Guardar Ingrediente
                    </button>
                  </div>
                </div>
              </div>



              {/* Sección de instrucciones */}
              <div className="instructions-section">
                <h4>Instrucciones</h4>
                {newRecipe.instructions.map((step, index) => (
                  <div key={index} className="instruction-step">
                    <div className="form-group">
                      <label>Paso {index + 1}</label>
                      <textarea
                        value={step}
                        onChange={(e) => {
                          const newInstructions = [...newRecipe.instructions];
                          newInstructions[index] = e.target.value;
                          setNewRecipe({ ...newRecipe, instructions: newInstructions });
                        }}
                        rows="3"
                        required
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newInstructions = newRecipe.instructions.filter((_, i) => i !== index);
                          setNewRecipe({ ...newRecipe, instructions: newInstructions });
                        }}
                        className="btn btn-sm btn-danger"
                        style={{ marginBottom: '1rem' }}
                      >
                        Eliminar paso
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setNewRecipe({ ...newRecipe, instructions: [...newRecipe.instructions, ''] })}
                  className="btn btn-custom"
                >
                  Añadir Paso
                </button>
              </div>

              <button type="submit" className="btn btn-custom" style={{ marginTop: '2rem', width: '100%' }}>
                Guardar Receta
              </button>
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