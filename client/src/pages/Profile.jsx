// client/src/pages/Perfil.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faPlus, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import './style/Profile.css';
import RecipeCard from '../components/RecipeCard';

const Perfil = () => {
  const [userRecipes, setUserRecipes] = useState([]);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();
  const userFromStorage = localStorage.getItem('user');
  const userData = userFromStorage ? JSON.parse(userFromStorage) : null;
  const [groupedIngredients, setGroupedIngredients] = useState({});
  const [showNewIngredientDropdown, setShowNewIngredientDropdown] = useState(false);
  const [showEditIngredientDropdown, setShowEditIngredientDropdown] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editedUser, setEditedUser] = useState({
    nombre: userData?.nombre || '',
    email: userData?.email || '',
  });
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    instructions: [''],
    category: '',
    preparationTime: '',
    difficulty: '',
    ingredients: [],
    image: null,
  });
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [ingredientInput, setIngredientInput] = useState({
    ingredient: '',
    quantity: '',
    notes: '',
  });
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    unit: 'unidad',
    category: 'otros',
  });
  const [editIngredientInput, setEditIngredientInput] = useState({
    ingredient: '',
    quantity: '',
    notes: '',
  });

  //Autenticación
  ///////////////
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  //Ver receta
  ////////////
  const handleViewRecipe = (recipe) => {
    navigate('/buscar', {
      state: {
        preselectedRecipe: recipe,
        scrollToRecipe: true,
      },
    });
  };

  //Cargar favoritos
  //////////////////
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/favorites/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Error al cargar favoritos');
        const data = await response.json();
        setFavoriteRecipes(data);
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };
    fetchFavorites();
  }, []);

  //Actualizar perfil
  ///////////////////
  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedUser),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Error al actualizar el perfil');
      }
      // Actualizar token y datos de usuario en localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      localStorage.setItem('user', JSON.stringify(data.user));
      alert(data.msg || 'Perfil actualizado correctamente');
      setEditMode(false);
      window.location.reload();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert(error.message);
    }
  };

  //Cargar ingredientes disponibles//
  ///////////////////////////////////
  useEffect(() => {

    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Si hay token, es true; si no, false

    const fetchIngredients = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/ingredients');
        if (!response.ok) throw new Error('Error al cargar ingredientes');
        const data = await response.json();

        // Ordenar y agrupar por categoría
        const grouped = data
          .sort((a, b) => a.name.localeCompare(b.name))
          .reduce((acc, ingredient) => {
            const category = ingredient.category || 'otros';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(ingredient);
            return acc;
          }, {});

        setGroupedIngredients(grouped);
        setAvailableIngredients(data);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
        alert('Error al cargar ingredientes: ' + error.message);
      }
    };

    fetchIngredients();
  }, []);

  //Cerrar al hacer clic afuera//
  //////////////////////////////
  useEffect(() => {
      const handleClickOutside = (event) => {
      const newDropdown = document.querySelector('.ingredient-dropdown-new');
      const newToggle = document.querySelector('.ingredient-dropdown-toggle-new');
      const editDropdown = document.querySelector('.ingredient-dropdown-edit');
      const editToggle = document.querySelector('.ingredient-dropdown-toggle-edit');
      if (
        showNewIngredientDropdown &&
        !newDropdown?.contains(event.target) &&
        !newToggle?.contains(event.target)
      ) {
        setShowNewIngredientDropdown(false);
      }
      if (
        showEditIngredientDropdown &&
        !editDropdown?.contains(event.target) &&
        !editToggle?.contains(event.target)
      ) {
        setShowEditIngredientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNewIngredientDropdown, showEditIngredientDropdown]);

  //Recetas por usuario//
  ///////////////////////
  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/recipes/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Error al cargar tus recetas');
        const data = await response.json();
        setUserRecipes(data);
      } catch (err) {
        console.error('Error fetching user recipes:', err);
      }
    };
    fetchUserRecipes();
  }, []);

  //Nuevo ingrediente en nueva receta//
  /////////////////////////////////////
  const handleIngredientAdd = () => {
    if (!ingredientInput.ingredient || !ingredientInput.quantity) {
      alert('Selecciona un ingrediente y especifica la cantidad');
      return;
    }

    const selectedIngredient = availableIngredients.find(
      (ing) => ing._id === ingredientInput.ingredient
    );

    setNewRecipe({
      ...newRecipe,
      ingredients: [
        ...newRecipe.ingredients,
        {
          ingredient: ingredientInput.ingredient,
          name: selectedIngredient.name,
          quantity: ingredientInput.quantity,
          unit: selectedIngredient.unit,
          notes: ingredientInput.notes || '',
        },
      ],
    });

    setIngredientInput({
      ingredient: '',
      quantity: '',
      notes: '',
    });
  };

  //Subir imagen en nueva receta//
  ////////////////////////////////
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newIngredient),
      });

      if (!response.ok) throw new Error('Error al crear ingrediente');
      const createdIngredient = await response.json();

      const updatedIngredients = [...availableIngredients, createdIngredient].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setAvailableIngredients(updatedIngredients);

      setIngredientInput({
        ...ingredientInput,
        ingredient: createdIngredient._id,
      });
      setShowIngredientModal(false);
      setNewIngredient({ name: '', unit: 'unidad', category: '' });
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const handleIngredientRemove = (index) => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();

    if (!newRecipe.name || !newRecipe.description || !newRecipe.difficulty) {
      alert('Nombre, descripción y dificultad son obligatorios');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newRecipe.name);
      formData.append('description', newRecipe.description);
      formData.append('instructions', JSON.stringify(newRecipe.instructions));
      formData.append(
        'ingredients',
        JSON.stringify(
          newRecipe.ingredients.map((ing) => ({
            ingredient: ing.ingredient,
            quantity: Number(ing.quantity),
            notes: ing.notes || '',
          }))
        )
      );
      formData.append('category', newRecipe.category);
      formData.append('preparationTime', newRecipe.preparationTime.toString());
      formData.append('difficulty', newRecipe.difficulty);
      if (newRecipe.image) {
        formData.append('image', newRecipe.image);
      }

      console.log('Datos a enviar:', Object.fromEntries(formData.entries()));

      const response = await fetch('http://localhost:5000/api/recipes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const responseText = await response.text();
      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || 'Error al guardar la receta');
        } catch (parseError) {
          throw new Error(responseText || 'Error al guardar la receta');
        }
      }

      const result = JSON.parse(responseText);
      alert(`Receta "${result.name}" guardada con ID: ${result._id}`);

      setNewRecipe({
        name: '',
        description: '',
        instructions: [''],
        category: '',
        preparationTime: '',
        difficulty: '',
        ingredients: [],
        image: null,
      });
    } catch (error) {
      console.error('Error completo:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe({
      _id: recipe._id,
      name: recipe.name || '',
      description: recipe.description || '',
      instructions: Array.isArray(recipe.instructions)
        ? recipe.instructions
        : [recipe.instructions || ''],
      category: recipe.category || '',
      preparationTime: recipe.preparationTime || '',
      difficulty: recipe.difficulty || '',
      ingredients: recipe.ingredients
        ? recipe.ingredients.map((ing) => ({
          ingredient: ing.ingredient?._id || ing.ingredient,
          name:
            ing.ingredient?.name ||
            availableIngredients.find((ai) => ai._id === ing.ingredient)?.name,
          quantity: ing.quantity,
          unit:
            ing.ingredient?.unit ||
            availableIngredients.find((ai) => ai._id === ing.ingredient)?.unit,
          notes: ing.notes || '',
        }))
        : [],
      imageUrl: recipe.imageUrl || '',
      newImage: null,
    });
    setEditIngredientInput({
      ingredient: '',
      quantity: '',
      notes: '',
    });
    setShowEditModal(true);
  };

  const handleEditIngredientAdd = () => {
    if (!editIngredientInput.ingredient || !editIngredientInput.quantity) {
      alert('Selecciona un ingrediente y especifica la cantidad');
      return;
    }

    const selectedIngredient = availableIngredients.find(
      (ing) => ing._id === editIngredientInput.ingredient
    );
    if (!selectedIngredient) {
      alert('Ingrediente no encontrado');
      return;
    }

    setEditingRecipe((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          ingredient: editIngredientInput.ingredient,
          name: selectedIngredient.name,
          quantity: editIngredientInput.quantity,
          unit: selectedIngredient.unit,
          notes: editIngredientInput.notes || '',
        },
      ],
    }));

    setEditIngredientInput({
      ingredient: '',
      quantity: '',
      notes: '',
    });
  };

  const handleEditIngredientRemove = (index) => {
    setEditingRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateRecipe = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', editingRecipe.name);
      formData.append('description', editingRecipe.description);
      formData.append('instructions', JSON.stringify(editingRecipe.instructions));

      const validIngredients = editingRecipe.ingredients
        .filter((ing) => ing.ingredient && !isNaN(ing.quantity))
        .map((ing) => ({
          ingredient: ing.ingredient,
          quantity: Number(ing.quantity),
          notes: ing.notes || '',
        }));
      formData.append('ingredients', JSON.stringify(validIngredients));
      formData.append('category', editingRecipe.category);
      formData.append('preparationTime', editingRecipe.preparationTime.toString());
      formData.append('difficulty', editingRecipe.difficulty);

      if (editingRecipe.newImage) {
        formData.append('image', editingRecipe.newImage);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/recipes/${editingRecipe._id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al actualizar la receta');
      }

      const updatedRecipe = await response.json();
      alert(`Receta "${updatedRecipe.name}" actualizada correctamente`);

      setUserRecipes((prev) =>
        prev.map((r) => (r._id === updatedRecipe._id ? updatedRecipe : r))
      );
      setShowEditModal(false);
      setEditingRecipe(null);
    } catch (error) {
      console.error('Error al actualizar receta:', error);
      alert(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const btn = document.getElementById('btn-scroll-top');
      if (btn) {
        btn.style.display =
          document.documentElement.scrollTop > 100 ? 'block' : 'none';
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


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
          <img
            src="img/logo_invertido.png"
            alt="RecetApp Logo"
            className="logo"
          />
        </div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav mx-auto">
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/');
                    }}
                  >
                    Inicio
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/buscar"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/buscar');
                    }}
                  >
                    Recetas
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/perfil"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/perfil');
                    }}
                  >
                    Perfil
                  </a>
                </li>
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
        <section className="profile-section">
          <h2>Cocina de {userData.nombre}</h2>
          {editMode ? (
            <div className="edit-profile-form">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={editedUser.nombre}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, nombre: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editedUser.email}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, email: e.target.value })
                  }
                  className="form-control"
                />
              </div>
              <div className="button-group">
                <button onClick={handleUpdateProfile} className="btn btn-custom">
                  Guardar Cambios
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditedUser({
                      nombre: userData.nombre,
                      email: userData.email,
                    });
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <p>{userData.email}</p>
              <button
                onClick={() => {
                  setEditedUser({
                    nombre: userData.nombre,
                    email: userData.email,
                  });
                  setEditMode(true);
                }}
                className="btn btn-custom"
              >
                Editar Perfil
              </button>
            </>
          )}

          {/* Sección de Mis Recetas */}
          <div className="user-recipes-section mb-5">
            <h3 className="mb-4">Mis Recetas</h3>
            {userRecipes.length > 0 ? (
              <div className="row">
                {userRecipes.map((recipe) => (
                  <div key={recipe._id} className="col-md-4 mb-4">
                    <div className="card h-100">
                      {recipe.imageUrl && (
                        <img
                          src={
                            'http://localhost:5000' +
                            recipe.imageUrl || '/img/default-recipe.jpg'
                          }
                          className="card-img-top"
                          alt={recipe.name}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      )}
                      <div className="card-body">
                        <h5 className="card-title">{recipe.name}</h5>
                        <p className="card-text text-muted">
                          {recipe.category} • {recipe.difficulty} •{' '}
                          {recipe.preparationTime} min
                        </p>
                        <div className="d-flex justify-content-between">
                          <button
                            onClick={() => handleViewRecipe(recipe)}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => handleEditRecipe(recipe)}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info">
                Aún no has creado ninguna receta. ¡Empieza a compartir tus creaciones!
              </div>
            )}
          </div>

          {/* Carrusel de Recetas Favoritas */}
          <div className="favorite-recipes-section">
            <h3 className="mb-4">
              <FontAwesomeIcon icon={faHeart} className="me-2" />
              Tus Recetas Favoritas
            </h3>
            {favoriteRecipes.length > 0 ? (
              <div className="row">
                {favoriteRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    onViewRecipe={handleViewRecipe}
                  />
                ))}
              </div>
            ) : (
              <div className="alert alert-info">
                Aún no tienes recetas favoritas. ¡Empieza a guardar tus favoritas!
              </div>
            )}
          </div>

          {/* REGISTRO NUEVA RECETA */}
          <div className="nueva-receta-section">
            <h3>
              <FontAwesomeIcon icon={faPlus} /> Registrar Nueva Receta
            </h3>
            <form onSubmit={handleRecipeSubmit} encType="multipart/form-data">
              {/* Sección de imagen */}
              <div className="form-group">
                <label>Imagen de la receta</label>
                <div className="image-upload-container">
                  {newRecipe.image ? (
                    <div className="image-preview">
                      <img
                        src={
                          typeof newRecipe.image === 'string'
                            ? newRecipe.image
                            : URL.createObjectURL(newRecipe.image)
                        }
                        alt="Vista previa"
                        className="img-thumbnail"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setNewRecipe({ ...newRecipe, image: null })
                        }
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
                  onChange={(e) =>
                    setNewRecipe({ ...newRecipe, name: e.target.value })
                  }
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={newRecipe.description}
                  onChange={(e) =>
                    setNewRecipe({ ...newRecipe, description: e.target.value })
                  }
                  rows="3"
                  required
                  className="form-control"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    name="category"
                    value={newRecipe.category}
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, category: e.target.value })
                    }
                    required
                    className="form-control"
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
                    onChange={(e) =>
                      setNewRecipe({
                        ...newRecipe,
                        preparationTime: e.target.value,
                      })
                    }
                    min="1"
                    required
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dificultad</label>
                <select
                  name="difficulty"
                  value={newRecipe.difficulty}
                  onChange={(e) =>
                    setNewRecipe({ ...newRecipe, difficulty: e.target.value })
                  }
                  required
                  className="form-control"
                >
                  <option value="">Selecciona dificultad</option>
                  <option value="fácil">Fácil</option>
                  <option value="media">Media</option>
                  <option value="difícil">Difícil</option>
                </select>
              </div>

              <div className="ingredients-section">
                <h4>Ingredientes ({newRecipe.ingredients.length})</h4>

                {/* Lista de ingredientes agregados */}
                <div className="ingredients-list">
                  {newRecipe.ingredients.map((ing, index) => (
                    <div key={index} className="ingredient-item">
                      <div className="ingredient-info">
                        <span className="ingredient-name">
                          {ing.name} - {ing.quantity} {ing.unit}
                        </span>
                        {ing.notes && (
                          <span className="ingredient-notes">({ing.notes})</span>
                        )}
                      </div>
                      <button
                        type="button"
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
                  <div className="row align-items-center">
                    <div className="col-md-5 mb-2 mb-md-0">
                      <div className="ingredient-selector-container">
                        <div
                          className="ingredient-dropdown-toggle-new form-control"
                          onClick={() =>
                            setShowNewIngredientDropdown(!showNewIngredientDropdown)
                          }
                        >
                          <span>
                            {ingredientInput.ingredient
                              ? availableIngredients.find(
                                (ing) => ing._id === ingredientInput.ingredient
                              )?.name || 'Seleccionar ingrediente'
                              : 'Seleccionar ingrediente'}
                          </span>
                          <span className="dropdown-arrow">▼</span>
                        </div>

                        {showNewIngredientDropdown && (
                          <div className="ingredient-dropdown-new">
                            <div
                              className="dropdown-item new-ingredient"
                              onClick={() => {
                                setShowIngredientModal(true);
                                setShowNewIngredientDropdown(false);
                              }}
                            >
                              <span>➕ Crear nuevo ingrediente</span>
                            </div>
                            {Object.entries(groupedIngredients).map(
                              ([category, ingredients]) => (
                                <div
                                  key={category}
                                  className="ingredient-category-group"
                                >
                                  <div className="category-header">
                                    {category.charAt(0).toUpperCase() +
                                      category.slice(1)}
                                  </div>
                                  {ingredients.map((ing) => (
                                    <div
                                      key={ing._id}
                                      className={`dropdown-item ${ingredientInput.ingredient === ing._id
                                        ? 'selected'
                                        : ''
                                        }`}
                                      onClick={() => {
                                        setIngredientInput({
                                          ...ingredientInput,
                                          ingredient: ing._id,
                                        });
                                        setShowNewIngredientDropdown(false);
                                      }}
                                    >
                                      <span>{ing.name}</span>
                                      <span className="unit">({ing.unit})</span>
                                    </div>
                                  ))}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-3 mb-2 mb-md-0">
                      <input
                        type="number"
                        placeholder="Cantidad"
                        value={ingredientInput.quantity}
                        onChange={(e) =>
                          setIngredientInput({
                            ...ingredientInput,
                            quantity: e.target.value,
                          })
                        }
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-3 mb-2 mb-md-0">
                      <input
                        type="text"
                        placeholder="Notas (opcional)"
                        value={ingredientInput.notes}
                        onChange={(e) =>
                          setIngredientInput({
                            ...ingredientInput,
                            notes: e.target.value,
                          })
                        }
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-1">
                      <button
                        type="button"
                        onClick={handleIngredientAdd}
                        className="btn btn-success w-100"
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
                      onChange={(e) =>
                        setNewIngredient({ ...newIngredient, name: e.target.value })
                      }
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Unidad de Medida</label>
                    <select
                      value={newIngredient.unit}
                      onChange={(e) =>
                        setNewIngredient({ ...newIngredient, unit: e.target.value })
                      }
                      className="form-control"
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
                    onChange={(e) =>
                      setNewIngredient({ ...newIngredient, category: e.target.value })
                    }
                    className="form-control"
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
                          setNewRecipe({
                            ...newRecipe,
                            instructions: newInstructions,
                          });
                        }}
                        rows="3"
                        required
                        className="form-control"
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newInstructions = newRecipe.instructions.filter(
                            (_, i) => i !== index
                          );
                          setNewRecipe({
                            ...newRecipe,
                            instructions: newInstructions,
                          });
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
                  onClick={() =>
                    setNewRecipe({
                      ...newRecipe,
                      instructions: [...newRecipe.instructions, ''],
                    })
                  }
                  className="btn btn-custom"
                >
                  Añadir Paso
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-custom"
                style={{ marginTop: '2rem', width: '100%' }}
              >
                Guardar Receta
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Modal de Edición de Receta */}
      {showEditModal && editingRecipe && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Editar Receta: {editingRecipe.name}</h4>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRecipe(null);
                }}
                className="btn-close"
              ></button>
            </div>

            <form onSubmit={handleUpdateRecipe} encType="multipart/form-data">
              {/* Sección de imagen */}
              <div className="form-group">
                <label>Imagen de la receta</label>
                <div className="image-upload-container">
                  {editingRecipe.imageUrl ? (
                    <div className="image-preview">
                      <img
                        src={
                          editingRecipe.newImage instanceof Blob ||
                            editingRecipe.newImage instanceof File
                            ? URL.createObjectURL(editingRecipe.newImage)
                            : editingRecipe.imageUrl.includes('http')
                              ? editingRecipe.imageUrl
                              : `http://localhost:5000${editingRecipe.imageUrl}`
                        }
                        alt="Vista previa"
                        className="img-thumbnail"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setEditingRecipe({
                              ...editingRecipe,
                              newImage: e.target.files[0],
                            });
                          }
                        }}
                        className="form-control mt-2"
                      />
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setEditingRecipe({
                            ...editingRecipe,
                            newImage: e.target.files[0],
                          });
                        }
                      }}
                      className="form-control"
                    />
                  )}
                </div>
              </div>

              {/* Campos básicos */}
              <div className="form-group">
                <label>Nombre de la receta</label>
                <input
                  type="text"
                  value={editingRecipe.name}
                  onChange={(e) =>
                    setEditingRecipe({ ...editingRecipe, name: e.target.value })
                  }
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={editingRecipe.description}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      description: e.target.value,
                    })
                  }
                  rows="3"
                  required
                  className="form-control"
                />
              </div>

              {/* Resto de campos */}
              <div className="form-grid">
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={editingRecipe.category}
                    onChange={(e) =>
                      setEditingRecipe({
                        ...editingRecipe,
                        category: e.target.value,
                      })
                    }
                    required
                    className="form-control"
                  >
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
                    value={editingRecipe.preparationTime}
                    onChange={(e) =>
                      setEditingRecipe({
                        ...editingRecipe,
                        preparationTime: e.target.value,
                      })
                    }
                    min="1"
                    required
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dificultad</label>
                <select
                  value={editingRecipe.difficulty}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      difficulty: e.target.value,
                    })
                  }
                  required
                  className="form-control"
                >
                  <option value="fácil">Fácil</option>
                  <option value="media">Media</option>
                  <option value="difícil">Difícil</option>
                </select>
              </div>

              {/* Sección de ingredientes */}
              <div className="ingredients-section">
                <h4>Ingredientes ({editingRecipe.ingredients.length})</h4>

                <div className="ingredients-list">
                  {editingRecipe.ingredients.map((ing, index) => (
                    <div key={index} className="ingredient-item">
                      <div className="ingredient-info">
                        <span className="ingredient-name">
                          {ing.name} - {ing.quantity} {ing.unit}
                        </span>
                        {ing.notes && (
                          <span className="ingredient-notes">({ing.notes})</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEditIngredientRemove(index)}
                        className="btn btn-sm btn-danger"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>

                {/* Formulario para agregar nuevo ingrediente en edición */}
                <div className="add-ingredient-form">
                  <div className="row align-items-center">
                    <div className="col-md-5 mb-2 mb-md-0">
                      <div className="ingredient-selector-container">
                        <div
                          className="ingredient-dropdown-toggle-edit form-control"
                          onClick={() =>
                            setShowEditIngredientDropdown(!showEditIngredientDropdown)
                          }
                        >
                          <span>
                            {editIngredientInput.ingredient
                              ? availableIngredients.find(
                                (ing) => ing._id === editIngredientInput.ingredient
                              )?.name || 'Seleccionar ingrediente'
                              : 'Seleccionar ingrediente'}
                          </span>
                          <span className="dropdown-arrow">▼</span>
                        </div>

                        {showEditIngredientDropdown && (
                          <div className="ingredient-dropdown-edit">
                            <div
                              className="dropdown-item new-ingredient"
                              onClick={() => {
                                setShowIngredientModal(true);
                                setShowEditIngredientDropdown(false);
                              }}
                            >
                            </div>
                            {Object.entries(groupedIngredients).map(
                              ([category, ingredients]) => (
                                <div
                                  key={category}
                                  className="ingredient-category-group"
                                >
                                  <div className="category-header">
                                    {category.charAt(0).toUpperCase() +
                                      category.slice(1)}
                                  </div>
                                  {ingredients.map((ing) => (
                                    <div
                                      key={ing._id}
                                      className={`dropdown-item ${editIngredientInput.ingredient === ing._id
                                        ? 'selected'
                                        : ''
                                        }`}
                                      onClick={() => {
                                        setEditIngredientInput((prev) => ({
                                          ...prev,
                                          ingredient: ing._id,
                                          quantity: prev.quantity || '',
                                        }));
                                        setShowEditIngredientDropdown(false);
                                      }}
                                    >
                                      <span>{ing.name}</span>
                                      <span className="unit">({ing.unit})</span>
                                    </div>
                                  ))}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-3 mb-2 mb-md-0">
                      <input
                        type="number"
                        placeholder="Cantidad"
                        value={editIngredientInput.quantity}
                        onChange={(e) =>
                          setEditIngredientInput({
                            ...editIngredientInput,
                            quantity: e.target.value,
                          })
                        }
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-3 mb-2 mb-md-0">
                      <input
                        type="text"
                        placeholder="Notas (opcional)"
                        value={editIngredientInput.notes}
                        onChange={(e) =>
                          setEditIngredientInput({
                            ...editIngredientInput,
                            notes: e.target.value,
                          })
                        }
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-1">
                      <button
                        type="button"
                        onClick={handleEditIngredientAdd}
                        className="btn btn-success w-100"
                        disabled={
                          !editIngredientInput.ingredient ||
                          !editIngredientInput.quantity
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de instrucciones */}
              <div className="instructions-section">
                <h4>Instrucciones</h4>
                {editingRecipe.instructions.map((step, index) => (
                  <div key={index} className="instruction-step">
                    <div className="form-group">
                      <label>Paso {index + 1}</label>
                      <textarea
                        value={step}
                        onChange={(e) => {
                          const newInstructions = [...editingRecipe.instructions];
                          newInstructions[index] = e.target.value;
                          setEditingRecipe({
                            ...editingRecipe,
                            instructions: newInstructions,
                          });
                        }}
                        rows="3"
                        required
                        className="form-control"
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newInstructions = editingRecipe.instructions.filter(
                            (_, i) => i !== index
                          );
                          setEditingRecipe({
                            ...editingRecipe,
                            instructions: newInstructions,
                          });
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
                  onClick={() =>
                    setEditingRecipe({
                      ...editingRecipe,
                      instructions: [
                        ...editingRecipe.instructions,
                        '',
                      ],
                    })
                  }
                  className="btn btn-custom"
                >
                  Añadir Paso
                </button>
              </div>

              <div className="modal-actions mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRecipe(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-custom">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button id="btn-scroll-top" onClick={scrollToTop}>
        &#8679;
      </button>

      <footer>
        <p>&copy; 2025 RecetApp - Todos los derechos reservados</p>
      </footer>
    </>
  );
};

export default Perfil;
