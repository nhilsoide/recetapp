import React from 'react';
import PropTypes from 'prop-types';
import './style/RecipeCard.css';

const RecipeDetail = ({ recipe, onBack }) => {
  return (
    <section id="recipe-detail-section" className="mb-5">
      <div className="detail-header bg-white p-4 border-bottom">
        <h2 className="mb-3">{recipe.name}</h2>
        <p className="lead">{recipe.description}</p>
      </div>

      <div className="detail-content bg-white p-4">
        <div className="row">
          {/* Columna de imagen */}
          <div className="col-lg-6 mb-4">
            <div className="detail-image">
              <img
                src={recipe.imageUrl ? `http://localhost:5000${recipe.imageUrl}` : '/default-recipe.jpg'}
                alt={recipe.name}
                className="img-fluid rounded shadow"
              />
              <div className="d-flex justify-content-between mt-3">
                <span className="badge bg-secondary py-2 px-3">
                  ⏱️ {recipe.preparationTime} min
                </span>
                <span className="badge bg-secondary py-2 px-3">
                  🏋️ {recipe.difficulty}
                </span>
                <span className="badge bg-secondary py-2 px-3">
                  🍽️ {recipe.category}
                </span>
              </div>
            </div>
          </div>

          {/* Columna de ingredientes */}
          <div className="col-lg-6">
            <div className="ingredients-list mb-4">
              <h3 className="mb-3">Ingredientes</h3>
              <ul className="list-group list-group-flush">
                {recipe.ingredients.map((ing, index) => (
                  <li key={ing._id || index}>
                    {ing.quantity && `${ing.quantity} `}
                    {ing.ingredient?.unit && ` ${ing.ingredient.unit}`} {/* Unidad dentro de ingredient */}
                    {ing.ingredient?.name} {/* Accedemos al name dentro de ingredient */}

                    {ing.notes && ` (${ing.notes})`} {/* Notas es propiedad directa */}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="instructions-list mt-4">
          <h3 className="mb-3">Preparación</h3>
          <ol className="list-group list-group-numbered list-group-flush">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="list-group-item">
                {instruction}
              </li>
            ))}
          </ol>
        </div>

        {/* Botones */}
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
            Volver
          </button>
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