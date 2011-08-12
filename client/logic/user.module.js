$(function() {
    window.User = Backbone.Model.extend({
        defaults: {},
        initialize: function() {
            }
    });


    window.UserView = Backbone.View.extend({
        template: _.template($('#sinauser-template').html()),
        tagName: 'div',
        initialize: function() {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.view = this;
        },
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

	window.user = new User();
    window.userview = new UserView({model:user});
});