import React from 'react';
import PropTypes from 'prop-types';

const RecipeDetail = ({ recipe, onBack }) => {
  return (
    <section className="receta-detalle mt-5 p-4 bg-white rounded shadow-lg" id="receta-detalle">
      <div className="row">
        {/* Columna de imagen */}
        <div className="col-md-5 mb-4 mb-md-0">
          <img
            src={recipe.imageUrl || '/img/default-recipe.jpg'}
            alt={recipe.name}
            className="img-fluid rounded shadow"
            style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
          />
          <div className="d-flex justify-content-between mt-3">
            <span className="badge bg-secondary py-2 px-3">
              ⏱️ {recipe.preparationTime} min
            </span>
            <span className="badge bg-secondary py-2 px-3">
              🏋️ Dificultad: {recipe.difficulty}
            </span>
            <span className="badge bg-secondary py-2 px-3">
              🍽️ {recipe.category}
            </span>
          </div>
        </div>

        {/* Columna de contenido */}
        <div className="col-md-7">
          <h2 className="mb-3">{recipe.name}</h2>
          <p className="lead">{recipe.description}</p>

          <div className="row mt-4">
            {/* Ingredientes */}
            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-custom text-white">
                  <h5 className="mb-0">Ingredientes</h5>
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="list-group-item d-flex align-items-center">
                        <span className="me-2">•</span>
                        {ingredient.name} - {ingredient.quantity} {ingredient.unit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="col-md-6 mt-3 mt-md-0">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-custom text-white">
                  <h5 className="mb-0">Instrucciones</h5>
                </div>
                <div className="card-body">
                  <ol className="list-group list-group-numbered list-group-flush">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="list-group-item">
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex gap-3 mt-4">
            <button
              className="btn btn-custom flex-grow-1 py-2"
              onClick={() => alert("Receta añadida a favoritos")}
            >
              ♥ Añadir a Favoritos
            </button>
            <button
              className="btn btn-outline-custom flex-grow-1 py-2"
              onClick={onBack}
            >
              Volver a la lista
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

RecipeDetail.propTypes = {
  recipe: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    difficulty: PropTypes.string,
    preparationTime: PropTypes.number,
    category: PropTypes.string,
    ingredients: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        quantity: PropTypes.number,
        unit: PropTypes.string
      })
    ),
    instructions: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onBack: PropTypes.func.isRequired,
};

export default RecipeDetail;