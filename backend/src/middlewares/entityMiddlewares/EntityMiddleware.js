import { tableApi } from "../../controllers/tableController.js"; // Example of another controller

class EntityMiddleware {
  constructor(api, entityType) {
    this.api = api;
    this.entityType = entityType;
  }

  checkExistence = async (req, res, next) => {
    try {
      const entity = await this.api.getOne(req.params.id);
      if (entity) {
        req.entity = entity; // Adjunta la entidad a req
        return next();
      }
      next("error");
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
