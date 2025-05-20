import React from 'react';
import PropTypes from 'prop-types';
import './style/RecipeCard.css';

const RecipeCard = ({ recipe, onClick, carouselMode = false, isExpanded = false, onViewRecipe }) => {

  return (
    <div className={`${carouselMode ? '' : 'col-md-4 mb-4'}`}>
      <div className={`card h-100 ${carouselMode ? 'border-0 shadow-sm' : ''} ${isExpanded ? 'expanded-card' : ''}`}>
        <div className="card-img-container position-relative">
          <img
            src={recipe.imageUrl ? `http://localhost:5000${recipe.imageUrl}` : '/default-recipe.jpg'}
            className="card-img-top img-fluid"
            alt={recipe.name}
            style={{
              height: '200px',
              width: '100%',
              objectFit: 'cover',
              borderTopLeftRadius: 'calc(0.25rem - 1px)',
              borderTopRightRadius: 'calc(0.25rem - 1px)'
            }}
          />
          <div className="position-absolute top-0 start-0 p-2">
            <span className="badge bg-dark">{recipe.difficulty}</span>
          </div>
          <div className="position-absolute top-0 end-0 p-2">
            <span className="badge bg-dark">{recipe.preparationTime} min</span>
          </div>
        </div>

        <div className="card-body">
          <h5 className="card-title">{recipe.name}</h5>
          <p className="card-text">{recipe.description}</p>
        </div>

        {/* Detalles expandibles */}
        {isExpanded && (
          <div className="card-details-expanded p-3">
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="ingredients-section">
                  <h6 className="d-flex align-items-center">
                    <i className="bi bi-list-ul me-2"></i> Ingredientes
                  </h6>
                  <ul className="list-group list-group-flush">
                    {recipe.ingredients?.map((ing, index) => (
                      <li key={index} className="list-group-item border-0 px-0 py-1">
                        <span className="me-2">•</span>
                        {ing.name || ing.ingredient?.name} - {ing.quantity} {ing.unit || ing.ingredient?.unit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-md-6">
                <div className="instructions-section">
                  <h6 className="d-flex align-items-center">
                    <i className="bi bi-list-ol me-2"></i> Instrucciones
                  </h6>
                  <ol className="list-group list-group-numbered">
                    {recipe.instructions?.map((step, index) => (
                      <li key={index} className="list-group-item border-0 px-0 py-1">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botón */}
        <div className="card-footer bg-transparent border-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onViewRecipe) {
                onViewRecipe(recipe); // Usar onViewRecipe si está disponible
              } else if (onClick) {
                onClick(recipe);
              }
            }}
            className="btn btn-custom btn-sm w-100"
          >
            {isExpanded ? (
              <>
                <i className="bi bi-chevron-up me-1"></i> Ocultar
              </>
            ) : (
              <>
                <i className="bi bi-chevron-down me-1"></i> Ver receta
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

RecipeCard.propTypes = {
  recipe: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    difficulty: PropTypes.string,
    preparationTime: PropTypes.number,
    ingredients: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        unit: PropTypes.string,
        ingredient: PropTypes.shape({
          name: PropTypes.string,
          unit: PropTypes.string
        })
      })
    ),
    instructions: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onClick: PropTypes.func,
  carouselMode: PropTypes.bool,
  onViewRecipe: PropTypes.func
};

RecipeCard.defaultProps = {
  onClick: null,
  onViewRecipe: null
};

export default RecipeCard;