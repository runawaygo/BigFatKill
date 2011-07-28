
Date.prototype.dateAdd = function(interval, number)
 {
    var d = this;
    var k = {
        'y': 'FullYear',
        'q': 'Month',
        'm': 'Month',
        'w': 'Date',
        'd': 'Date',
        'h': 'Hours',
        'n': 'Minutes',
        's': 'Seconds',
        'ms': 'MilliSeconds'
    };
    var n = {
        'q': 3,
        'w': 7
    };
    eval('d.set' + k[interval] + '(d.get' + k[interval] + '()+' + ((n[interval] || 1) * number) + ')');
    return d;
}
Date.prototype.dateDiff = function(interval, objDate2)
 {
    var d = this,
    i = {},
    t = d.getTime(),
    t2 = objDate2.getTime();
    i['y'] = objDate2.getFullYear() - d.getFullYear();
    i['q'] = i['y'] * 4 + Math.floor(objDate2.getMonth() / 4) - Math.floor(d.getMonth() / 4);
    i['m'] = i['y'] * 12 + objDate2.getMonth() - d.getMonth();
    i['ms'] = objDate2.getTime() - d.getTime();
    i['w'] = Math.floor((t2 + 345600000) / (604800000)) - Math.floor((t + 345600000) / (604800000));
    i['d'] = Math.floor(t2 / 86400000) - Math.floor(t / 86400000);
    i['h'] = Math.floor(t2 / 3600000) - Math.floor(t / 3600000);
    i['n'] = Math.floor(t2 / 60000) - Math.floor(t / 60000);
    i['s'] = Math.floor(t2 / 1000) - Math.floor(t / 1000);
    return i[interval];
}

function getRandom(max){
    var vNum;
    vNum = Math.random();
    vNum = Math.round(vNum * max);
    return vNum;
}

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

function createRobots()
{
	for(var i=0;i<10;i++)
	{
		var robot = createRobot();
		userData[robot.id] = robot;
	}
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

function resetRobot(robot)
{
	robot.longitude = userData.vaio.longitude + (getRandom(100)-50) * 0.0001;
	robot.latitude = userData.vaio.latitude + (getRandom(100)-50) * 0.0001;
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


//need express and ejs
var express = require('express'),
	app = express.createServer();

var userData = {};

app.use(express.logger({ format: ':method :url :status' }));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'bang590' }));
app.use(app.router);

app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.error(function(err, req, res){
	console.log("500:" + err + " file:" + req.url)
	res.render('500');
});

console.log(__dirname);

app.use('/client',express.static(__dirname + '/client',{ cache:true}));


app.get('/', function(req, res){
	res.redirect('/client/mapkiller.html');
});

app.get('/client', function(req, res){
	res.redirect('/client/mapkiller.html');
});

app.get('/mobile',function(req,res){
	res.redirect('/client/mapkiller_mobile.html');
	
});

app.get('/big',function(req,res){
	res.redirect('/client/bigscreen.html');
	
});


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
			console.log(u);
			console.log(user);
		
		
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



app.post('/login',function(req,res){
	var userinfo = JSON.parse(req.param('userinfo'));	
	userData[userinfo.id] = userinfo;
	userData[userinfo.id].tick = new Date();
	userData[userinfo.id].isVaio = false;
	res.cookie("id",userinfo.id,{maxAge:900000});
	res.send({});
});

app.get('/enemies',function(req,res){
	res.send(userData);
});

app.post('/resetrobots',function(req,res){
	resetRobots();
});

var port = process.env.PORT || 8080;
app.listen(port);
