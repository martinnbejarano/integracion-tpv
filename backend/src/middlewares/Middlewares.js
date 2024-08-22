import { tableApi } from "../controllers/tableController.js"; // Example of another controller

class EntityMiddleware {
  constructor(api, entityType) {
    this.api = api;
    this.entityType = entityType;
  }

  checkExistence = async (req, res, next) => {
    try {
      const allEntities = await this.api.getAll();
      const entity = allEntities.find((e) => e.id === req.params.id);
      if (entity) {
        return next(); // If no error, continue
      }
      next("error"); // Pass the error if the entity was not found
    } catch (error) {
      next(error);
    }
  };

  handleError = (err, req, res, next) => {
    if (err) {
      return res.status(404).json({
        error: `${this.entityType} with id ${req.params.id} not found`,
      });
    }
    next();
  };
}

// Create instances of EntityMiddleware for different entities
//const cartMiddleware = new EntityMiddleware(cartApi, 'cart');
const tableMiddleware = new EntityMiddleware(tableApi, "Table");

// Export specific middlewares
// export const cartExist = cartMiddleware.checkExistence;
// export const errorCart = cartMiddleware.handleError;

export const tableExist = tableMiddleware.checkExistence;
export const errorTable = tableMiddleware.handleError;
