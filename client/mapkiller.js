var mapScale = 16;

var statusBar = {
	'catch':'VAIO disapear,to get it!',
	'run': 'Run! Run! Run!',
	'preGet': 'You are nearby the VAIO, keep to get it!',
	'change':'VAIO changed onwner, just wait until it disapear!'
};

var names = ['Canvas', 'LocalStorage', 'Animation', 'Transation', 'HTML5']

var youicon = new google.maps.MarkerImage("images/you-s-63-35.5.png", null, null, new google.maps.Point(35.5, 63));
var vaioicon = new google.maps.MarkerImage("images/vaio-s-68-46.png", null, null, new google.maps.Point(46, 68));
var youvaioicon = new google.maps.MarkerImage("images/you-vaio-s-68-46.png", null, null, new google.maps.Point(46, 68));
var otherusericon = new google.maps.MarkerImage("images/otheruser-s-24.5-26.5.png", null, null, new google.maps.Point(26.5, 24.5));
var enemyicon = new google.maps.MarkerImage("images/enemy-s-24.5-108.5.png",null,null, new google.maps.Point(108.5,24.5));

var map;
var overlay;

var service;

var userinfo,userMarker;
var isVaio;
var vaioId = 'vaio';

var enemies = {};
var enemyMarkers = {};

var _fn = function(){};

function getUserPosition()
{
	return getLocationOnContainer(userinfo.longitude,userinfo.latitude);
}

function getLocationOnContainer(longitude, latitude)
 {
    var latlng = new google.maps.LatLng(latitude, longitude);
    return overlay.getProjection().fromLatLngToContainerPixel(latlng);
}

function getLatLng(latitude,longitude)
{
	return new google.maps.LatLng(latitude, longitude);
}

function getUserLatLng()
{
	return getLatLng(userinfo.latitude,userinfo.longitude);
	
}

function initScene(position) {
	
	createCoreUser();
    userinfo.longitude = position.coords.longitude;
    userinfo.latitude = position.coords.latitude;
	
    createMap();
	setControl();
	setControlBar();
	resetCoreUser();
	
	initVaio();
	
	console.log(userinfo.longitude);
	
    google.maps.event.addListener(map, 'idle',	function() {});
}

function sendLocation()
{
	setInterval(function() {	
		now.location(userinfo.latitude,userinfo.longitude);
		checkGetVaio();
    },
    200);	
}

function createMap()
 {
    var latlng = new google.maps.LatLng(userinfo.latitude, userinfo.longitude);

    var myOptions = {
        zoom: mapScale,
        center: latlng,
        mapTypeControl: false,
        navigationControlOptions: {
            style: google.maps.NavigationControlStyle.SMALL
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("mapContainer"), myOptions);
    overlay = new MyOverlay(map);
}

function checkGetVaio()
{
	var vaio = enemies[vaioId];
	
	if (isVaio || vaio.isHide)
 	{
	    $('#get-layer').hide();
	    return;
	}

    var latlng = getUserLatLng();
	var vaioLatlng = getLatLng(vaio.latitude, vaio.longitude);

	
	var distance = distHaversine(latlng, vaioLatlng) * 1000;
	console.log(distance);
	
	if (distance <= 20)
	{
		$('#get-layer').show();
		changeStatus(statusBar.preGet);
	}
	else
	{
	 	$('#get-layer').hide();	
		changeStatus(statusBar['catch']);
	}
}

function initVaio()
{
	var vaio = {};
	vaio.longitude = userinfo.longitude + (getRandom(100)-50) * 0.00001;
	vaio.latitude = userinfo.latitude + (getRandom(100)-50) * 0.00001;
	vaio.isVaio = true;
	vaio.isHide = false;
	service.vaio(_fn,{
		vaio: JSON.stringify(vaio)
	});
}

function setEnemy(enemyinfo)
{
	var id = enemyinfo.id;
	enemies[id] = enemyinfo;
	
	var latlng = getLatLng(enemyinfo.latitude,enemyinfo.longitude);
		
	if(!enemyMarkers[id])
	{
		var marker = new google.maps.Marker({
	      	map: map, 
	      	title: enemyinfo.name,
	  	});
		var icon = enemyinfo.isVaio ? vaioicon : otherusericon;
		marker.setIcon(icon);
		
		enemyMarkers[id] = marker;
	}
	
	enemyMarkers[id].setPosition(latlng);
}

function setEnemies()
{
    for (var q in enemies)
    {		
        if(q == userinfo.id) continue;
		
        setEnemy(enemies[q]);	
    }
}

function createCoreUser()
{
	userinfo = {
        name: names[getRandom(names.length)],
    }
}

function resetCoreUser()
{
	if(!userMarker)
	{
		userMarker = new google.maps.Marker({
	      	map: map, 
	      	title: userinfo.name,
			icon: youicon
	  	});
	}
	
	userMarker.setPosition(getUserLatLng());
}

function setControl()
{
	$(".goon-btn").click(function(){
		$(".message-layer").hide();
	});
	$('#got-goon-btn').click(function(){
		var i = 0;
		var tick = setInterval(function(){
			for(var q in enemyMarkers)
			{
				if(enemyMarkers[q] == null) continue;
				enemyMarkers[q].setIcon(i%2==1?enemyicon:otherusericon);
			}
			
			i++;
			if(i>8) clearTimeout(tick);
		},400);
	});
	
	$('#get-btn').click(function(){
		now.get(function(success)
		{
			if(success)
			{
				$('#got-layer').show();
				$('#get-layer').hide();
				userMarker.setIcon(youvaioicon);
				for(var q in enemyMarkers)
				{
					enemyMarkers[q].setIcon(enemyicon);
				}
			}
			isVaio = success;
		});
	});
}

function setControlBar()
{
	var speed = 4 * 0.00001;
    var timer = null;
    function beginMove(method)
    {
        clearInterval(timer);
        timer = setInterval(method, 100);
    }
    function endMove()
    {
        clearInterval(timer);	
    }
    $('.pan_up').hover(function() {
        beginMove(function() {
			userinfo.latitude +=speed;
			resetCoreUser();
			
        });
    },
    endMove);

    $('.pan_down').hover(function() {
        beginMove(function() {
			userinfo.latitude -= speed;
			resetCoreUser();
        });
    },
    endMove);

    $('.pan_lt').hover(function() {
        beginMove(function() {
			userinfo.longitude -= speed;
			resetCoreUser();
        });
    },
    endMove);

    $('.pan_rt').hover(function() {
        beginMove(function() {
			userinfo.longitude += speed;
			resetCoreUser();
		});
    },
    endMove);
}

function changeStatus(statusInfo)
{
	$('#status').html(statusInfo);
}

function onError(error) {
    alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
}

function initServiceCallback()
{
	now.enemy = function(e) {
		enemies = e;
     	setEnemies();
    };

	now.in = function(playerInfo)
	{
		setEnemy(playerInfo);
	}
	
	now.playerLocationChange = function (playerId, latitude, longitude)
	{
		if(playerId != userinfo.id)
		{
			var player = enemies[playerId];
			player.latitude = latitude;
			player.longitude = longitude;
			
			setEnemy(player);
			
		}
	};
	
	now.lost= function()
	{
		$('#lost-layer').show();
		$('#get-layer').hide();
		userMarker.setIcon(youicon);					
	}
	
	now.playerGet = function(playerId)
	{
		if(vaioId == 'vaio')
		{
			enemyMarkers['vaio'].setVisible(false);
		}		
		
		if(playerId != userinfo.id)
		{
			isVaio = false;
			vaioId = playerId;

			enemies[vaioId].isHide = true;
			userMarker.setIcon(youicon);
			enemyMarkers[playerId].setIcon(vaioicon);
			enemyMarkers[playerId].setVisible(false);
		}
	}
	
	now.vaioShow = function()
	{
		enemies[vaioId].isHide = false;
		enemyMarkers[vaioId].setVisible(true);
	}
	
	now.resetViao = function(vaio)
	{
		enemies.vaio = vaio;
		setEnemy(vaio);
	}
	
	now.out = function(playerId)
	{
		enemyMarkers[playerId].setVisible(false);
		delete enemies[playerId];
		delete enemyMarkers[playerId];
	};
	
	now.ready(function(){
		userinfo.id = now.core.clientId;
		now.userinfo(userinfo);
		sendLocation();
	});
}

function initGame()
{
	service = getService();
	//navigator.geolocation.getCurrentPosition(onSuccess, onError);
	var position = {};
	position.coords={};
	position.coords.longitude =  121.5168662;
	position.coords.latitude = 31.2380048;
	
	initScene(position);
	initServiceCallback();
}