function wrapForBackgroundImage(imageUrl)
{
	return 'url('+imageUrl+')';
}
window.User = Backbone.Model.extend({
	defaults:{name:'HideKiller' ,x:320,y:240,speed:20,isShould:false,"liveImage":"images/21-skull.png","deathImage":"images/22-skull.png"},
	initialize: function() {
		if(!this.get("x"))
			this.set({'x':this.defaults.x});
		if(!this.get("y"))
			this.set({'y':this.defaults.y});
		if(!this.get("liveImage"))
			this.set({'liveImage':this.defaults.liveImage})
		if(!this.get("deathImage"))
			this.set({'deathImage':this.defaults.liveImage})
		if(!this.get("speed"))
			this.set({'speed':this.defaults.liveImage})
		if(!this.get("name"))
			this.get({'name':this.defaults.name});
			
	},
	shouldGet: function(isShould)
	{
	    if (isShould != this.get('isShould'))
		    this.set({
		        isShould: isShould
	    	});
	},
	getImage:function()
	{
		if(this.get('isShould'))
			return wrapForBackgroundImage(this.get('liveImage'));
		else
			return wrapForBackgroundImage(this.get('deathImage'));
	},
	getPosition:function()
	{
		var position = {};
		position.x = this.get('x');
		position.y = this.get('y');
		return position;
	},
	move:function(x,y)
	{
		this.set({x:x,y:y});
	},
	moveTo:function(position)
	{
		this.move(position.x,position.y);
		
	},
	moveToward:function(destination)
	{
		var speed = this.get('speed');
		var currentPosition = this.getPosition();
		var xDistance = destination.x - currentPosition.x;
		var yDistance = destination.y - currentPosition.y;
		var distance = Math.sqrt(xDistance*xDistance + yDistance*yDistance);
		
		if(distance < 20) return;
		
		var xMove = speed * xDistance/distance;
		var yMove = speed * yDistance/distance;
		
		currentPosition.x+=xMove;
		currentPosition.y+=yMove;
		
		
		this.moveTo(currentPosition);
	}
});


window.Enemy = User.extend({
	getImage:function()
	{
		return wrapForBackgroundImage('images/12-eye.png');
	}
});


window.UserView= Backbone.View.extend({
	template: _.template(""),
	initialize: function() {
		this.el = $("<div class='' style='position:absolute;background-repeat:no-repeat;right:0px;top:0px;width:30px;height:30px;'><div>");
		_.bindAll(this, 'render');
		this.model.bind('change', this.render);
		this.model.view = this;
	},
	timer:null,
	render:function(){
		var _self = this;
		$(_self.el).css({
		    left: _self.model.get('x'),
		    top: _self.model.get('y'),
		    'background-image': _self.model.getImage()
		});
		var flag = true;
		return this;
	}
});