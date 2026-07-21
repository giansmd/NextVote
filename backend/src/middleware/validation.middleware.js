// Generic validation wrapper
// Using simple checks for now, but could be integrated with Joi/Zod etc.
function validate(schema) {
  return (req, res, next) => {
    try {
      if (schema.body) {
        // Mock validation check for demonstration
        const keys = Object.keys(schema.body);
        for (const key of keys) {
          if (schema.body[key].required && !req.body[key]) {
             throw new Error(`El campo ${key} es requerido.`);
          }
        }
      }
      next();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
}

module.exports = { validate };