import * as express from 'express';
import Cat, { CatsDocument } from '../models/cats/cat';
import * as uuidV4 from 'uuid/v4';
import { Request, Response, NextFunction } from 'express';
import { IMiddleware } from '../core/middleware';
import { Router } from '.';
const router = express.Router();

export class CatRoutes implements Router {
  constructor(private middleware: IMiddleware) {}

  initializeRoutes() {
    router.post(
      '/cat',
      [this.middleware.isAuthenticated, this.middleware.isAuthorized('create', 'cats')],
      this.createCat
    );
    router.patch(
      '/cat/:resourceOwnerId/:imageId',
      [this.middleware.isAuthenticated, this.middleware.isAuthorized('update', 'cats', true)],
      this.updateCat
    );
    router.get(
      '/cats',
      [this.middleware.isAuthenticated, this.middleware.isAuthorized('read', 'cats')],
      this.readCats
    );
    router.get(
      '/cats/:resourceOwnerId',
      [this.middleware.isAuthenticated, this.middleware.isAuthorized('read', 'cats', true)],
      this.readCatsById
    );
    return router;
  }

  private createCat(req: Request, res: Response, next: NextFunction) {
    //create a cat or something
    try {
      const id = uuidV4();
      // const imgPath = extname(req.body.path) !== '' ? req.body.path : `${req.body.path}.jpg`;
      const cat = new Cat({
        title: req.body.title,
        description: req.body.description,
        img: `http://localhost:8180/cats/${id}`,
        id
      });
      if (res.locals.permissions.granted) {
        console.log(cat);
        res.status(200).send('ok');
      } else {
        res.status(401).send('Not Authorized');
      }
      // cat.save(function(err: Error, savedObj: any) {
      //   if (err) {
      //     return res.send(err);
      //   }
      //   return res.json({ message: `Cat created! ${savedObj}` });
      // });
    } catch (err) {
      console.log(err);
    }
  }

  private readCats(req: Request, res: Response, next: NextFunction) {
    if (res.locals.permissions.granted) {
      console.log(res.locals.permissions);
      Cat.find().exec((err: Error, cats) => {
        if (err) {
          return res.send(err);
        }
        return res.json(cats.map((cat: any) => res.locals.permissions.filter(cat.toPOJSO())));
      });
    } else {
      return res.status(403).send('Invalid Authorization');
    }
  }
  private readCatsById(req: Request, res: Response, next: NextFunction) {
    console.log(res.locals.permissions);
    if (res.locals.permissions.granted) {
      Cat.find({
        resourceOwnerId: req.params.resourceOwnerId
      }).exec((err: Error, cats) => {
        if (err) {
          return res.send(err);
        }
        console.log(cats);
        return res.json(cats.map((cat: any) => res.locals.permissions.filter(cat.toPOJSO())));
      });
    } else {
      return res.status(403).send('Invalid Authorization');
    }
  }

  private updateCat(req: Request, res: Response, next: NextFunction) {
    console.log(req.params);
    console.log(res.locals.permissions.granted);
    if (res.locals.permissions.granted) {
      res.status(200).send('PATCH');
    } else {
      res.status(403).send('Invalid Authorization');
    }
  }
}
