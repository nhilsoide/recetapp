import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const RecipeCard = ({ recipe }) => {
  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100">
        <Link to={`/receta/${recipe._id}`}>
          <img 
            src={recipe.imageUrl || '/img/default-recipe.jpg'} 
            className="card-img-top img-fluid" 
            alt={recipe.name}
            style={{ 
              height: '200px', 
              width: '100%',
              objectFit: 'cover',
              borderTopLeftRadius: 'calc(0.25rem - 1px)',
              borderTopRightRadius: 'calc(0.25rem - 1px)'
            }}
            onError={(e) => {
              e.target.src = '/img/default-recipe.jpg';
            }}
          />
        </Link>
        <div className="card-body">
          <h5 className="card-title">{recipe.name}</h5>
          <p className="card-text">{recipe.description}</p>
          <div className="d-flex justify-content-between">
            <span className="badge bg-secondary">{recipe.difficulty}</span>
            <span className="text-muted">{recipe.preparationTime} min</span>
          </div>
        </div>
        <div className="card-footer bg-transparent">
          <Link to={`/receta/${recipe._id}`} className="btn btn-custom btn-sm">
            Ver receta
          </Link>
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
  }).isRequired,
};

export default RecipeCard;