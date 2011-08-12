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
var vaio,vaioMarker;
var isVaio;
var isFirstTime = true;

var enemies = [];
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

function onSuccess(position) {
    //    longitude = position.coords.longitude + (getRandom(100)-50) * 0.0001;
    //    latitude = position.coords.latitude + (getRandom(100)-50) * 0.0001;;

	createCoreUser();
    userinfo.longitude = position.coords.longitude;
    userinfo.latitude = position.coords.latitude;
	console.log(userinfo.longitude);
	console.log(userinfo.latitude);
	
	
    createMap();
	setControl();
	setControlBar();
	resetCoreUser();
	
	initVaio();
	sendLocation();
	getEnemies();
	
	console.log(userinfo.longitude);
	
    google.maps.event.addListener(map, 'idle',
    function() {
		if(isFirstTime)
		{

		}
    });
}

function sendLocation()
{
	setTimeout(function() {		
		var userinfoStr = JSON.stringify(userinfo);
        service.location(function(e) {
				if(!e.success && isVaio)
				{
					$('#lost-layer').show();
					$('#get-layer').hide();
					userMarker.setIcon(youicon);					
				}
				isVaio = e.success;	
				sendLocation();
		},
        {
			userinfo:userinfoStr
        });
		checkGetVaio();
    },
    1000);	
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
	if (!vaio || isVaio || vaio.isHide)
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

function setVaio(vaioinfo)
{
	if(!vaioMarker)
	{
		vaioMarker = new google.maps.Marker({
		    map: map,
			icon: vaioicon
		});
	}
	vaioMarker.setVisible(false);
	
	
	vaio = vaioinfo;
	
	if(!vaio) return;

	if(vaio.id == userinfo.id)
	{ 
		changeStatus(statusBar.run);
		return;
	}
	
	if(vaio.isHide) 
	{
		changeStatus(statusBar.change);
		return;
	}

	vaio = vaioinfo;
	

	
	var latlng = getLatLng(vaio.latitude, vaio.longitude);
	vaioMarker.setTitle(vaioinfo.name)
	vaioMarker.setPosition(latlng);
	vaioMarker.setVisible(true);
	
	changeStatus(statusBar['catch']);
}

function initVaio()
{
	var vaio = {}
	vaio.longitude = userinfo.longitude + (getRandom(100)-50) * 0.00003;
	vaio.latitude = userinfo.latitude + (getRandom(100)-50) * 0.00003;;
	service.vaio(_fn,{
		vaio: JSON.stringify(vaio)
	});
}

function setEnemy(enemyinfo)
{
	var id = enemyinfo.id;
	var latlng = getLatLng(enemyinfo.latitude,enemyinfo.longitude);
		
		
	if(!enemyMarkers[id])
	{
		var marker = new google.maps.Marker({
	      	map: map, 
	      	title: enemyinfo.name,
			icon: otherusericon
	  	});
		enemyMarkers[id] = marker;

	}
	
	enemyMarkers[id].setPosition(latlng);
	
	enemyMarkers[id].isHandled = true;	
}

function setEnemies()
{
	for(var q in enemyMarkers)
	{
		if(enemyMarkers[q] == null) continue;
		enemyMarkers[q].isHandled = false;
	}
    for (var q in enemies)
    {		
        if(q == userinfo.id) continue;
		if(q == 'vaio') continue;
		if(enemies[q] == null) continue;
		if(enemies[q].isVaio) continue;
		
        setEnemy(enemies[q]);	
    }

	for(var q in enemyMarkers)
	{
		if(enemyMarkers[q] == null) continue;
		if(enemyMarkers[q].isHandled) continue;
		
		enemyMarkers[q].setMap(null);
		enemyMarkers[q] = null;
	}

}

function getEnemies()
{
	 service.enemies(function(e) {
			enemies = e;
            setEnemies();
			setVaio(enemies.vaio);
     });

    setInterval(function() {
        service.enemies(function(e) {
			enemies = e;
            setEnemies();
			setVaio(enemies.vaio);
        });
    },
    1000);
}

function beginGetEnemies()
{
	setTimeout(function() {
        service.enemies(function(e) {
			enemies = e;
            setEnemies();
			setVaio(enemies.vaio);
			beginGetEnemies();
        });
    },
    1000);
    
}


function createCoreUser()
{
	userinfo = {
        id: getRandom(10000),
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
		service.get(function(e){
			if(e.success)
			{
				$('#got-layer').show();
				$('#get-layer').hide();
				userMarker.setIcon(youvaioicon);
				for(var q in enemyMarkers)
				{
					if(enemyMarkers[q] == null) continue;
					
					enemyMarkers[q].setIcon(enemyicon);
				}
			}
			isVaio = e.success;
		},{
			userinfo:JSON.stringify(userinfo)
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
    alert('code: ' + error.code + '\n' +
    'message: ' + error.message + '\n');
}

function onBodyLoad() {
    // do your thing!
    try
    {
        service = getService();
		$('#control').hide();
		$('#start-layer').show();
		
		$('#bottom-banner').click(function(){
			$('#control').toggle(200);
		});
		
		$('#start-get-btn').click(function(){
			$('#start-layer').hide();
		})
		
		
		$('#top-banner').click(function(){
			if(isVaio) 
			{
				$('#win-layer').show();
			}
		});
		
		
		$('#win-layer').click(function(){
			$('#win-layer').hide();
		});

		
		var position = {};
		position.coords={};
		position.coords.longitude =  121.5168662;
		position.coords.latitude = 31.2380048;
		
		onSuccess(position);
		
        //navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
    catch(exp)
    {
        alert(exp);
    }
}
