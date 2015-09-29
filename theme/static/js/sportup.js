(function () {
	//=========================================================

	var url = window.location.href.replace(BASEURL + '/', '').split('#')[0];

	if(url != 'search'){
		$('#title').on('keydown', function(e){
			if (e.which === 13) {
				var titleContent = $(this).val();
				if(titleContent != ''){
					window.location = BASEURL + '/search#title=' + titleContent;
				}
			}
		});

		$('#titleBtn').click(function(){
			var titleContent = $('#titleHome').val();
			if(titleContent != ''){
				window.location = BASEURL + '/search#title=' + titleContent;
			}
		});
	}

	defaultImage = BASEURL + '/static/img/barbells.jpg';

	//===========================================================
	
	home = {

		init : function (cnf) {
			this.config = cnf;
			self = this;
			this.bindEventes();
			this.scrollMenu();
			this.generateCategory();
			this.getFeatureClubs();
			this.config.aboutBox.css('height', this.config.window.innerHeight());

			$.ajaxSetup({
				cache : true,
				beforeSend : function() {
					$('.loading').fadeIn(100);
				},
				complete : function() {
					$('.loading').fadeOut(100);
				}
			});
		},

		bindEventes : function () {
			this.config.window.scroll(this.scrollMenu);
			this.config.aboutTop.click(this.generateAboutTop);
			this.config.goToTop.click(this.goToTopAction);
			this.config.category.change(this.changeCategory);
			this.config.newsletterBtn.click(this.newsLetterSubscriber);
		},

		validateEmail : function(email) {
		    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		    return re.test(email);
		},

		newsLetterSubscriber : function () {
			var email = self.config.newsletter.val();
			if(self.validateEmail(email) == false){
				alert('ایمیل شما اشتباه وارد شده است لطفا مجدد وارد نمایید.');
				return;
			}

			$.ajax({
				url : 'https://app.mailerlite.com/api/v1/subscribers/2081231/',
				type : 'POST',
				data : {
					apiKey : '6155b1d49ae1f44661d78c6a2de46adc',
					id : 2081231,
					email : email
				},
				success : function(res) {
					self.config.newsLetterHolder.html('ضمن تشکر از عضویت شما یک ایمیل جهت تایید برای شما ارسال گردید.')
				}

			});
		},

		changeCategory : function () {
			var category = $(this).val();
			if(category != 0){
				window.location = BASEURL + '/search#category=' + category;
			}
		},

		getFeatureClubs : function () {
			$.ajax({
				url : BASEURL + '/api/directory/fav/',
				type : 'GET',
				
				success : function(res) {
					var clubTemplate = self.config.clubTemplate.html();

					self.config.contentHolder.html('');
		            res.forEach(function(club) {

		                var thisTemplate1 = clubTemplate.replace(/<<link>>/g, BASEURL + '/directory/detail/' + club.pk + '/');
		                if(club.imageCollection.length == 0){
		                	var thisTemplate2 = thisTemplate1.replace(/<<img>>/g, defaultImage);
		                }else{
		                	var thisTemplate2 = thisTemplate1.replace(/<<img>>/g, club.imageCollection[0].imageFile);
		                }
		                var thisTemplate3 = thisTemplate2.replace(/<<logo>>/g, club.logo);
		                var thisTemplate4 = thisTemplate3.replace(/<<title>>/g, club.title);

		                self.config.contentHolder.append(thisTemplate4);
		            });
				}
			});
		},

		generateAboutTop : function () {
			self.config.aboutBox.slideDown();
		},

		generateCategory : function () {
			var output = '';
			for(i=0;i < Data.categories.length;i++){
				j = i + 1;
				output += '<option value="'+ j +'">'+ Data.categories[i] +'</option>';
			}
			this.config.category.append(output);
		},

		scrollMenu : function () {
			var varscroll = $(this).scrollTop();

			if($("#about-user:visible").length == 1){
				if(varscroll >= self.config.window.innerHeight()){
					self.config.aboutBox.hide();
					self.config.body.scrollTop(0);
				}
				return;
			}

			if(varscroll >= 600){
				$('.nav').hide();
				$('nav').css('top', 0);
				$('#go-to-top').fadeIn();
			}else{
				$('.nav').show();
				$('nav').removeAttr('style');
				$('#go-to-top').hide();
			}
		},

		goToTopAction : function () {
			self.config.body.animate({scrollTop: 0},'slow');
		}
	}	

	//===============================================
	//
	search = {

		ENTER_KEY : 13,

		ESC_KEY : 27,

		init : function (config) {
			this.cnf = config;
			//hiding boxes==========
			this.cnf.gender.hide();
			this.cnf.priceBar.hide();
			this.cnf.filters.css('height', 160);
			this.cnf.selectHolder.find('select').css('width', 'calc(25% - 4px)');
			//======================
			this.cnf.content.css('height', this.cnf.window.innerHeight() - 155);
			//this.cnf.content.css('height', this.cnf.window.innerHeight() - 231);
			self = this;
			this.generateFilters();
			this.locator();
			this.bindEventes();

			$.ajaxSetup({
				cache : true,
				beforeSend : function() {
					$('.loading').fadeIn(100);
				},
				complete : function() {
					$('.loading').fadeOut(100);
				}
			});

		},

		bindEventes : function () {
			this.cnf.rangeBar.change(this.changeRange);
			this.cnf.gender.change(this.genderChange);
			this.cnf.city.change(this.cityChange);
			this.cnf.region.change(this.districtChange);
			this.cnf.category.change(this.fieldChange);
			this.cnf.genre.change(this.categoryChange);
			this.cnf.title.on('keydown', this.titleChange);
			window.onhashchange = this.locator;
		},

		setUrl : function (urlQuery) {
			url = '';
			var i = 0;
			var max = self.size(urlQuery) - 1;
			for (var key in urlQuery){
				url = url + key + '=' + urlQuery[key];
				if(i != max){
					url += '/';
				}
				i++;
			}
			document.location.hash = url;
		},

		size : function(obj) {
		    var size = 0, key;
		    for (key in obj) {
		        if (obj.hasOwnProperty(key)) size++;
		    }
		    return size;
		},

		genderChange : function () {
			var urlQuery = self.parseUrl(document.location.hash);

			if($(this).val() == 0){
				if(typeof(urlQuery['gender']) != "undefined"){
					delete urlQuery["gender"];
				}
			}else{
				urlQuery['gender'] = $(this).val();
			}	
			
			self.setUrl(urlQuery); 
		},

		cityChange : function () {
			var urlQuery = self.parseUrl(document.location.hash);

			if($(this).val() == 0){
				if(typeof(urlQuery['city']) != "undefined"){
					delete urlQuery["city"];
				}
			}else{
				urlQuery['city'] = $(this).val();
			}	
			
			self.setUrl(urlQuery);
		},

		districtChange : function () {
			var urlQuery = self.parseUrl(document.location.hash);

			if($(this).val() == 0){
				if(typeof(urlQuery['region']) != "undefined"){
					delete urlQuery["region"];
				}
			}else{
				urlQuery['region'] = $(this).val();
			}	
			
			self.setUrl(urlQuery);
		},

		fieldChange : function () {
			var urlQuery = self.parseUrl(document.location.hash);

			if($(this).val() == 0){
				if(typeof(urlQuery['category']) != "undefined"){
					delete urlQuery["category"];
				}
			}else{
				urlQuery['category'] = $(this).val();
			}	
			
			self.setUrl(urlQuery);
		},

		categoryChange : function () {
			var urlQuery = self.parseUrl(document.location.hash);

			if($(this).val() == 0){
				if(typeof(urlQuery['genre']) != "undefined"){
					delete urlQuery["genre"];
				}
			}else{
				urlQuery['genre'] = $(this).val();
			}	
			
			self.setUrl(urlQuery);
		},

		changeRange : function (e) {
			self.cnf.range.html($(this).val());
			var urlQuery = self.parseUrl(document.location.hash);

			if($(this).val() == ''){
				if(typeof(urlQuery['price']) != "undefined"){
					delete urlQuery["price"];
				}
			}else{
				urlQuery['price'] = $(this).val();
			}	
			self.setUrl(urlQuery);
		},

		titleChange : function (e) {
			var urlQuery = self.parseUrl(document.location.hash);
			if (e.which === self.ENTER_KEY) {
				if($(this).val() == ''){
					if(typeof(urlQuery['title']) != "undefined"){
						delete urlQuery["title"];
					}
				}else{
					urlQuery['title'] = $(this).val();
				}	
				
				self.setUrl(urlQuery);
			}
		},

		locator : function () {
			var url = document.location.hash;
			var res = self.parseUrl(url);
			for (var key in res){
				$('#' + key).val(res[key]);
				if(key == 'price'){
					self.cnf.range.html(res[key]);
				}
			}
			self.getData(res);
		},

		getData : function (inputs) {

 			var allData = ['title', 'category', 'genre', 'gender', 'price_min', 'price_max', 'city', 'region']
			req = {};
			for (var i = 0; i < allData.length; i++) {
				var key = allData[i];
				if(typeof(inputs[key]) != 'undefined'){
					req[key] = inputs[key];
				}
			};
			
			$.ajax({
				url : '/api/directory/',
				data : req,
				success : function(res) {
					var clubTemplate = self.cnf.clubTemplate.html();

					self.cnf.content.html('');
		            res.results.forEach(function(club) {
		                var thisTemplate1 = clubTemplate.replace(/<<link>>/g, '#');
						if(club.imageCollection.length == 0){
		                	var thisTemplate2 = thisTemplate1.replace(/<<img>>/g, defaultImage);
		                }else{
		                	var thisTemplate2 = thisTemplate1.replace(/<<img>>/g, club.imageCollection[0].imageFile);
		                }
		                var thisTemplate3 = thisTemplate2.replace(/<<logo>>/g, club.logo);
		                var thisTemplate4 = thisTemplate3.replace(/<<title>>/g, club.title);

		                self.cnf.content.append(thisTemplate4);
		            });
				}
			});
		},

		parseUrl : function (url) {
			var temp = url.replace('#', '');
			if(temp == ''){
				return [];
			}

			var urlQuery = temp.split('/');

			var res = [];
			for (var i = 0; i < urlQuery.length; i++) {
				var key = urlQuery[i].split('=')[0];
				var value = urlQuery[i].split('=')[1];
				res[key] = value;
			};

			return res;
		},

		cityDetector : function (cityname) {
			switch(cityname){
				case "تهران" : {return 1}
				case "قم" : {return 2}
			}
		},

		idToCity : function (cityid) {
			switch(cityid){
				case 1 : {return 'تهران'}
				case 2 : {return 'قم'}
			}
		},

		generateFilters : function () {
			var output = '';
			for(i=1;i<=22;i++){
				output += '<option value="'+ i +'">منطقه '+ i +'</option>';
			}
			this.cnf.region.append(output);

			var output = '';
			for(i=0;i < Data.genre.length;i++){
				j = i + 1;
				output += '<option value="'+ j +'">'+ Data.genre[i] +'</option>';
			}
			this.cnf.genre.append(output);

			var output = '';
			for(i=0;i < Data.categories.length;i++){
				j = i + 1;
				output += '<option value="'+ j +'">'+ Data.categories[i] +'</option>';
			}
			this.cnf.category.append(output);

			var output = '';
			for(i=0;i < Data.city.length;i++){
				j = i + 1;
				output += '<option value="'+ j +'">'+ Data.city[i] +'</option>';
			}
			this.cnf.city.append(output);
		}

	};

	//===============================================

	club = {
		
		init : function (cnf) {
			this.config = cnf;
			self = this;
			this.week = 0;
			this.club = parseInt(document.location.hash.replace('#', ''));
			this.bindEventes();
			this.makeMapHeight();
			this.locator();
		},

		bindEventes : function () {
			this.config.goToCourse.click(this.goToCourseAction);
			this.config.goToSession.click(this.goToSessionAction);
			this.config.goToTop.click(this.goToTopAction);
			this.config.nextWeek.click(this.generateNextWeek);
			this.config.prevWeek.click(this.generatePrevWeek);
			window.onhashchange = this.locator;
		},

		locator : function () {
			self.getData(self.club);
			self.getCourse(self.club);
			self.getSessions(self.club, this.week);
		},

		generateNextWeek : function () {
			if (self.week < self.maxWeek - 1) {
				self.week++;
				self.getSessions(self.club, self.week);
			};
		},

		generatePrevWeek : function () {
			if(self.week > 0){
				self.week--;
				self.getSessions(self.club, self.week);
			}
		},

		makeMapHeight : function () {
			var height = this.config.program1.offset().top - 50;
			var mapTop = this.config.map.offset().top;
			this.config.map.css('height', height - mapTop);
		},

		getData : function (clubId) {
			$.ajax({
				url : BASEURL + '/api/directory/' + clubId + '/',
				type : 'GET',
				//data : {
				//	pk : clubId
				//},
				cache : false,
				success : function(res) {
					$('#club-title').html(res.complexName);
					$('#club-address').html(res.locationAddress[0].address);
					$('#club-phone').html(res.phone + ' | ' + res.cell);
					$('#description').html(res.complexSummary);
					$('#summary').html(res.summary);
					$('#club-web').html('<a href="'+ res.website +'" target="_blank">'+ res.website +'</a>');
					
					$('#subclub-titles').html('<li role="presentation" class="active"><a class="club-item" id="' + res.id + '" role="tab" data-toggle="tab">' + res.title + '</a></li>');
					$('.category-title').html(res.title);

					if(res.clubs.length){
						res.clubs.forEach(function(club){
							$('#subclub-titles').append('<li role="presentation"><a class="club-item" id="' + club.id + '" role="tab" data-toggle="tab">' + club.title + '</a></li>');
						});
					}

					if(res.imageCollection.length){
						$('#image-holder').html('');
						res.imageCollection.forEach(function(image){
							$('#image-holder').append('<div class="item"><img src="' + image.imageFile + '" width="100%"></div>');
						});
						$('#image-holder').find('div.item:first').addClass('active');
					}
					
					self.makeMapHeight();

					//OTHER TABS EVENT
					$('.club-item').click(function(){
						document.location.hash = $(this).attr('id');
					});

					var coordinate = res.locationAddress[0].coordinate.match(/\(.+\)/g)[0].replace('(', '').replace(')', '').split(' ');
					self.googleMap(coordinate[0], coordinate[1]);
				}
			});
		},

		googleMap : function (lat, lang) {
			google.maps.event.addDomListener(window, 'load', initialize(lat, lang));
		},

		getCourse : function (clubId) {
			$.ajax({
				url : BASEURL + '/api/course/' + clubId + '/',
				type : 'GET',
				//data : {
				//	pk : clubId
				//},
				cache : false,
				success : function(res) {
					var sessionTemplate = self.config.courseTemplate.html();

					self.config.courseHolder.html('<tr style="background-color:#888;color:#fff;"><td class="program1-title">برنامه ها</td><td class="program1-title">ظرفیت</td><td class="program1-title">هزینه(ریال)</td><td class="program1-title">جنسیت</td><td class="program1-title">تاریخ شروع</td><td class="program1-title">تاریخ پایان</td><td class="program1-title">مهلت ثبت نام</td><td class="program1-title">ثبت نام</td></tr>');
							            
		            res.forEach(function(course) {

	            		temp = sessionTemplate.replace(/<<title>>/g, course.title);
	            		temp = temp.replace(/<<capacity>>/g, course.remainCapacity);
	            		temp = temp.replace(/<<price>>/g, self.priceSeperator(course.price));
	            		temp = temp.replace(/<<gender>>/g, course.genderLimit);

	            		if (course.usageBeginDate == null) {
	            			temp = temp.replace(/<<begin>>/g, '-');
	            		}else{
	            			temp = temp.replace(/<<begin>>/g, self.readyDate(course.usageBeginDate));
	            		}

	            		if (course.usageEndDate == null) {
	            			temp = temp.replace(/<<end>>/g, '-');
	            		}else{
	            			temp = temp.replace(/<<end>>/g, self.readyDate(course.usageEndDate));
	            		}
	            		
	            		if (course.expiry_date == null) {
	            			temp = temp.replace(/<<deadline>>/g, '-');
	            		}else{
	            			temp = temp.replace(/<<deadline>>/g, self.readyDateTime(course.expiry_date));
	            		}

	            		temp = temp.replace(/<<id>>/g, course.id);
	            		
	            		self.config.courseHolder.append(temp);
		            });

					$('.course-item').click(function(){
						$('#myModal').modal('show');
					});
				}
			});
		},

		readyDate : function (date) {
			var finalDate = toJalaali(parseInt(date.split('-')[0]), parseInt(date.split('-')[1]), parseInt(date.split('-')[2]));
			return finalDate.jy + '/' + finalDate.jm + '/' + finalDate.jd;
		},

		readyDateTime : function (dateTime) {
			var date = dateTime.split('T')[0];
			var finalDate = toJalaali(parseInt(date.split('-')[0]), parseInt(date.split('-')[1]), parseInt(date.split('-')[2]));
			return finalDate.jy + '/' + finalDate.jm + '/' + finalDate.jd;
		},

		getSessions : function (clubId, weekId) {
			self.config.loadingSession.show();
			$.ajax({
				url : BASEURL + '/api/session/schedules/',
				type : 'GET',
				data : {
					club : clubId,
					week : weekId
				},
				cache : false,
				success : function(res) {
					self.config.loadingSession.hide();
					var sessionTemplate = self.config.sessionTemplate.html();

					self.config.sessionsHolder.html('');
					var flag = 1;
					var startHours = 0;
					var endHours = 0;
		            res.forEach(function(session) {
		            	if(flag){
		            		flag = 0;
		            		self.generateTimeTable(session.begin, session.end, session.date, session.day);
		            		startHours = session.begin;
							endHours = session.end;	
							self.maxWeek = session.capacity;
		            	}else{
		            		var right = (session.day + 1) * (self.config.sessions.innerWidth() / 8);
		            		var top = self.generateTop(session.begin, startHours) * 30;
		            		var height = (self.generateDuration(session.begin, session.end) / 2);
		            		var price = self.priceSeperator(session.price);

		            		var theme = sessionTemplate.replace(/<<id>>/g, session.prgid);
		            		theme = theme.replace(/<<top>>/g, top + 'px');
		            		theme = theme.replace(/<<right>>/g, right + 'px');
		            		theme = theme.replace(/<<height>>/g, height + 'px');
		            		theme = theme.replace(/<<price>>/g, price);
		            		theme = theme.replace(/<<begin>>/g, session.begin);
		            		theme = theme.replace(/<<end>>/g, session.end);
		            		theme = theme.replace(/<<capacity>>/g, session.capacity);
		            		
		            		if (session.status == 0) {
		            			theme = theme.replace(/<<backgroundColor>>/g, '#9E9E9E');
		            			theme = theme.replace(/<<noclick>>/g, 'noclick');
		            			theme = theme.replace(/<<title>>/g, '');
		            			theme = theme.replace(/<<popUpContent>>/g, 'data-content="در حال حاضر غیر فعال می باشد"');
		            		}else{
		            			if (session.capacity <= 0) {
		            				theme = theme.replace(/<<title>>/g, '');
		            				theme = theme.replace(/<<noclick>>/g, 'noclick');
		            				theme = theme.replace(/<<popUpContent>>/g, 'data-content="ظرفیت تکمیل است"');
		            			}else{
			            			theme = theme.replace(/<<title>>/g, 'title="برای انتخاب برنامه روی آن کلیک نمایید"');
			            			theme = theme.replace(/<<noclick>>/g, '');
			            			theme = theme.replace(/<<popUpContent>>/g, 'data-content="'+ session.begin +' - '+ session.end +' | ظرفیت : '+ session.capacity +' | قیمت : '+ price +' ریال"');
		            			}
		            		}

		            		if (session.capacity <= 0) {
		            			theme = theme.replace(/<<backgroundColor>>/g, '#FF8A80');
		            		};

		            		self.config.sessionsHolder.append(theme);
		            	}
		            	$('[data-toggle="popover"]').popover();
		            });
				}
			});
		},

		priceSeperator : function(price){
			var str = price.toString();
			res = '';
			var j = 0;
			for (var i = str.length - 1; i >= 0; i--) {
				if(j == 3){
					j = 0;
					res += ',';
				}
				j++;
				res += str[i];
			};
			var finalres = '';
			for (var i = res.length - 1; i >= 0; i--) {
				finalres += res[i];
			};
			return finalres;
		},

		generateTop : function(begin, startHours){
			var start = begin.split(':');
			var init = startHours.split(':');
			var hDiff = start[0] - init[0];
			var mDiff = start[1] - init[1];
			var top = hDiff + (mDiff / 60);
			return top;
		},

		generateDuration : function(begin, end){
			var start = begin.split(':');
			var finish = end.split(':');
			var hDiff = finish[0] - start[0];
			var mDiff = finish[1] - start[1];
			var duration = (hDiff * 60) + mDiff;
			return duration;
		},

		generateTimeTable : function (start, end, date, day) {

			this.config.program2.find('table').html('');
			slices = '<tr>';
			var days = ['ساعت','شنبه','یکشنبه','دوشنبه','سه شنبه','چهارشنبه','پنجشنبه','جمعه'];
			for (var i = 0; i < days.length; i++) {
				var curDate = new Date.parse(date).addDays(i - day - 1).toString("yyyy-MM-dd");
				var exactDate = toJalaali(parseInt(curDate.split('-')[0]), parseInt(curDate.split('-')[1]), parseInt(curDate.split('-')[2]));

				if(i > day){
					slices += '<td class="program2-title">' + days[i] + '<br>' + exactDate.jy + '/' + exactDate.jm + '/' + exactDate.jd + '</td>'; 
				}else{
					slices += '<td class="program2-title">' + days[i] + '</td>';
				}
			};
			slices += '</tr>';
			for (var i = parseInt(start.split(':')[0]); i < parseInt(end.split(':')[0]); i++) {
				var j = i + 1;
				slices += '<tr><td class="hours">'+ i + ' - ' + j +'</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
			};
			this.config.program2.find('table').append(slices);
		},

		goToCourseAction : function () {
			var program1Top = self.config.program1.offset().top;
			self.config.body.animate({scrollTop: program1Top - 100},'slow');
		},

		goToSessionAction : function () {
			var program2Top = self.config.program2.offset().top;
			self.config.body.animate({scrollTop: program2Top - 100},'slow');
		},

		goToTopAction : function () {
			self.config.body.animate({scrollTop: 0},'slow');
		}
	}	


})(jQuery);