// client/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSignOutAlt, faBackwardStep } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/Admin.css';

const Admin = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('usuarios');
    const [searchResults, setSearchResults] = useState(null);
    
    // Datos de ejemplo con relación usuario-recetas
    const [users, setUsers] = useState([
      { 
        id: 1, 
        nombre: 'Usuario Ejemplo', 
        email: 'usuario@example.com',
        activo: true,
        recetas: [
          { id: 1, nombre: 'Tarta de Manzana', categoria: 'Postres', activa: true },
          { id: 2, nombre: 'Ensalada César', categoria: 'Ensaladas', activa: false }
        ]
      },
      { 
        id: 2, 
        nombre: 'Chef Profesional', 
        email: 'chef@recetapp.com',
        activo: true,
        recetas: [
          { id: 3, nombre: 'Pasta al Pesto', categoria: 'Platos Principales', activa: true },
          { id: 4, nombre: 'Tiramisú', categoria: 'Postres', activa: true }
        ]
      }
    ]);

     // Función para resetear la vista
     const handleResetView = () => {
        setSearchTerm('');
        setSearchResults(null);
      };
      
    const [newItem, setNewItem] = useState({ nombre: '', email: '', categoria: '' });

    // Manejar búsqueda
    const handleSearch = (e) => {
      e.preventDefault();
      if (!searchTerm.trim()) {
        setSearchResults(null);
        return;
      }

      const results = {
        usuarios: users.filter(user => 
          user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        recetas: users.flatMap(user => 
          user.recetas.filter(recipe => 
            recipe.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.categoria.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(recipe => ({ ...recipe, usuario: user.nombre }))
        )
      };

      setSearchResults(results);
    };

    // Manejar activación/desactivación
    const handleToggleStatus = (type, id) => {
      if (type === 'usuario') {
        setUsers(users.map(user => 
          user.id === id ? { ...user, activo: !user.activo } : user
        ));
      } else {
        setUsers(users.map(user => ({
          ...user,
          recetas: user.recetas.map(recipe => 
            recipe.id === id ? { ...recipe, activa: !recipe.activa } : recipe
          )
        })));
      }
    };

    // Manejar eliminación - CORRECCIÓN APLICADA AQUÍ
    const handleDelete = (type, id) => {
      if (window.confirm(`¿Estás seguro de eliminar este ${type}?`)) {
        if (type === 'usuario') {
          setUsers(users.filter(user => user.id !== id));
        } else {
          setUsers(users.map(user => ({
            ...user,
            recetas: user.recetas.filter(recipe => recipe.id !== id)
          })));
        }
      }
    };

// Manejar cierre de sesión
const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
};

// Manejar adición de nuevo elemento
const handleAddItem = (e) => {
    e.preventDefault();
    if (activeTab === 'usuarios') {
        const newUser = {
            id: users.length + 1,
            nombre: newItem.nombre,
            email: newItem.email,
            activo: true,
            recetas: []
        };
        setUsers([...users, newUser]);
    } else {
        const newRecipe = {
            id: users.flatMap(user => user.recetas).length + 1,
            nombre: newItem.nombre,
            categoria: newItem.categoria,
            activa: true
        };
        setUsers(users.map((user, index) =>
            index === 0 ? { ...user, recetas: [...user.recetas, newRecipe] } : user
        ));
    }
    setNewItem({ nombre: '', email: '', categoria: '' });
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
                            <li className="nav-item">
                                <Link className="nav-link" to="/">Inicio</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link active" to="/admin">Admin</Link>
                            </li>
                        </ul>
                    </div>
                    <button className="btn btn-custom" onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar Sesión
                    </button>
                </div>
            </nav>
        </header>

        <main className="container mt-5">
            <section className="admin-section">
                <h2>Panel de Administrador</h2>

               {/* Barra de búsqueda con botón de reset */}
            <div className="d-flex align-items-center mb-4">
              <form className="search-bar flex-grow-1" onSubmit={handleSearch}>
                <input 
                  type="text" 
                  placeholder="Buscar usuarios o recetas..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn btn-custom">Buscar</button>
              </form>
              
              {searchResults && (
                <button 
                  onClick={handleResetView}
                  className="btn btn-custom ms-2"
                >
                  <FontAwesomeIcon icon={faBackwardStep} /> Volver
                </button>
              )}
            </div>

                {/* Mostrar resultados de búsqueda */}
                {searchResults && (
                    <div className="search-results mt-4">
                        <h4>Resultados de la búsqueda</h4>

                        {/* Resultados de usuarios */}
                        {searchResults.usuarios.length > 0 && (
                            <div className="mb-4">
                                <h5>Usuarios encontrados:</h5>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Correo Electrónico</th>
                                            <th>Recetas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.usuarios.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.nombre}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <ul className="list-unstyled">
                                                        {user.recetas.map(recipe => (
                                                            <li key={recipe.id}>
                                                                {recipe.nombre} ({recipe.categoria})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Resultados de recetas */}
                        {searchResults.recetas.length > 0 && (
                            <div>
                                <h5>Recetas encontradas:</h5>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Categoría</th>
                                            <th>Usuario</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.recetas.map(recipe => (
                                            <tr key={recipe.id}>
                                                <td>{recipe.id}</td>
                                                <td>{recipe.nombre}</td>
                                                <td>{recipe.categoria}</td>
                                                <td>{recipe.usuario}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {searchResults.usuarios.length === 0 && searchResults.recetas.length === 0 && (
                            <p>No se encontraron resultados para la búsqueda.</p>
                        )}
                    </div>
                )}

                {/* Pestañas */}
                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'usuarios' ? 'active' : ''}`}
                            onClick={() => setActiveTab('usuarios')}
                        >
                            Gestión de Usuarios
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'recetas' ? 'active' : ''}`}
                            onClick={() => setActiveTab('recetas')}
                        >
                            Gestión de Recetas
                        </button>
                    </li>
                </ul>

                {/* Tabla de Usuarios */}
                {activeTab === 'usuarios' && !searchResults && (
                    <>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Correo Electrónico</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.nombre}</td>
                                        <td>{user.email}</td>
                                        <td>{user.activo ? 'Activo' : 'Inactivo'}</td>
                                        <td>
                                            <button
                                                className="btn btn-action edit"
                                                onClick={() => handleToggleStatus('usuario', user.id)}
                                            >
                                                <FontAwesomeIcon icon={faEdit} /> {user.activo ? 'Desactivar' : 'Activar'}
                                            </button>
                                            <button
                                                className="btn btn-action delete"
                                                onClick={() => handleDelete('usuario', user.id)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} /> Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Formulario para agregar usuario */}
                        <form onSubmit={handleAddItem} className="mt-4 p-3 bg-light rounded">
                            <h4>Agregar Nuevo Usuario</h4>
                            <div className="row">
                                <div className="col-md-5">
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Nombre"
                                        value={newItem.nombre}
                                        onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-md-5">
                                    <input
                                        type="email"
                                        className="form-control mb-2"
                                        placeholder="Correo electrónico"
                                        value={newItem.email}
                                        onChange={(e) => setNewItem({ ...newItem, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-md-2">
                                    <button type="submit" className="btn btn-custom w-100">
                                        <FontAwesomeIcon icon={faPlus} /> Agregar
                                    </button>
                                </div>
                            </div>
                        </form>
                    </>
                )}

                {/* Tabla de Recetas */}
                {activeTab === 'recetas' && !searchResults && (
                    <>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Categoría</th>
                                    <th>Usuario</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.flatMap(user =>
                                    user.recetas.map(recipe => (
                                        <tr key={recipe.id}>
                                            <td>{recipe.id}</td>
                                            <td>{recipe.nombre}</td>
                                            <td>{recipe.categoria}</td>
                                            <td>{user.nombre}</td>
                                            <td>{recipe.activa ? 'Activa' : 'Inactiva'}</td>
                                            <td>
                                                <button
                                                    className="btn btn-action edit"
                                                    onClick={() => handleToggleStatus('receta', recipe.id)}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} /> {recipe.activa ? 'Desactivar' : 'Activar'}
                                                </button>
                                                <button
                                                    className="btn btn-action delete"
                                                    onClick={() => handleDelete('receta', recipe.id)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} /> Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Formulario para agregar receta */}
                        <form onSubmit={handleAddItem} className="mt-4 p-3 bg-light rounded">
                            <h4>Agregar Nueva Receta</h4>
                            <div className="row">
                                <div className="col-md-5">
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Nombre de la receta"
                                        value={newItem.nombre}
                                        onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-md-5">
                                    <select
                                        className="form-control mb-2"
                                        value={newItem.categoria}
                                        onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
                                        required
                                    >
                                        <option value="">Selecciona categoría</option>
                                        <option value="Postres">Postres</option>
                                        <option value="Platos Principales">Platos Principales</option>
                                        <option value="Ensaladas">Ensaladas</option>
                                        <option value="Bebidas">Bebidas</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <button type="submit" className="btn btn-custom w-100">
                                        <FontAwesomeIcon icon={faPlus} /> Agregar
                                    </button>
                                </div>
                            </div>
                        </form>
                    </>
                )}
            </section>
        </main>

        <button id="btn-scroll-top" onClick={scrollToTop}>&#8679;</button>

        <footer>
            <p>&copy; 2025 RecetApp - Todos los derechos reservados</p>
        </footer>
    </>
);
};

export default Admin;