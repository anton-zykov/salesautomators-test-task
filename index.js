const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.json());

const PORT = 1800;

const pipedrive = require('pipedrive');

const apiClient = new pipedrive.ApiClient();

require('dotenv').config();
let oauth2 = apiClient.authentications.oauth2;
oauth2.clientId = process.env.CLIENT_ID;
oauth2.clientSecret = process.env.CLIENT_SECRET;
oauth2.redirectUri = process.env.REDIRECT_URI;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://managerial-drawbridge.pipedrive.com/');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.get('/', async (req, res) => {
  if (req.session.accessToken !== null && req.session.accessToken !== undefined && req.session.accessToken !== '') {
    res.redirect('/iframe/main.html');
  } else {
    const authUrl = apiClient.buildAuthorizationUrl();
    res.redirect(authUrl);
  }
});

app.get('/callback', (req, res) => {
  const authCode = req.query.code;
  const promise = apiClient.authorize(authCode);

  promise.then(() => {
    res.cookie('accessToken', apiClient.authentications.oauth2.accessToken, {
      sameSite: 'None',
      secure: true
    });
    res.cookie('refreshToken', apiClient.authentications.oauth2.refreshToken, {
      sameSite: 'None',
      secure: true
    });

    res.redirect('/');
  }, (exception) => {
    console.error(exception.message);
  });
});

app.post('/iframe/create', async (req, res) => {
  apiClient.authentications.oauth2.accessToken = req.cookies['accessToken'];
  apiClient.authentications.oauth2.refreshToken = req.cookies['refreshToken'];

  console.log(apiClient.authentications.oauth2);
  console.log(req);

  let apiInstance = new pipedrive.DealsApi(apiClient);
  let opts = pipedrive.NewDeal.constructFromObject(req.body);
  apiInstance.addDeal(opts).then((data) => {
    //console.log('Success', data);
    res.json(data);
  }, (error) => {
    console.log(error);
    res.status(400).json(error);
  });
});

app.get('/iframe/:resource', async (req, res) => {
  res.sendFile(path.join(__dirname, `/iframe/${req.params.resource}`));
});