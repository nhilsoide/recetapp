import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSignOutAlt, faBackwardStep, faSpinner } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/Admin.css';

const Admin = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('usuarios');
    const [searchResults, setSearchResults] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newItem, setNewItem] = useState({ nombre: '', email: '', categoria: '' });

    //Autenticación Admin
    /////////////////////
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const user = JSON.parse(localStorage.getItem('user'));
            setIsAdmin(user?.isAdmin || false);
            fetchData();
        } else {
            navigate('/login');
        }
    }, []);

    //Usuarios y recetas (api)
    //////////////////////////
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            //usuarios
            const usersResponse = await fetch('http://localhost:5000/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!usersResponse.ok) {
                const errorText = await usersResponse.text();
                throw new Error(`Error ${usersResponse.status}: ${errorText}`);
            }
            const usersData = await usersResponse.json();

            //recetas
            const recipesResponse = await fetch('http://localhost:5000/api/recipes/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (!recipesResponse.ok) {
                const errorText = await recipesResponse.text();
                throw new Error(`Error ${recipesResponse.status}: ${errorText}`);
            }
            const recipesData = await recipesResponse.json();

            setUsers(usersData);
            setRecipes(recipesData);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert(`Error al cargar los datos: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    //Activar/desactivar receta
    ///////////////////////////
    const handleToggleRecipeStatus = async (recipeId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/recipes/${recipeId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al cambiar estado');
            }
            const data = await response.json();
            setRecipes(prevRecipes =>
                prevRecipes.map(recipe =>
                    recipe._id === recipeId ? { ...recipe, isActive: data.isActive } : recipe
                )
            );

        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    };

    //Limpiar campo
    ///////////////
    const handleResetView = () => {
        setSearchTerm('');
        setSearchResults(null);
    };

    //búsqueda filtrada
    ///////////////////
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
            recetas: recipes.filter(recipe =>
                recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
            ).map(recipe => ({
                ...recipe,
                usuario: users.find(u => u._id === recipe.author)?.nombre || 'Desconocido'
            }))
        };

        setSearchResults(results);
    };    

    //cerrar sesión
    ///////////////
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    //Scroll
    ////////
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

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            </div>
        );
    }

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
                                                <th>Fecha de Registro</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {searchResults.usuarios.map(user => (
                                                <tr key={user._id}>
                                                    <td>{user._id}</td>
                                                    <td>{user.nombre}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.fechaRegistro}</td>
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
                                                <tr key={recipe._id}>
                                                    <td>{recipe._id}</td>
                                                    <td>{recipe.name}</td>
                                                    <td>{recipe.category}</td>
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
                                Usuarios
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
                                        <th>Fecha de Registro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td>{user._id}</td>
                                            <td>{user.nombre}</td>
                                            <td>{user.email}</td>
                                            <td>{user.fechaRegistro
                                                ? new Date(user.fechaRegistro).toLocaleDateString('es-MX')
                                                : 'Sin fecha'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Formulario para agregar usuario */}
                            {/* <form onSubmit={handleAddItem} className="mt-4 p-3 bg-light rounded">
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
                            </form> */}
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
                                    {recipes.map(recipe => {
                                        const user = users.find(u => u._id === recipe.author);
                                        return (
                                            <tr key={recipe._id}>
                                                <td>{recipe._id}</td>
                                                <td>{recipe.name}</td>
                                                <td>{recipe.category}</td>
                                                <td>{recipe.author.nombre || 'Desconocido'}</td>
                                                <td>{recipe.isActive ? 'Activa' : 'Inactiva'}</td>
                                                <td>
                                                    <button
                                                        className={`btn ${recipe.isActive ? 'btn-danger' : 'btn-success'}`}
                                                        onClick={() => handleToggleRecipeStatus(recipe._id, recipe.isActive)}
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                        {recipe.isActive ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

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