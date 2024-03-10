const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));
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
    req.session.accessToken = apiClient.authentications.oauth2.accessToken;
    req.session.refreshToken = apiClient.authentications.oauth2.refreshToken;
    res.redirect('/');
  }, (exception) => {
    console.error(exception.message);
  });
});

app.post('/iframe/create', async (req, res) => {
  apiClient.authentications.oauth2.accessToken = req.session.accessToken;
  apiClient.authentications.oauth2.refreshToken = req.session.refreshToken;

  let apiInstance = new pipedrive.DealsApi(apiClient);
  let opts = pipedrive.NewDeal.constructFromObject(req.body);
  apiInstance.addDeal(opts).then((data) => {
    console.log('Success', data);
    res.json(data);
  }, (error) => {
    console.log(error);
    res.status(400).json(error);
  });
});

app.get('/iframe/:resource', async (req, res) => {
  res.sendFile(path.join(__dirname, `/iframe/${req.params.resource}`));
});