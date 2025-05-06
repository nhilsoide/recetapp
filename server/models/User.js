const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

// Hash password antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual para obtener las recetas del usuario
UserSchema.virtual('recipes', {
  ref: 'Recipe',
  localField: '_id',
  foreignField: 'author',
  justOne: false
});


module.exports = mongoose.model('User', UserSchema);