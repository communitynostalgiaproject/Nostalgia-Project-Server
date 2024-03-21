 import { NextFunction, Request, Response } from 'express';
import { Model, Error } from 'mongoose';
import { ValidationError, NotFoundError } from '../../utils/customErrors';
import { DEFAULT_LIMIT } from '../../config/constants';

export abstract class CRUDControllerBase<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
      this.model = model;
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const document = new this.model(req.body);
        const savedDocument = await document.save();

        res.status(201).send(savedDocument);
    } catch (err) {
      this.handleError(err, next);
    }
  };

  readById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { documentId } = req.params;
      const document = await this.model.findById(documentId);

      if (!document) throw new NotFoundError("Document not found");

      res.status(200).send(this.processReadResults(req, [document])[0]);
    } catch(err) {
      this.handleError(err, next);
    }
  };

  read = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        limit,
        offset,
        createdBefore,
        createdAfter,
        excludedIds,
        ...rest
      } = req.query;

      const query: any = {...rest};

      for (const key in query) {
        if (query[key] === "true") query[key] = true;
        if (query[key] === "false") query[key] = false;
      }

      if (createdBefore) query.createdDate = { $lt: new Date(`${createdBefore}`) };
      if (createdAfter) query.createdDate = { ...query.createdDate, $gt: new Date(`${createdAfter}`) };
      if (excludedIds) query._id = { $nin: excludedIds };

      const finalQuery = await this.modifyReadQuery(req, query);
      const projectionString = this.injectReadProjectionString(req);
      const docs = await this.model
        .find(finalQuery, projectionString)
        .skip((!offset || Number(offset) < 1 || isNaN(Number(offset))) ? 0 : Number(offset))
        .limit((!limit || Number(limit) < 1 || isNaN(Number(limit))) ? DEFAULT_LIMIT : Number(limit));
  
      const processedResults = this.processReadResults(req, docs);
      res.status(200).send(processedResults);
    } catch(err) {
      this.handleError(err, next);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        _id,
        __v,
        ...rest
      } = req.body;

      const processedUpdateObj = this.processUpdateObject(req, rest);
      await this.model.updateOne({ _id }, processedUpdateObj);
  
      res.status(200).send();
    } catch(err) { 
      this.handleError(err, next);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { documentId } = req.params;
      this.beforeDelete(req, documentId);
      const deleteResult = await this.model.deleteOne({ _id: documentId });

      if (deleteResult.deletedCount > 0) {
        this.afterDelete(req, documentId);
      };
  
      res.status(204).send();
    } catch(err) {
      this.handleError(err, next);
    }
  };

  // Overwrite this method to modify the query before it is sent to the database
  protected async modifyReadQuery(req: Request, query: any): Promise<any> {
    return query;
  };

  // Overwrite this method to inject a read projection string into the query
  protected injectReadProjectionString = (req: Request): string => {
    return "";
  };

  // Overwrite this method to process results of a read operation before sending them back to the client
  protected processReadResults = (req: Request, results: T[]): any[] => {
    return results;
  };

  // Overwrite this method to inspect and change the object passed to Mongoose update in Update method
  protected processUpdateObject = (req: Request, updateObject: any): any => {
    return updateObject;
  };

  // Overwrite this method to perform an action BEFORE a document is deleted from the DB
  protected beforeDelete = (req: Request, documentId: string): void => {};

  // Overwrite this method to perform an action AFTER a document is deleted from the DB
  protected afterDelete = (req: Request, documentId: string): void => {};


  protected convertMongoError = (err: any): any => {
    if (err instanceof Error.ValidationError) {
      return new ValidationError(err.message);
    }
    if (err instanceof Error.CastError) {
      return new ValidationError("Invalid id");
    }
    if (err.name === "MongoError") {
      if (err.code === 11000) {
        return new ValidationError("Duplicate key error");
      } else if (err.code === 121 || err.code === 16716) {
        return new ValidationError("Invalid document");
      }
    }

    return err;
  };

  protected handleError = (err: any, next: NextFunction): void => {
    console.error(err);
    next(this.convertMongoError(err));
  };
};