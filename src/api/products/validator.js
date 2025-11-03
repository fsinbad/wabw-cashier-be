import Joi from "joi";

export const ProductPayloadSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  price: Joi.number().positive().required(),
  category: Joi.string()
    .valid("Food", "Beverage", "Dessert")
    .required(),
  stock: Joi.number().integer().min(0).required(),
  description: Joi.string().allow('').optional(),
  imageFile: Joi.any().optional(),
});
