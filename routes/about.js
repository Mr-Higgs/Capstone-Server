const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');

const app = express();

// Bodyparser Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Static folder
app.use(express.static(path.join(__dirname, 'routes')));

// Signup Route
router.post('/about', (req, res) => {
  const { firstName, lastName, email } = req.body;

  // Make sure fields are filled
  if (!firstName || !lastName || !email) {
    res.redirect('/fail');
    return;
  }

  // Construct req data
  const data = {
    members: [
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };
 
  const postData = JSON.stringify(data);

  fetch(`https://<dc>.api.mailchimp.com/3.0/lists/6c81428551`, {
    method: 'POST',
    headers: {
    Authorization: `auth ${API_KEY}`
    },
    body: postData
  })
    .then(res.statusCode === 200 ?
      res.redirect('/success') :
      res.redirect('/fail'))
    .catch(err => console.log(err))
})


module.exports = router;