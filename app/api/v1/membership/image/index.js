const express = require('express');
const multer = require('multer');
const error = require('../../../../error');
const auth = require('../../auth').authenticated;
const { Image, Event, AuditLog } = require('../../../../db');
const {
  canManageCommitteeResource,
  findCommitteesByImageUUID,
} = require('../../auth/committeeScope');
const { recordAudit } = require('../../../../audit');
const { getImageDimensions } = require('../../../../image-dimensions');

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
      .then(() => {
        res.status(200).json({ error: null });
        recordAudit(AuditLog, req, { action: 'media.delete', target: uuid });
      })
      .catch((err) => {
        next(err);
      });
  });

/**
 * Counts, per image UUID, how many events reference it as a cover or thumbnail.
 *
 * Done as one pass over the events rather than a query per image: the Media grid asks for the
 * usage of every image at once, and the per-image version was N+1 queries deep.
 */
const buildUsageIndex = async () => {
  const events = await Event.findAll({ attributes: ['cover', 'thumb'] });
  const usage = new Map();

  events.forEach((event) => {
    ['cover', 'thumb'].forEach((field) => {
      const value = event.getDataValue(field);
      if (!value) return;
      const match = value.match(/\/image\/raw\/([0-9a-f-]{36})/i);
      if (!match) return;
      const uuid = match[1].toLowerCase();
      usage.set(uuid, (usage.get(uuid) || 0) + 1);
    });
  });

  return usage;
};

router
  .route('/')
  .get(auth, (req, res, next) => {
    Promise.all([Image.getAll(), buildUsageIndex()])
      .then(([images, usage]) => {
        res.json({
          error: null,
          // referenceCount makes "Unused" in the Media grid a real fact rather than a guess.
          images: images.map((image) => ({
            ...image,
            referenceCount: usage.get(String(image.uuid).toLowerCase()) || 0,
          })),
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
    const { width, height } = getImageDimensions(imageBuffer);

    Image.create({
      data: imageBuffer, mimetype: mimeType, size: imageBuffer.length, width, height,
    })
      .then((image) => {
        res.json({ error: null, uuid: image.getDataValue('uuid') });
        recordAudit(AuditLog, req, {
          action: 'media.upload',
          target: req.file.originalname || image.getDataValue('uuid'),
          detail: `${Math.round(imageBuffer.length / 1024)} KB${width ? ` · ${width}×${height}` : ''}`,
        });
      })
      .catch(next);
    return null; // eslint
  });

module.exports = { router };
