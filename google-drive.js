const fs = require("fs");
const { google } = require("googleapis");
const stream = require("stream");

const GOOGLE_API_FOLDER_ID = process.env.FOLDER_GDRIVE;
//ID da Pasta no Google Drive

async function GDriveUploadFile(file, filename, mimetype) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "./googledrive.json",
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const driveService = google.drive({
      version: "v3",
      auth,
    });

    const fileMetaData = {
      name: filename,
      parents: [GOOGLE_API_FOLDER_ID],
    };

    const media = {
      mimeType: mimetype,
      body: file,
    };

    const response = await driveService.files.create({
      resource: fileMetaData,
      media: media,
      field: "id",
    });
    return response.data.id;
  } catch (err) {
    console.log("Error ao enviar arquivo. Tente novamente.", err);
  }
}

async function GDriveRemoveFile(file_id) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "./googledrive.json",
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const driveService = google.drive({
      version: "v3",
      auth,
    });

    const response = await driveService.files.delete({ fileId: file_id });
    return response.data;
  } catch (err) {
    console.log("Error ao apagar arquivo. Tente novamente.", err);
  }
}

module.exports = { GDriveUploadFile, GDriveRemoveFile };
