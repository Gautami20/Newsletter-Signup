const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const https = require('https');
const dotenv = require('dotenv').config()

const app = express();
const AUTH = process.env.REACT_APP_AUTH
const X = process.env.REACT_APP_X
const LISTID = process.env.REACT_APP_LISTID

// imaginig currently we are in public folder give relative path to other files
app.use(express.static("public"));
//to get info from signup page user data we have to tell our app to use it 
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/signup.html');
});

app.post('/', function (req, res) {
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;

    const data = {
        //members are array of objects that can be upto 500 according to mailchimp 
        //with these properties each of them having email, status..
        //now we have only single object in our array as we have to subscribe one person at a time
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }]
    }

    const jsonData = JSON.stringify(data);
    //end point where as per api key we have to get us21 same
    const url = `https://${X}.api.mailchimp.com/3.0/lists/${LISTID}`;
    //js object
    const options = {
        method: "POST",
        //api key with some text: as per mailchimp authentication
        auth: AUTH
    }

    //we are posting data in external resource so can't use .get()
    const request = https.request(url, options, function (response) {
        console.log(response)
        if (response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html")
        }
        else {
            res.sendFile(__dirname + "/failure.html")
        }

        response.on("data", function (data) {
            console.log(JSON.parse(data));
        })

    })

    request.on('error', function (error) {
        console.error('Error during the API request:', error);
        res.sendFile(__dirname + '/failure.html');
    });

    request.write(jsonData);
    request.end();
});

app.post("/failure", function (req, res) {
    res.redirect("/")
});

app.listen(process.env.PORT || 3000, function () {
    console.log('This port 3000 is working');
});