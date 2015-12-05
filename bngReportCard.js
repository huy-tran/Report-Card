
var ReportCard = {
	/*
	*	Init function where all functions are called
	*	@param {DOM} elem - elements where we want to use plugin
	*	@param {Object} options - users are able to use their own options
	*	@return {jQuery Object} - for jQuery chaining purpose
	*/
	init: function(elem, options) {
		var self = this;

		self.elem = elem; // Store DOM version of element
		self.$elem = $(elem); // Store jQuery version of elememt

		self.settings = $.extend({}, self.defaults, options); // Plugin's settings

		self._loadingStyle(); // Add loading animation to indicate making request

		self.promiseObj = self._makeRequest(self.settings.username); // Promise Obj returned from AJAX request to trigger resolve callback

		self.userData = self.promiseObj.done(function(data){
			var badgesAmount = self.showBadgesAmount(data, self.settings.amounts); // Amount of badges to be displayed
			self.build(data, self.settings, badgesAmount);
			self.displayInfo(data, self.settings); 
			self.styleBadges(data, self.settings, badgesAmount);
		});
		// Display error when something is wrong
		self.promiseObj.fail(function(error){
			self.$elem.html(error);
		})
		return self;
	},
	// Plugin's defaults
	defaults: {
		username: null,
		tooltip: true,
		showInfo: true,
		amounts: 5,
		imgWidth: '128px'
	},
	/*
	*	Create HTML elements for loading effect
	*	@return null
	*/
	_loadingStyle: function(){
		var loadingElems = "<div class='sk-circle'><div class='sk-circle1 sk-child'></div><div class='sk-circle2 sk-child'></div><div class='sk-circle3 sk-child'></div><div class='sk-circle4 sk-child'></div><div class='sk-circle5 sk-child'></div><div class='sk-circle6 sk-child'></div><div class='sk-circle7 sk-child'></div><div class='sk-circle8 sk-child'></div><div class='sk-circle9 sk-child'></div><div class='sk-circle10 sk-child'></div><div class='sk-circle11 sk-child'></div><div class='sk-circle12 sk-child'></div></div>";
		this.$elem.append(loadingElems);
	},
	/*
	*	AJAX request to Codeschool API
	*	@param {String} username - user's username on Codeschool
	*	@return {Object} promise - to invoke done and fail callback functions
	*/
	_makeRequest: function(username) {
		// Display warning when user does not have username in options
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
					elem.children('.sk-circle').show(); // Display loading effect while waiting for data
				},
				success: function(data){	
					promise.resolve(data);
				},
				error: function(){
					var error = "<em class='warning--badges'>Something is wrong. Please check your Username</em>";
					promise.reject(error);
				},
				complete: function(){
					elem.children('.sk-circle').remove();
				}
			});

			return promise;
		}
	},
	/*
	*	If user wants to show all their badges, simply assign -1 to amounts
	*	Otherwise return desired amount of badges
	*	@param {Object} data - fetched from AJAX request
	*	@param {Number} amounts - how many badges to show
	*	@return {Number} amounts - how many badges to show
	*/
	showBadgesAmount: function(data, amounts) {
		return (amounts !== -1) ? amounts : data.courses.completed.length;
	},
	/*
	*	Create core elements for Plugin
	*	@param {Object} data - fetched from AJAX request
	*	@param {Object} settings - plugin's settings after merging
	*	@param {Number} amounts - how many badges to show
	*	@return null
	*/
	build: function(data, settings, amounts) {
		var link = 'https://www.codeschool.com/users/' + settings.username,		
			ul = $("<ul class='bng-badges'></ul>"),
			frag = '';

		for (var i = 0; i < amounts; i++) {
			frag += "<li class='badge'><a target='_blank' href=" + link ;
			// Check if User wants to display Tooltip
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
	/*
	*	Function to  display User's info
	*	@param {Object} data - fetched from AJAX request
	*	@param {Object} settings - plugin's settings after merging
	*	@return {Number} amounts - how many badges to show
	*/
	displayInfo: function(data, settings) {
		if (settings.showInfo) {
			this.$elem.prepend("<h3>I have passed <span>" + data.badges.length + "</span> lessons and scored <span>" + data.user.total_score + "</span> points at CodeSchool!</h3><p>Check some of my latest courses below</p>");
		} else {
			return false;
		}
	},
	/*
	*	Styling badges
	*	@param {Object} data - fetched from AJAX request
	*	@param {Object} settings - plugin's settings after merging
	*	@param {Number} amounts - how many badges to show
	*	@return null
	*/
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
//Douglas Crockford's pattern
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

