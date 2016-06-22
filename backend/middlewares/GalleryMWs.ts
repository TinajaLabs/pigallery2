import * as path from "path";
import * as fs from "fs";
import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../common/entities/Error";
import {Directory} from "../../common/entities/Directory";
import {ObjectManagerRepository} from "../model/ObjectManagerRepository";
import {AutoCompleteItem, SearchTypes} from "../../common/entities/AutoCompleteItem";
import {ContentWrapper} from "../../common/entities/ConentWrapper";
import {SearchResult} from "../../common/entities/SearchResult";
import {Photo} from "../../common/entities/Photo";
import {Config} from "../config/Config";
import {ProjectPath} from "../ProjectPath";

export class GalleryMWs {


    public static listDirectory(req:Request, res:Response, next:NextFunction) {
        let directoryName = req.params.directory || "/";
        let absoluteDirectoryName = path.join(ProjectPath.ImageFolder, directoryName);

        if (!fs.statSync(absoluteDirectoryName).isDirectory()) {
            return next();
        }

        ObjectManagerRepository.getInstance().getGalleryManager().listDirectory(directoryName, (err, directory:Directory) => {
            if (err || !directory) {
                return next(new Error(ErrorCodes.GENERAL_ERROR, err));
            }
            
            req.resultPipe = new ContentWrapper(directory, null);
            return next();
        });
    }


    public static removeCyclicDirectoryReferences(req:Request, res:Response, next:NextFunction) {
        if (!req.resultPipe)
            return next();

        let cw:ContentWrapper = req.resultPipe;
        if (cw.directory) {
            cw.directory.photos.forEach((photo:Photo) => {
                photo.directory = null;
            });
        }

        return next();
    }


    public static loadImage(req:Request, res:Response, next:NextFunction) {
        if (!(req.params.imagePath)) {
            return next();
        }

        let fullImagePath = path.join(ProjectPath.ImageFolder, req.params.imagePath);
        if (fs.statSync(fullImagePath).isDirectory()) {
            return next();
        }

        //check if thumbnail already exist
        if (fs.existsSync(fullImagePath) === false) {
            return next(new Error(ErrorCodes.GENERAL_ERROR, "no such file :" + fullImagePath));
        }

        req.resultPipe = fullImagePath;
        return next();
    }


    public static search(req:Request, res:Response, next:NextFunction) {
        if (Config.Client.Search.searchEnabled === false) {
            return next();
        }

        if (!(req.params.text)) {
            return next();
        }

        let type:SearchTypes;
        if (req.query.type) {
            type = parseInt(req.query.type);
        }

        ObjectManagerRepository.getInstance().getSearchManager().search(req.params.text, type, (err, result:SearchResult) => {
            if (err || !result) {
                return next(new Error(ErrorCodes.GENERAL_ERROR, err));
            }
            req.resultPipe = new ContentWrapper(null, result);
            return next();
        });
    }


    public static instantSearch(req:Request, res:Response, next:NextFunction) {
        if (Config.Client.Search.instantSearchEnabled === false) {
            return next();
        }
        
        if (!(req.params.text)) {
            return next();
        }


        ObjectManagerRepository.getInstance().getSearchManager().instantSearch(req.params.text, (err, result:SearchResult) => {
            if (err || !result) {
                return next(new Error(ErrorCodes.GENERAL_ERROR, err));
            }
            req.resultPipe = new ContentWrapper(null, result);
            return next();
        });
    }

    public static autocomplete(req:Request, res:Response, next:NextFunction) {
        if (Config.Client.Search.autocompleteEnabled === false) {
            return next();
        }
        if (!(req.params.text)) {
            return next();
        }

        ObjectManagerRepository.getInstance().getSearchManager().autocomplete(req.params.text, (err, items:Array<AutoCompleteItem>) => {
            if (err || !items) {
                return next(new Error(ErrorCodes.GENERAL_ERROR, err));
            }
            req.resultPipe = items;
            return next();
        });
    }


}