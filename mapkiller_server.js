require('./lib/utility.js');
require('underscore');

//need express and ejs
var express = require('express'),
	sinaOAuth = require('./lib/sinaOAuth'),
	app = express.createServer();
	
var nowjs = require('now'),
	everyone = nowjs.initialize(app);

var userData = {};
var messageArray = [];

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
	var speed = 0.00006;
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
			everyone.now.playerLocationChange(robot.id,robot.latitude,robot.longitude);
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
app.use(app.router);

app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
app.use('/client',express.static(__dirname + '/client',{ cache:true}));
app.error(function(err, req, res){
	console.log("500:" + err + " file:" + req.url)
	res.render('500');
});

app.get('/', function(req, res){
	res.redirect("client/mapkiller.html");
});

// app.get('/now',function(req,res){
// 	res.redirect('/client/test-now.html');
// });

// app.get('/big',function(req,res){
// 	console.log('big');
// 	res.redirect('/client/bigscreen.html');
// });

app.post('/vaio',function(req,res){
	res.send({});
	if(userData.vaio) 
	{
		return;
    }
	
	var vaio = JSON.parse(req.param('vaio'));
	vaio.id = 'vaio';
	vaio.name = 'vaio';
	vaio.isVaio = true;
	vaio.isHide = false;
	userData.vaio = vaio;
	
	createRobots();
	robotsBeginMove();
});

app.post('/resetrobots',function(req,res){
	resetRobots();
});

nowjs.on('connect',function(){
	this.now.enemy(userData);
});

everyone.now.userinfo=function(userinfo)
{
	var id = this.user.clientId;
	console.log(userinfo.id);
	
	userinfo.id = id;
	userData[id] = userinfo;
	userData[id].isVaio = false;
	
	everyone.now.in(userinfo);
}

everyone.now.location = function(latitude,longitude){
	var userinfo = userData[this.user.clientId];
	if(!userinfo) return;
		
	userinfo.longitude = longitude;
	userinfo.latitude = latitude;

	everyone.now.playerLocationChange(userinfo.id,latitude,longitude);
};

everyone.now.logStuff = function(msg){	
	console.log(msg);
	this.now.comeon('superwolf');
}

everyone.now.get = function(callback){
	var id = this.user.clientId;
	if(userData.vaio.isHide) 
		callback(false);
	else
	{	
		if(userData.vaio.id != 'vaio')
		{
			nowjs.getClient(userData.vaio.id,function(){
				this.now.lost();
			});
		}
		
		
		userData.vaio.isVaio = false;
		userData.vaio.isHide = false;
		//set newuser to vaio
		userData.vaio = userData[id];
		userData.vaio.isVaio = true;
		userData.vaio.isHide = true;

		setTimeout(function(){
			userData.vaio.isHide = false;
			everyone.now.vaioShow();
		},5000);

		callback(true);
		everyone.now.playerGet(id);
		
		
	}
}

nowjs.on('disconnect',function(){
	var id = this.user.clientId;
	var userinfo = userData[id];
	
	if(userinfo && userData[id].isVaio)
	{
		var vaio ={};
		vaio.id = 'vaio';
		vaio.name = 'vaio';
		vaio.isVaio = true;
		vaio.isHide = false;
		vaio.latitude = userData[id].latitude;
		vaio.longitude = userData[id].longitude;
		
		userData.vaio = vaio;
		everyone.now.resetVaio();
	}
	delete userData[id];
	everyone.now.out(id);
});


var port = process.env.PORT || 9000;
app.listen(port);