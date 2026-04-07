const express = require('express');
const multer = require('multer');
const error = require('../../../../error');
const auth = require('../../auth').authenticated;
const { Image, Event } = require('../../../../db');
const {
  canManageCommitteeResource,
  findCommitteesByImageUUID,
} = require('../../auth/committeeScope');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router
  .route('/raw/:uuid')
  .get((req, res, next) => {
    Image.getImage(req.params.uuid)
      .then((images) => {
        const image = images[0];
        if (!image) return res.status(404).send('Image not found');
        res.set('Content-Type', image.mimetype);
        res.send(image.data);
        return null; // eslint
      })
      .catch(next);
  })
  .all(auth, (req, res, next) => {
    if (!req.user.isAdmin() && !req.user.isOfficer()) return next(new error.Forbidden());
    return next();
  })
  .delete(auth, (req, res, next) => {
    const { uuid } = req.params;
    const guardByCommittee = req.user.isAdmin()
      ? Promise.resolve()
      : findCommitteesByImageUUID(Event, uuid)
        .then((committees) => {
          if (committees.length === 0) {
            throw new error.Forbidden('You do not have permission to delete this image.');
          }

          // eslint-disable-next-line max-len
          const allCommitteesAllowed = committees.every(
            (committee) => canManageCommitteeResource(req.user, committee),
          );

          if (!allCommitteesAllowed) {
            throw new error.Forbidden('You do not have permission to delete this image.');
          }
        });

    guardByCommittee
      .then(() => Image.destroyByUUID(uuid))
      .then(() => res.status(200).json({ error: null }))
      .catch((err) => {
        next(err);
      });
  });

router
  .route('/')
  .get(auth, (req, res, next) => {
    Image.getAll()
      .then((images) => {
        res.json({
          error: null,
          images,
        });
      })
      .catch(next);
  })
  .post([auth, upload.single('image')], (req, res, next) => {
    if (!req.user.isAdmin() && !req.user.isOfficer()) {
      return next(new error.Forbidden());
    }

    if (!req.file) return next(new error.BadRequest());
    const imageBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    Image.create({ data: imageBuffer, mimetype: mimeType, size: imageBuffer.length })
      .then((image) => {
        res.json({ error: null, uuid: image.getDataValue('uuid') });
      })
      .catch(next);
    return null; // eslint
  });

module.exports = { router };
