// client/src/pages/Home.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/Home.css'; // Crearemos este archivo para los estilos
import { useEffect } from 'react';

function Home() {
 
  useEffect(() => {
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
                <li className="nav-item"><a className="nav-link" href="/buscar">Buscar Recetas</a></li>
                <li className="nav-item"><a className="nav-link" href="/perfil">Perfil</a></li>
              </ul>
            </div>
            <a href="/login" className="btn btn-custom">Iniciar Sesión</a>
          </div>
        </nav>
      </header>

      <main className="container mt-5">
        {/* Carrusel de recetas Populares */}
        <section>
          <h2>Populares</h2>
          <div id="carouselRecetas" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img src="/img/c1.jpg" className="d-block w-100" alt="Tarta de manzana" />
              </div>
              <div className="carousel-item">
                <img src="/img/c2.jpg" className="d-block w-100" alt="Pasta al pesto" />
              </div>
              <div className="carousel-item">
                <img src="/img/c3.jpg" className="d-block w-100" alt="Pan casero" />
              </div>
              <div className="carousel-item">
                <img src="/img/c4.jpg" className="d-block w-100" alt="Ensalada de quinoa" />
              </div>
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#carouselRecetas" data-bs-slide="prev">
              <span className="carousel-control-prev-icon"></span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#carouselRecetas" data-bs-slide="next">
              <span className="carousel-control-next-icon"></span>
            </button>
          </div>
        </section>

        {/* Sección de recetas recientes */}
        <section class="mt-5">
            <h2>Recién cocinadas</h2>
            <div class="row">
                <div class="col-md-4">
                    <div class="post">
                        <img src="img/tarta-de-manzana.jpg" alt="Tarta de manzana"/>
                        <h3>Tarta de Manzana</h3>
                        <p>Una deliciosa tarta de manzana con un toque de canela y una base crujiente.</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="post">
                        <img src="img/pasta.jpg" alt="Pasta al pesto"/>
                        <h3>Pasta al Pesto</h3>
                        <p>Receta tradicional italiana con albahaca fresca, piñones y queso parmesano.</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="post">
                        <img src="img/pan.jpg" alt="Pan casero"/>
                        <h3>Pan Casero</h3>
                        <p>Aprende a hacer pan casero con pocos ingredientes y sin necesidad de amasadora.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Sección de categorías de recetas */}
        <section class="mt-5">
            <h2>Categorías de Recetas</h2>
            <div class="categorias">
                <div class="categoria">
                    <img src="img/postre.jpg" alt="Postres"/>
                    <h3>Postres</h3>
                </div>
                <div class="categoria">
                    <img src="img/principales.jpg" alt="Platos Principales"/>
                    <h3>Platos Principales</h3>
                </div>
                <div class="categoria">
                    <img src="img/ensaladas.jpg" alt="Ensaladas"/>
                    <h3>Ensaladas</h3>
                </div>
                <div class="categoria">
                    <img src="img/bebidas.jpg" alt="Bebidas"/>
                    <h3>Bebidas</h3>
                </div>
            </div>
        </section>

        {/* Formulario de suscripción */}
        <section class="mt-5">
            <div class="subscription-form">
                <h2>Suscríbete para recibir recetas</h2>
                <form>
                    <input type="email" class="form-control" placeholder="Ingresa tu correo"/>
                    <button type="submit" class="btn btn-custom">Suscribirme</button>
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
}

export default Home;