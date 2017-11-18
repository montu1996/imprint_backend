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

app.get('', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        msg: "Ohk"
    });
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

// Kush's API

app.get('/api/scrape',function(req,resp){
	// var options = {
	// 	args: [req.query.name]
	// };
	// console.log(req.query.name);
	// PythonShell.run('post.py',options, function (err, results) {
	// // results is an array consisting of messages collected during execution 
	// console.log('results: %j', results);
	//  	getComments(req,resp);
	// resp.send("Working on Comments!!");
	  	
	// 	});
	Postscore(req,resp);
});

function getComments(req,resp){
	var options = {
			args: [req.query.name]
	};
	PythonShell.run('comment.py', options, function (err, results1) {
	  	if (err) throw err;
	  	// results is an array consisting of messages collected during execution 
	  	console.log('results1: %j', results1);	
	});
	Postscore(req,resp);
	resp.send("Working on Postscore!!");
}
function Postscore(req,resp){
	MongoClient.connect('mongodb://imprint:montu123@ds127065.mlab.com:27065/imprint',(err,db)=>{
		if(err){
			return console.log('Unable to connect Monogdb Server');
		}
		db.collection("FacebookComment").find({'Name':req.query.name}).toArray().then((results)=>{
		postids = results;
	    update(postids);
	   	},(err)=>{
	   		console.log(err);
	   	})
	  
	});
}
function update(avg){
	MongoClient.connect('mongodb://imprint:montu123@ds127065.mlab.com:27065/imprint',(err,db)=>{
		if(err){
				return console.log('Unable to connect Monogdb Server');
				}
	   	for(i=0;i<avg.length;i++){
	   		u1(avg[i].PostID);
	   	}
		db.close();
		});	
}
function u1(results){
	var k1 = results;
	MongoClient.connect('mongodb://imprint:montu123@ds127065.mlab.com:27065/imprint',(err,db)=>{
	if(err){
		return console.log('Unable to connect Monogdb Server');
	}
	   									
	db.collection('FacebookComment').find({'PostID':results}).toArray().then((results)=>{
	sum=0
	for(i=0;i<results.length;i++){
	sum=sum+results[i].Commentscores
	}
	global.avg = sum/results.length;
	console.log(avg);
	},(err)=>{
		console.log(err);
	});
	db.close();
	});	
	updated(k1,avg);
}
function updated(k1,avg){
	MongoClient.connect('mongodb://imprint:montu123@ds127065.mlab.com:27065/imprint',(err,db)=>{
	if(err){
	return console.log('Unable to connect Monogdb Server');
	}
	db.collection('FacebookPost').findOneAndUpdate({
	'PostID' : k1
	},{
	$set : {
	'Postscores' : avg
	}
	}).then((results1)=>{
	console.log(results1);
	});
	db.close();
	});	
}
function postcategorize(){
	MongoClient.connect('mongodb://imprint:montu123@ds127065.mlab.com:27065/imprint',(err,db)=>{
	if(err){
	return console.log('Unable to connect Monogdb Server');
	}
     var r1 = db.collection('FacebookPost').aggregate([{$group : { _id : '$Postscores',count : { $sum :1}}}])
     r1.toArray.then((results)=>{
     	console.log(results);
     },(err)=>{
     	console.log(err);
     })
   });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//API which gives number of post per sentiment.. Pass the page's username and it will return a json responce with
//an array of 5 element.. 
app.get('/api/getGroupWiseScores',function(req,resp){
	groupscores(req.query.name,req,resp);
});

function groupscores(Name,req,resp){
    
    MongoClient.connect('mongodb://imprint:montu123@ds127065.mlab.com:27065/imprint',(err,db)=>{
            if(err){
                resp.send({
                    status_code: 500,
                    data: {
                        msg: "can't connect to the mongodb"
                    }
                });
            }
            console.log('Connected to server');
            if(Name == undefined)
            {
                resp.send({
                status_code: 400,
                data: {
                    msg: "Field Missing"
                }
                });
            }
            var r1 = db.collection('FacebookPost').aggregate([{$match : { 'Name' : Name}},{$group : { _id : '$Postscores',count : {$sum : 1}}}]);
            r1.toArray().then((results)=>{
                resp.send({
                                status_code: 200,
                                data: {
                                    "msg":results
                                }
                            });
            },(err)=>{
                resp.send({
                                status_code: 404,
                                data: {
                                    msg: "Data Not Found"
                                }
                            });
            })
            db.close();
        });
}
    
//API which gives post and its score date wise in decending.. means latest post first.
//Input Username of FB page..
app.get('/api/getDateWiseScores',function(req,resp){
    var Name = req.query.name;
    MongoClient.connect('mongodb://imprint:montu123@ds127065.mlab.com:27065/imprint',(err,db)=>{
        if(err){
            resp.send({
                status_code: 500,
                data: {
                    msg: "can't connect to the mongodb"
                }
            });
        }
        if(Name == undefined)
        {
            resp.send({
            status_code: 400,
            data: {
                msg: "Field Missing"
            }
            });
        }
        console.log('Connected to server');
        db.collection('FacebookPost').find({'Name':Name},{'Message' : 1 , 'PostCreationTime' : 1 , 'Postscores' : 1}).sort({'PostCreationTime' : -1}).toArray(function (err,results){
            if(err){
                db.close();
                resp.send({
                    status_code: 404,
                    data: {
                        msg: "Data Not Found"
                    }
                });
            }
            else
            {
                db.close();
                resp.send({
                    status_code: 200,
                    data: {
                        msg:results
                    }
                });
            }
        })
    });
});

//API which returns Possitive comments array whoes sentiment value is grater then 2. 
//Input Username of FB page..
app.get('/api/getPossitiveComments',function(req,resp){
	Possitive(req.query.name,req,resp);
});

function Possitive(Name,req,resp){
	MongoClient.connect('mongodb://imprint:montu123@ds127065.mlab.com:27065/imprint',(err,db)=>{
		if(err){
				resp.send({
                status_code: 500,
                data: {
                    msg: "can't connect to the mongodb"
                }
            	});
		}
		if(Name == undefined)
		{
			resp.send({
            status_code: 400,
            data: {
                msg: "Field Missing"
            }
        	});
		}
		db.collection('FacebookComment').find({'Name':Name , 'Commentscores' : { $gt : 2}},{'CommentMessage' : 1}).toArray(function (err,results){
			if(err){
				db.close();
				resp.send({
				status_code: 404,
                data: {
                msg: "Data Not Found"
                }
                });
			}
			else
			{
				db.close();		
				resp.send({
				status_code: 200,
				data: {
					"msg" : results
				}
                });
			}
		})
   });
}

//API which returns Negative comments array whoes sentiment value is lesser then 2. 
//Input Username of FB page..
app.get('/api/getNegativeComments',function(req,resp){
	Negative(req.query.name,req,resp);
});

function Negative(Name,req,resp){
	MongoClient.connect('mongodb://imprint:montu123@ds127065.mlab.com:27065/imprint',(err,db)=>{
		if(err){
			resp.send({
                status_code: 500,
                data: {
                    msg: "can't connect to the mongodb"
                }
            });
		}
		if(Name ==  undefined)
		{
			resp.send({
            status_code: 400,
            data: {
                msg: "Field Missing"
            }
        });
		}
		db.collection('FacebookComment').find({'Name':Name , 'Commentscores' : { $lt : 2}},{'CommentMessage' : 1}).toArray(function (err,results){
			if(err){
				db.close();
				resp.send({
                            status_code: 404,
                            data: {
                                msg: "Login Data Not Founds"
                            }
                        });
			}
			else
			{
				db.close();		
				resp.send({
                            status_code: 200,
                            data: {
                                "msg":results
                            }
                        });
			}
		})
   });
}

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});