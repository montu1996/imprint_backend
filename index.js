const {MongoClient, ObjectID} = require('mongodb');
const express = require('express');
var cors = require('cors')
var app = new express();
var bodyParser = require('body-parser');
var url = "mongodb://imprint:montu123@ds127065.mlab.com:27065/imprint";
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(bodyParser.json());
app.use(cors());
app.set('port', (process.env.PORT || 5000));
const bcrypt = require('bcrypt-nodejs');

var Twitter = require('twitter');
var client = new Twitter({
    consumer_key: 'MWcmQ9U3p6eLjxMv4MF9nN5YC',
    consumer_secret: 'TsJ9F5OYwIv8BaJ2xnn2OyfoTbdbiYXb1I6YzhAviCslH1tZgb',
    access_token_key: '1286536478-3bCTZX29fUjQITYLPSA9GYTRAapSPLEYsvcLh1T',
    access_token_secret: 'ShOYfYLUPs2XhBOOgemO7e3HGz3gtO7mucuWR4QRVI8Hw'
});

app.post('/api/user_registration', urlencodedParser, (request, response) => {
    response.setHeader('Content-Type', 'application/json');

    var email = undefined;
    var password = undefined;
    var cpassword = undefined;

    if(request.body.email)
        email = request.body.email;
    if(request.body.password)
        password = request.body.password;
    if(request.body.confirm_password)
        cpassword = request.body.confirm_password;

    if(email === undefined || password === undefined  || cpassword === undefined  ) {
        response.send({
            status_code: 400,
            data : {
                msg: "Some fields are missing"
            }
        });
        return;
    }

    MongoClient.connect(url, function (err, db) {
        if (err) {
            response.send({
                status_code: 500,
                data: {
                    msg: "can't connect to the mongodb"
                }
            });
            return;
        }
        else {
            if(password===cpassword) {
                db.collection('User').find({"Email" : email}).count().then((count) => {
                    if( count === 0 ) {
                        password = bcrypt.hashSync(password);
                        db.collection('User').insertOne({
                            "Email" : email,
                            "Password" : password
                        }, (err, result) => {
                            response.send({
                                status_code: 500,
                                data : {
                                    msg:"Error in insert"
                                }
                            });
                            return;
                        });
                        response.send({
                            status_code:200,
                            data: {
                                msg:"Successfully Register"
                            }
                        });
                        return;
                    }
                    else {
                        response.send({
                            status_code:400,
                            data: {
                                msg:"Email Already Register!!!"
                            }
                        });
                        return;
                    }
                }, (err) => {
                    response.send({
                        status_code: 500,
                        data: {
                            msg: "Error in Mongodb"
                        }
                    });
                    return;
                });
                
            }
            else {
                response.send({
                    status_code: 400,
                    data: {
                        msg:"Password and confirm password must match"
                    }
                });
                return;
            }         
        }
    });
});

app.post('/api/checkEmail', urlencodedParser, (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    var email = undefined;
    if(request.body.email)
        email = request.body.email;
    if(email === undefined) {
        response.send({
            status_code: 400,
            data : {
                msg: "Email Field Missing"
            }
        });
        return;
    }

    MongoClient.connect(url, function (err, db) {
        if (err) {
            response.send({
                status_code: 500,
                data : {
                    msg: "can't connect to the mongodb"
                }
            });
            return;
        }
        else {
            db.collection('User').find({ Email: email }).count().then((count) => {
                if(count==1) {
                    response.send({
                        status_code: 200,
                        data : {
                            msg: "Email Found"
                        }
                        
                    });
                    return;
                }
                else {
                    response.send({
                        status_code: 404,
                        data: {
                            msg: "Email Not Found"
                        }
                        
                    });
                    return;
                }
            }, (err) => {
                response.send({
                    status_code: 400,
                    data: {
                        msg: "Error in find mongod"
                    }
                });
                return;
            });
        }
    });

});

app.post('/api/login', urlencodedParser, (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    var email = undefined;
    var password = undefined;
    if(request.body.email)
        email = request.body.email;
    if (request.body.password)
        password = request.body.password;
        if(email === undefined || password===undefined) {
        response.send({
            status_code: 400,
            data: {
                msg: "Field Missing"
            }
        });
        return;
    }

    MongoClient.connect(url, function (err, db) {
        if (err) {
            response.send({
                status_code: 500,
                data: {
                    msg: "can't connect to the mongodb"
                }
            });
            return;
        }
        else {
            db.collection('User').find({
                Email: email
            }).toArray().then((data) => {
                if(data.length === 0) {
                    response.send({
                        status_code: 404,
                        data: {
                            msg: "No Data Found"
                        }
                    });
                    return;
                }
                bcrypt.compare(password, data[0].Password, function(err, res) {
                    if(res) {
                        response.send({
                            status_code: 200,
                            data: {
                                msg: "Login Data Found"
                            }
                        });
                        return;
                    }
                    else {
                        response.send({
                            status_code: 404,
                            data: {
                                msg: "Password Must Match"
                            }
                        });
                        return;
                    }
                });
            }, (err) => {
                response.send({
                    status_code: 400,
                    data: {
                        msg: "Error in find mongod"
                    }
                });
                return;
            });
        }
        return;
    });
});

app.post('/api/tweeterLogin', urlencodedParser, (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    var a = undefined;
    if(request.body.screen_name)
        a = request.body.screen_name;
    
    var params = {screen_name: a};
    client.get('users/show', params, function(error, user, res) {
        if (!error) {
            response.send({
                status_code: 200,
                data: {
                    id:user.name,
                    name: user.name,
                    screen_name: user.screen_name,
                    followers: user.followers_count,
                    friends: user.friends_count,
                    status: user.statuses_count,
                    profilepic: user.profile_image_url
                }
            });
            return;
        }
        else {
            response.send({
                status_code: 400,
                data: {
                    msg: "Error in Twitter Api!!"
                }
            });
            return;
        }
    });
});

app.post('/api/getTweets', urlencodedParser, (request, response) => {

    var screenName = undefined;

    if(request.body.screen_name)
        screenName = request.body.screen_name;

    if(screenName === undefined) { 
        response.send({
            status_code: 400,
            data: {
                msg: "Field Missing"
            }
        });
    }

    MongoClient.connect(url, function (err, db) {

        function getUserTweets(screenName) {
            db.collection('TwitterData').find({Screename:screenName.toLowerCase()}).toArray().then( (user) => {
                var lastPostId1 = user[0].lastPostID;
                var param = {screen_name: screenName, count: 200};
                var firstPostID = undefined;
                if(user[0].Post[0] === undefined) {
                    firstPostID = -1;
                }
                else {
                    firstPostID = user[0].Post[0].Postid;
                }   
                if(lastPostId1 !== -1) {
                    param.max_id = lastPostId1;
                }
                function getTweets() {
                    client.get('statuses/user_timeline', param, function(error, tweets, res) {
                        if( tweets.length < 200 ) {
                            if( firstPostID === -1 ) {
                                for(var i in tweets) {
                                    var obj = {
                                        Postid: tweets[i].id,
                                        Description: tweets[i].text,
                                        Createdtime: tweets[i].created_at,
                                        like: tweets[i].favorite_count,
                                        retweetCount: tweets[i].retweet_count,
                                        popularityScore: 0
                                    };
                                    var ans = (obj.retweetCount * 1.5) + obj.like;
                                    obj.popularityScore = ans;
                                    user[0].Post.push(obj);
                                }
                                db.collection('TwitterData').findOneAndUpdate({_id: user[0]._id}, {
                                    $set: {
                                        lastPostID: lastPostId1,
                                        Post: user[0].Post
                                    }
                                }, {
                                    returnOriginal: false
                                }).then((result) => {
                                    response.send({
                                        status_code: 200,
                                        data: user[0]
                                    });
                                });
                            }
                            else {
                                response.send({
                                    status_code: 200,
                                    data: user[0]
                                });
                            }
                            return;
                        }
                        lastPostId1 = tweets[tweets.length-1].id;
                        param.max_id = lastPostId1;

                        for(var i in tweets) {
                            var obj = {
                                Postid: tweets[i].id,
                                Description: tweets[i].text,
                                Createdtime: tweets[i].created_at,
                                like: tweets[i].favorite_count,
                                retweetCount: tweets[i].retweet_count,
                                popularityScore: 0
                            };
                            var ans = (obj.retweetCount * 1.5) + obj.like;
                            obj.popularityScore = ans;
                            user[0].Post.push(obj);
                        }
                        getTweets();
                    });
                }
                getTweets();
            }, (err) => {
                response.send({
                    status_code: 500,
                    data: {
                        msg: "Internal Server Error!!"
                    }
                });
            });
        }

        if(err) {
            response.send({
                status_code: 500,
                data: {
                    msg: "can't connect to the mongodb"
                }
            });
        }

        // screenName = screenName.toLowerCase();

        db.collection('TwitterData').find({Screename:screenName.toLowerCase()}).count().then( (data) => {

            if( data !== 0 ) {
                getUserTweets(screenName);
            }
            else {
                var params = {screen_name: screenName};
                client.get('users/show', params, function(error, user, res) {
                    if(user.errors[0].code === 50) {
                        response.send({
                            status_code: 400,
                            data: {
                                msg: user.errors[0].message
                            }
                        });
                    }
                    var userObj = {
                        User_ID: user.id,
                        Name: user.name,
                        Screename: user.screen_name.toLowerCase(),
                        Follower_count: user.followers_count,
                        Profile_Image: user.profile_image_url,
                        lastPostID: -1,
                        Post: []
                    };
                    db.collection('TwitterData').insertOne(userObj).then(()=> {
                        getUserTweets(screenName);
                    }, (err)=> {
                        response.send({
                            status_code: 500,
                            data: {
                                msg: "Internal Server Error!!"
                            }
                        });
                    });
                });
            }
        }, (err)=> {
            response.send({
                status_code: 400,
                data: {
                    msg: "Error in find mongod"
                }
            });
        });
        
    });
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});