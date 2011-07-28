MyOverlay.prototype = new google.maps.OverlayView();
MyOverlay.prototype.onAdd = function() {
	var $div = $('<div></div>');
	$div.css({opacity:0.25,'background-color':'black',position:'absolute',width:4000,height:4000,left:-2000,top:-2000});
	this._div = $div[0];
	var panes = this.getPanes();
	panes.mapPane.appendChild(this._div);
 	}
MyOverlay.prototype.onRemove = function() {
    }
MyOverlay.prototype.draw = function() {	
    }
function MyOverlay(map) {
    this.setMap(map);
}

var rad = function(x) {return x*Math.PI/180;}

var distHaversine = function(p1, p2) {
  var R = 6371; // earth's mean radius in km
  var dLat  = rad(p2.lat() - p1.lat());
  var dLong = rad(p2.lng() - p1.lng());

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) * Math.sin(dLong/2) * Math.sin(dLong/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;

  return d.toFixed(3);
}