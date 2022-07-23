const multer = require('multer');
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();
const fileStorageEngine = multer.memoryStorage();
const upload = multer({
    storage: fileStorageEngine, 
    limits: {fileSize: 20000000}
});


const postUpload = upload.array('post_media', 10);

module.exports = {postUpload, parser};