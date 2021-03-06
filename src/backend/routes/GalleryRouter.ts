import {AuthenticationMWs} from '../middlewares/user/AuthenticationMWs';
import {Express} from 'express';
import {GalleryMWs} from '../middlewares/GalleryMWs';
import {RenderingMWs} from '../middlewares/RenderingMWs';
import {ThumbnailGeneratorMWs} from '../middlewares/thumbnail/ThumbnailGeneratorMWs';
import {UserRoles} from '../../common/entities/UserDTO';
import {ThumbnailSourceType} from '../model/threading/PhotoWorker';
import {VersionMWs} from '../middlewares/VersionMWs';
import {SupportedFormats} from '../../common/SupportedFormats';
import {PhotoConverterMWs} from '../middlewares/thumbnail/PhotoConverterMWs';

export class GalleryRouter {
  public static route(app: Express) {

    this.addGetImageIcon(app);
    this.addGetVideoIcon(app);
    this.addGetPhotoThumbnail(app);
    this.addGetVideoThumbnail(app);
    this.addGetBestFitImage(app);
    this.addGetImage(app);
    this.addGetBestFitVideo(app);
    this.addGetVideo(app);
    this.addGetMetaFile(app);
    this.addRandom(app);
    this.addDirectoryList(app);

    this.addSearch(app);
    this.addInstantSearch(app);
    this.addAutoComplete(app);
  }

  protected static addDirectoryList(app: Express) {
    app.get(['/api/gallery/content/:directory(*)', '/api/gallery/', '/api/gallery//'],
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('directory'),
      AuthenticationMWs.authorisePath('directory', true),
      VersionMWs.injectGalleryVersion,

      // specific part
      GalleryMWs.listDirectory,
      ThumbnailGeneratorMWs.addThumbnailInformation,
      GalleryMWs.cleanUpGalleryResults,
      RenderingMWs.renderResult
    );
  }


  protected static addGetImage(app: Express) {
    app.get(['/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Photos.join('|') + '))'],
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),

      // specific part
      GalleryMWs.loadFile,
      RenderingMWs.renderFile
    );
  }

  protected static addGetBestFitImage(app: Express) {
    app.get(['/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Photos.join('|') + '))/bestFit'],
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),

      // specific part
      GalleryMWs.loadFile,
      PhotoConverterMWs.convertPhoto,
      RenderingMWs.renderFile
    );
  }

  protected static addGetVideo(app: Express) {
    app.get(['/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Videos.join('|') + '))'],
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),

      // specific part
      GalleryMWs.loadFile,
      RenderingMWs.renderFile
    );
  }

  protected static addGetBestFitVideo(app: Express) {
    app.get(['/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Videos.join('|') + '))/bestFit'],
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),

      // specific part
      GalleryMWs.loadFile,
      GalleryMWs.loadBestFitVideo,
      RenderingMWs.renderFile
    );
  }

  protected static addGetMetaFile(app: Express) {
    app.get(['/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.MetaFiles.join('|') + '))'],
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),

      // specific part
      GalleryMWs.loadFile,
      RenderingMWs.renderFile
    );
  }

  protected static addRandom(app: Express) {
    app.get(['/api/gallery/random'],
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      VersionMWs.injectGalleryVersion,

      // specific part
      GalleryMWs.getRandomImage,
      GalleryMWs.loadFile,
      RenderingMWs.renderFile
    );
  }

  protected static addGetPhotoThumbnail(app: Express) {
    app.get('/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Photos.join('|') + '))/thumbnail/:size?',
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),

      // specific part
      GalleryMWs.loadFile,
      ThumbnailGeneratorMWs.generateThumbnailFactory(ThumbnailSourceType.Photo),
      RenderingMWs.renderFile
    );
  }

  protected static addGetVideoThumbnail(app: Express) {
    app.get('/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Videos.join('|') + '))/thumbnail/:size?',
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),

      // specific part
      GalleryMWs.loadFile,
      ThumbnailGeneratorMWs.generateThumbnailFactory(ThumbnailSourceType.Video),
      RenderingMWs.renderFile
    );
  }


  protected static addGetVideoIcon(app: Express) {
    app.get('/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Videos.join('|') + '))/icon',
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),

      // specific part
      GalleryMWs.loadFile,
      ThumbnailGeneratorMWs.generateIconFactory(ThumbnailSourceType.Video),
      RenderingMWs.renderFile
    );
  }

  protected static addGetImageIcon(app: Express) {
    app.get('/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Photos.join('|') + '))/icon',
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),

      // specific part
      GalleryMWs.loadFile,
      ThumbnailGeneratorMWs.generateIconFactory(ThumbnailSourceType.Photo),
      RenderingMWs.renderFile
    );
  }

  protected static addSearch(app: Express) {
    app.get('/api/search/:text',
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      VersionMWs.injectGalleryVersion,

      // specific part
      GalleryMWs.search,
      ThumbnailGeneratorMWs.addThumbnailInformation,
      GalleryMWs.cleanUpGalleryResults,
      RenderingMWs.renderResult
    );
  }

  protected static addInstantSearch(app: Express) {
    app.get('/api/instant-search/:text',
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      VersionMWs.injectGalleryVersion,

      // specific part
      GalleryMWs.instantSearch,
      ThumbnailGeneratorMWs.addThumbnailInformation,
      GalleryMWs.cleanUpGalleryResults,
      RenderingMWs.renderResult
    );
  }

  protected static addAutoComplete(app: Express) {
    app.get('/api/autocomplete/:text',
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      VersionMWs.injectGalleryVersion,

      // specific part
      GalleryMWs.autocomplete,
      RenderingMWs.renderResult
    );
  }

}
