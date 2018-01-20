const express = require('express');
const Twitter = require('twitter');
const https = require('https');

const port = process.env.PORT || 5000;

var app = express();

var client = new Twitter({
  consumer_key: 'EPe6K550jqwm123eKhzCkaviG',
  consumer_secret: 'iulT1zIm2Lnk1czoHQgMdmAMoVRrAyd6KuXm8iYDxErKGkFe1b',
  access_token_key: '954548455917137920-TKWp5v477DBTd9hnaVze85iMkVAymRL',
  access_token_secret: '6weqmBeMqq1cnta5lUvALNSceVfrUNWSODeRQNxUOV1So'
});

app.get('/predictions/:coin', async (req, res) => {

  var coin = req.params.coin;

  var tweets = await client.get('search/tweets', {q: coin, count: 90});
  var documents = tweets.statuses
  .map((status, i) => {
    return {
      language: status.lang,
      id: i + 1,
      text: status.text,
    }

  });

  var body = JSON.stringify({documents: documents});

  var response_handler = function (response) {
    var body = '';
    response.on ('data', function (d) {
      body += d;
    });
    response.on ('end', function () {
      var data = JSON.parse(body);

      var sum = 0;

      data.documents.forEach((doc) => {
        sum += doc.score;
      });

      var chances = sum / data.documents.length;
      res.send({chances});
    });
    response.on ('error', function (e) {
      res.status(400).send(e);
    });
};

  var get_sentiments = function(body) {

    var request_params = {
        method : 'POST',
        hostname : 'westcentralus.api.cognitive.microsoft.com',
        path : '/text/analytics/v2.0/sentiment',
        headers : {
            'Ocp-Apim-Subscription-Key' : '8fc477bb242e429ab9b197bb838553f5',
        }
    };

    var req = https.request(request_params, response_handler);
    req.write(body);
    req.end();
  }

  get_sentiments(body);

});

app.listen(port, () => console.log(`Listening on port ${port}`));
