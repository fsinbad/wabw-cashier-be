import Joi from "joi";

export const ProductPayloadSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  // price: Joi.number().positive().required(),
  price: Joi.string().required(),
  category: Joi.string().valid("Food", "Beverage", "Dessert").insensitive().required(),
  // stock: Joi.number().integer().min(0).required(),
  stock: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  // imageFile: Joi.any().optional(),
});
