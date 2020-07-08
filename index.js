const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;

const app = express();


const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParse = require("body-parser");


require("dotenv").config();

app.use(cors());
app.use(bodyParse.urlencoded({ extend: false })); //Soporte para decodificar las url
app.use(bodyParse.json()); //Soporte para codificar json


const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://mail.google.com/'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), listLabels);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}


app.post("/sendmail", async (req, res) => {
  
  const { name, email, phone, message } = req.body;

 

  contentHTML = `
        <h1>Informacion del usuario.</h1>
        <ul>
            <li>Username: ${name}</li>
            <li>Email: ${email}</li>
            <li>Télefono: ${phone}</li>
        </ul>
        <p>${message}</p>
    `;
  //Paso 1 para el correo
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        type: 'OAuth2',
        user: 'migajas11games@gmail.com',
        clientId: '724910978455-mrn54ivccncnnoukgqp8or3n7d6a0ed6.apps.googleusercontent.com',
        clientSecret: 'ryL08emDmMV-qZkGLMHCwH7d',
        refreshToken: '1//0fxoihJoFozeBCgYIARAAGA8SNwF-L9Irrdm1kMoQ2g0p4up2L-7zXhhDd4K1afsQ1I8D5Kdcl4xm0sQMeyrgKxCbj1XSsLTSMJ4',
        accessToken: 'ya29.a0AfH6SMAJXU4xZwmDOdgOxqXGJgNW3UBUjt7cuUOF5zAM5YQfsbKTPgasXRLETF9zsnmKLC0GPMwvxLisFfF0d4li3qUOhR9fblIrBRlzucoFPgVwgLWMzbe06D6v7Od1dtPbPbWslwapdU6mF90YI9Mew8ebiMtTOZk',
        expires:  1593898589740
    }
  });

  //Paso 2
  let mailOptions = {
    from: '"Kamel" <mgajas11games@gmail.com',
    to: "mike11lightbox@gmail.com",
    subject: "Contáctanos",
    html: contentHTML
  };

  //Paso 3
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log("Err ocurs" + err);
      res.send({message:"No se envio el correo por error:" + err});
    } else {
      console.log("Send email");
      res.send({message:"Se envio el correo exitosamente"});
    }
  });

});

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.get("/", (req, res) => res.render("pages/index"));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
