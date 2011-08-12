require('./lib/utility.js');
//need express and ejs
var express = require('express'),
	sinaOAuth = require('./lib/sinaOAuth'),
	app = express.createServer();

var userData = {};
var messageArray = [];

function addMessage(message)
{
	if(messageArray.length >20) messageArray.splice(0,1);
	messageArray[messageArray.length] = message;
	
}

function getRandom(max){
    var vNum;
    vNum = Math.random();
    vNum = Math.round(vNum * max);
    return vNum;
}

function createRobots()
{
	function createRobot()
	{
		var userinfo = {};
		userinfo.id = getRandom(10000);
		userinfo.name = 'robot';
		userinfo.longitude = userData.vaio.longitude + (getRandom(100)-50) * 0.0001;
		userinfo.latitude = userData.vaio.latitude + (getRandom(100)-50) * 0.0001;
		userinfo.isVaio = false;
		return userinfo;
	}
	for(var i=0;i<10;i++)
	{
		var robot = createRobot();
		userData[robot.id] = robot;
	}
}

function resetRobot(robot)
{
	robot.longitude = userData.vaio.longitude + (getRandom(100)-50) * 0.0001;
	robot.latitude = userData.vaio.latitude + (getRandom(100)-50) * 0.0001;
}

function resetRobots()
{
	for(var q in userData)
	{
		var robot = userData[q];
		if(!robot) continue;
		if(robot.name != 'robot') continue;
		
		resetRobot(robot);
		
	}
}

function robotsBeginMove()
{
	var speed = 0.00003;
	setInterval(function(){
		if(userData.vaio.isHide) return;
		
		for(var q in userData)
		{
			var robot = userData[q];
			if(!robot) continue;
			if(robot.name != 'robot') continue;
			
			var xDistance = userData.vaio.longitude - robot.longitude;
			var yDistance = userData.vaio.latitude - robot.latitude;
			var distance = Math.sqrt(xDistance*xDistance + yDistance*yDistance);
			
			var xMove = speed * xDistance/distance;
			var yMove = speed * yDistance/distance;

			robot.longitude += xMove;
			robot.latitude += yMove;
			
			if(distance < 0.00003)
				resetRobot(robot);
			
		}
	},1000);	
}

function DetectUsers()
{
	setInterval(function(){
		try
		{
			var now = new Date();
			for(var u in userData)
			{
				if(u == 'vaio') continue;
				if(userData[u] == null) continue;
				if(userData[u].name == 'robot') continue;

				var user = userData[u];

				if(user.tick.dateDiff('s',now) > 5)
				{
					if(user.isVaio) 
					{
						userData.vaio = {};
						userData.vaio.longitude = user.longitude;
						userData.vaio.latitude = user.latitude;
					}
					userData[u] = null;
				}
			}
		}
		catch(exp)
		{
			console.log(exp)
		}

	},5000);	
}

DetectUsers();

app.use(express.logger({ format: ':method :url :status' }));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'bang590' }));
app.use(app.router);

app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
app.use('/client',express.static(__dirname + '/client',{ cache:true}));
app.error(function(err, req, res){
	console.log("500:" + err + " file:" + req.url)
	res.render('500');
});

app.get('/', function(req, res){
	console.log('superwolf');
	res.redirect("client/mapkiller.html");
//	res.sendfile('client/index.html');
});

app.get('/user', function(req, res){
	var sinaoauth = new sinaOAuth();
	sinaoauth.oAuth(req, res, function(error, access_key, access_secret) {
		res.cookie("access_key", access_key);
		res.cookie("access_secret", access_secret);
		console.log('oauth success');
		
		res.sendfile('client/sinauser.html');
	});
});

app.get('/big',function(req,res){
	console.log('big');
	res.redirect('/client/bigscreen.html');
});

app.post('/postmessage',function(req,res){
	var message = JSON.parse(req.param('message'));
	console.log(message);
	addMessage(message);
	res.send({});
	
});

app.get('/messages',function(req,res){
	console.log(messageArray);
	res.send(messageArray);
});

app.get('/sina',function(req,res){
	var sinaoauth = new sinaOAuth(req.cookies.access_key, req.cookies.access_secret);	
	sinaoauth.verify({}, function(err, data) {
		if (err) 
		{
			res.send("auth failed!");			
			return console.log(err);
		}
		
		var userinfo = JSON.parse(data);
	
		res.send(data);
	});
});

app.post('/location',function(req,res){	
	var userinfo = JSON.parse(req.param('userinfo'));

	var result = {success:false};
	var id = userinfo.id;

	if(!userData[id] || userData[id] == null)
	{
		userData[id] = userinfo;
		userData[id].isVaio = false;
	}
	else
	{
		userData[id].longitude = userinfo.longitude;
		userData[id].latitude = userinfo.latitude;
	}

	userData[id].tick = new Date();
	res.cookie("id",id,{maxAge:900000});
	
	if(userData['vaio'].id == id) result = {success:true};
	
	res.send(result);
});

app.post('/get',function(req,res){
	var userinfo = JSON.parse(req.param('userinfo'));
	var id = userinfo.id;
	var result ;
	userData[id].longitude = userinfo.longitude;
	userData[id].latitude = userinfo.latitude;
	
	if(userData.vaio.isHide) result = {success:false};
	else
	{

		//orignaluser lost the vaio
		userData.vaio.isVaio = false;
		userData.vaio.isHide = false;
		
		//set newuser to vaio
		userData.vaio = userData[id];
		userData.vaio.isHide = true;
		userData.vaio.isVaio = true;

		setTimeout(function(){
			userData.vaio.isHide = false;
		},12000);
		
		result = {success:true};
	}
	res.send(result);
	
});

app.get('/enemies',function(req,res){
	res.send(userData);
});

app.post('/vaio',function(req,res){
	res.send({});
	if(userData.vaio) 
	{
		return;
    }
	
	var vaio = JSON.parse(req.param('vaio'));
	vaio.name = 'vaio';
	
	userData.vaio = vaio;
	createRobots();
	robotsBeginMove();
});

app.post('/resetrobots',function(req,res){
	resetRobots();
});

var port = process.env.PORT || 8080;
app.listen(port);
