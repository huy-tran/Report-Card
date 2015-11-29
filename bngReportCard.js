var ReportCard = {

	init: function(elem, options) {
		var self = this; // Using on Promise Object

		this.elem = elem; // Store DOM version of element
		this.$elem = $(elem); // Store jQuery version of elememt

		this.settings = $.extend({}, this.defaults, options); // Plugin's settings

		this._loadingStyle(); // Add loading animation to indicate making request

		this.promiseObj = this._makeRequest(this.settings.username); // Promise Obj returned from AJAX request to trigger resolve callback

		this.userData = this.promiseObj.done(function(data){
			var badgesAmount = self.showBadgesAmount(data, self.settings.amounts); // Amount of badges to be displayed
			self.build(data, self.settings, badgesAmount);
			self.displayInfo(data, self.settings); 
			self.styleBadges(data, self.settings, badgesAmount);
		})
		
		return this;
	},
	defaults: {
		username: null,
		tooltip: true,
		showInfo: true,
		amounts: 5,
		imgWidth: '128px'
	},
	_loadingStyle: function(){
		var loadingElems = "<div class='sk-circle'><div class='sk-circle1 sk-child'></div><div class='sk-circle2 sk-child'></div><div class='sk-circle3 sk-child'></div><div class='sk-circle4 sk-child'></div><div class='sk-circle5 sk-child'></div><div class='sk-circle6 sk-child'></div><div class='sk-circle7 sk-child'></div><div class='sk-circle8 sk-child'></div><div class='sk-circle9 sk-child'></div><div class='sk-circle10 sk-child'></div><div class='sk-circle11 sk-child'></div><div class='sk-circle12 sk-child'></div></div>";
		this.$elem.append(loadingElems);
	},
	_makeRequest: function(username) {
		if (!username) {
			this.$elem.html("<em>Please provide your Username on Codeschool</em>");
			return false;
		} else {
			var self = this,
				elem = self.$elem,
				url = 'https://www.codeschool.com/users/' + username + '.json',
				promise = $.Deferred();

			$.ajax({
				url: url,
				dataType: 'jsonp',
				beforeSend: function(){
					elem.children('.sk-circle').show();
				},
				success: function(data){	
					promise.resolve(data);
					console.log(data)
				},
				error: function(error){
					self.$elem.html("<em class='warning--badges'>Something is wrong. Please check your Username</em>");
				},
				complete: function(){
					elem.children('.sk-circle').remove();
				}
			});

			return promise;
		}
	},
	showBadgesAmount: function(data, amounts) {
		return (amounts !== -1) ? amounts : data.courses.completed.length;
	},
	build: function(data, settings, amounts) {
		var link = 'https://www.codeschool.com/users/' + settings.username,		
			ul = $("<ul class='bng-badges'></ul>"),
			frag = '';

		for (var i = 0; i < amounts; i++) {
			frag += "<li class='badge'><a target='_blank' href=" + link ;
			if (this.settings.tooltip) {
				frag += " class='bng-tooltip' data-bng-title='" + data.courses.completed[i].title + "'" ;
			}
			frag += "><img src=" + data.courses.completed[i].badge + " alt='" + data.courses.completed[i].title + "'></a></li>";
		}
		this.$elem
			.append(ul)
			.children('ul.bng-badges')
				.append(frag);
		// Show Tooltip. Users are able to disable by setting false to tooltip option
		if (this.settings.tooltip){
			this.$elem.find('a.bng-tooltip').bngTooltip({'width': 200}); // Tooltip width is set to 200px
		}
		
	},
	displayInfo: function(data, settings) {
		if (settings.showInfo) {
			this.$elem.prepend("<h3>I have passed <span>" + data.badges.length + "</span> lessons and scored <span>" + data.user.total_score + "</span> points at CodeSchool!</h3><p>Check some of my latest courses below</p>");
		} else {
			return false;
		}
	},
	styleBadges: function(data, settings, amounts) {

		var containerWidth = parseInt(settings.imgWidth, 10) * amounts, // Multiply badge amounts by imgWidth to get containerWidth
			marginTotal = parseInt(this.$elem.find('li.badge').css('margin-left')) * 2 * amounts, // Times 2 for both side margins
			widthTotal = containerWidth + marginTotal; // Get total width so container can be centerred align

		this.$elem.find('img').css('max-width', settings.imgWidth); // Set max-width based on user's option of imgWidth
		if (widthTotal < this.$elem.width()) {
			$('ul.bng-badges').css('width', widthTotal) // Centerred align container
		}
	}
};

if (typeof Object.create !== 'function') {
	Object.create = function(obj) {
		function F(){};
		F.prototype = obj;
		return new F();
	}
}

(function($, window, document, undefined){
	$.plugin = function(name, object) {
		$.fn[name] = function(options) {
			return this.each(function(){
				if (!$.data(this, name)){
					$.data(this, name, Object.create(object).init(this, options));
				}
			});
		}
	}
	$.plugin('reportCard', ReportCard);
})(jQuery, window, document)

