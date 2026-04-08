const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'docket-factory/scripts',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
  },
});

const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'docket-factory/audio',
    allowed_formats: ['mp3', 'wav', 'ogg', 'm4a'],
    resource_type: 'video',
  },
});

const uploadPDF = multer({ storage: pdfStorage });
const uploadAudio = multer({ storage: audioStorage });

module.exports = { uploadPDF, uploadAudio };
