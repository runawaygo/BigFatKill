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
