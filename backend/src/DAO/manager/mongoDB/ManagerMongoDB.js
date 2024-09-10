import { AppError } from "../../../middlewares/errorHandlers/AppError.js";

//CRUD de MongoDB

class ManagerMongoDB {
  constructor(collection) {
    this.collection = collection;
  }
  // Crea un nuevo documento
  async create(doc) {
    try {
      const newDoc = await this.collection.create(doc);
      return newDoc;
    } catch (err) {
      throw new AppError(`Error al crear documento: ${err.message}`, 400);
    }
  }

  // Devuelve todos los documentos
  async getAll() {
    try {
      const all = await this.collection.find({});
      return all;
    } catch (err) {
      throw new AppError(`Error al obtener documentos: ${err.message}`, 500);
    }
  }

  // Devuelve el documento que coincide con el id
  async getOne(id) {
    try {
      const one = await this.collection.findById(id);
      if (!one) {
        throw new AppError("Documento no encontrado", 404);
      }
      return one;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Error al obtener documento: ${err.message}`, 500);
    }
  }

  // Actualiza un documento por su id
  async update(id, doc) {
    try {
      const updateDoc = await this.collection.findByIdAndUpdate(id, doc, {
        new: true,
      });
      if (!updateDoc) {
        throw new AppError("Documento no encontrado para actualizar", 404);
      }
      return updateDoc;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Error al actualizar documento: ${err.message}`, 400);
    }
  }

  // Guarda documento
  async save(doc) {
    try {
      await doc.save();
    } catch (err) {
      throw new AppError(`Error al guardar documento: ${err.message}`, 400);
    }
  }

  // Elimina por id
  async delete(id) {
    try {
      const deleteDoc = await this.collection.findByIdAndDelete(id);
      if (!deleteDoc) {
        throw new AppError("Documento no encontrado para eliminar", 404);
      }
      return deleteDoc;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Error al eliminar documento: ${err.message}`, 400);
    }
  }
}

export default ManagerMongoDB;
