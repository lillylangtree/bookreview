function description_trunc(description){
		var split_desc = description.split("<br>");
		if ( split_desc.length > 1) {
			var more_link= "...<a href='#' id='more'>more</a>"
			var less_link= "   <a href='#' id='less'>less</a>"
		
			$( "#description" ).html(split_desc[0]+more_link);
			$( "#full_description" ).html(description+less_link);
			$("#more").on("click", function (e) {
				$("#full_description").show();
				$("#description").hide();
			});
			
			$("#less").on("click", function (e) {
				$("#full_description").hide();
				$("#description").show();
			});
		}
		else
			$( "#description" ).html(split_desc[0]);
	}
	
	function clear_details(){
		console.log("clearing details");
		$("#full_description").empty();
		$("#description").empty();
		$("#title").empty();
		$("#review_results").empty();
		$("#author").empty();
		$("#bookphoto").attr('src','images/blank.png');
		$("#rating").empty();
		$("#ratings_count").empty();
		$( "#isbn" ).empty();
		$( "#published" ).empty();
	}
	function display_reviews(theReviews,theRatings) {
		$("#review_results").empty();
		var review_count = 0;
		theReviews.sort(function(a, b){return a.id - b.id}); 
		theRatings.sort(function(a, b){return a.id - b.id}); 
		for (var i=0;i<theReviews.length;i++){
			if (theReviews[i].text != "") {
				review_count++;
				$("#review_results").append("<hr/>");
				$("#review_results").append("<p>Review by: " + theReviews[i].author + 
													" On: " + theReviews[i].date +
													"     Rating: " +theRatings[i].rating+" Stars</p>");
				$("#review_results").append("<p>"+theReviews[i].text+"</p>");
			}
			}
		if (review_count == 0)
			$("#review_results").append("<p>No Reviews Available</p>");
		$("#review_results a").hide();
	}
	function getBookDetails(isbn,storedBook,callback) {
				var key = "STO3498KRCE6nQSWMR199Q";
				console.log("exiting");
				if (storedBook) {
					$('#store_book').hide();
					$('#delete_book').show();
					}
				else {
					$('#store_book').show();
					$('#delete_book').hide();
					}
							
				console.log("getting details");
				book = { 	book_id:"",
							title:"",
							author:"",
							showimg:"",
							description:"",
							published:"",
							isbn: isbn}
				clear_details();
				$("#review_results").append("<p>retrieving reviews...</p>");	
				$('body').addClass('ui-loading');
                $.mobile.showPageLoadingMsg();
                $( "#isbn" ).text('isbn: ' + isbn);
				 var url = "https://www.goodreads.com/search.xml?key=STO3498KRCE6nQSWMR199Q&q="+book.isbn;
				$.when(
				 $.get("http://query.yahooapis.com/v1/public/yql",
						{
							q: "select * from xml where url=\""+url+"\"",
							format: "xml"
						},
						function(xml){
							console.log("getting book details first");
							
							book.title =$(xml).find("title").text();
							book.author =$(xml).find("name").text();
							book.showimg = $(xml).find("image_url").text();
							book.published = "Published: " + $(xml).find("original_publication_year").text() + "/" +
											$(xml).find("original_publication_month").text() + "/" +
											$(xml).find("original_publication_day").text()
							$( "#title" ).text(book.title);
							$( "#rating" ).text( $(xml).find("average_rating").text() );
							$( "#ratings_count" ).text( $(xml).find('ratings_count').text() );
							$( "#author" ).text(book.author);
							$( "#published" ).text(book.published);
							var imgFound = false;
							if (book.showimg != "") {
								var imgstr = book.showimg.split("/")
								var imgIndex = imgstr.indexOf('nophoto');
								if (imgIndex == -1) {
									$( "#bookphoto" ).attr( "src", book.showimg );
									imgFound = true;
									}
							}
							if (!($(xml).find("best_book").find("id"))[0].innerHTML)
										book.book_id = 	($(xml).find("best_book").find("id"))[0].textContent;
								else
										book.book_id = 	($(xml).find("best_book").find("id"))[0].innerHTML;
							if (!imgFound) {	
								var test_url = "http://www.goodreads.com/book/show/"+book.book_id 
								var yql = "select * from html where url=\""+test_url+"\" and xpath=\'//img[@id=\"coverImage\"]\'"
								$.get("https://query.yahooapis.com/v1/public/yql",
									{
										q: yql,
										format: "xml"
									},
									function(xml){							
										book.showimg =$(xml).find("img").attr('src');
										console.log("getting photo");
										$( "#bookphoto" ).attr( "src", book.showimg );
										}
								);
							}
							//var the_url = encodeURI("https://www.goodreads.com/book/title.xml?author="+author+"&key="+key+"&title="+title);
							var the_url = "https://www.goodreads.com/book/show/"+book.book_id+"?format=xml&key=STO3498KRCE6nQSWMR199Q"
							$.get("http://query.yahooapis.com/v1/public/yql",
							{
								q: "select * from xml where url=\""+the_url+"\"",
								format: "xml"
							},
							function(xml){
								
								$( "#ratings_count" ).text( $(xml).find("book").find('work').find('ratings_count').text() );
								book.description = $(xml).find("book").find('description').text()
								console.log("getting book rating");
								if (!book.description || book.description == "") {
									var test_url = "http://www.goodreads.com/book/show/"+book.book_id 
									yql = "select * from html where url=\""+test_url+"\" and xpath=\'//div[@id=\"description\"]\'"
									$.get("https://query.yahooapis.com/v1/public/yql",
										{
											q: yql,
											format: "xml"
										},
										function(xml){	
											console.log("getting book desc");
											book.description =$(xml).find("results").find("div").find("span").text();
											description_trunc(book.description)
											}
									);									
								}
								else
									description_trunc(book.description)	
								});
								var review_url = "http://www.goodreads.com/book/show/"+book.book_id ;
								yql = "select * from html where url=\""+review_url+"\" and xpath=\'//div[@class=\"review\"]'" ;
								 
								/*var ryql = "select * from html where url=\""+review_url+"\" and xpath=\'//div[@class=\"reviewText stacked\"]/span/span\'"
							*/	
								$.get("https://query.yahooapis.com/v1/public/yql",
										{
											q: yql,
											format: "xml"
										},
										function(rxml){	
							 
											console.log("getting reviews");	
											var review = [];
											var user_reviews = [];
							
											var review_items = $(rxml).find("div");
											var review_items_review_text = $(rxml).find("div").find("div.reviewText").find("span").find("span:first-child");
											var review_items_review_header = $(rxml).find("div").find("div.reviewHeader").find("a.reviewDate");
											 
											var review_items_author = $(rxml).find("div").find(".user");
											var review_item = ""
											var j=0;
											var end_point = review_items.length;
											//only want max 16 reviews
											if (review_items.length > 15)
												end_point = 16;
											var user_review_id;
											var user_review_rating;
											var deferred = [];
											for (var i=0;i < end_point;i++){
												//if (review_items[i].lastChild) {
												//	if (!review_items[i].lastChild.innerHTML)
												//		review_item = review_items[i].lastChild.textContent;
												//	else
												//		review_item = review_items[i].lastChild.innerHTML;
												//	if (review_item == "(less)"){
												//		console.log("reject review")
												//	}
												//	else{
												var aReview = {id:"",text:"",author:"",date:"",rating:""}
												if (!review_items_review_text[i].innerHTML)
													aReview.text = review_items_review_text[i].textContent;
												else
													aReview.text = review_items_review_text[i].innerHTML;
												
												aReview.author = review_items_author[i].innerHTML;
												aReview.date = review_items_review_header[i].innerHTML;
												
												var review_id = review_items_review_header[i].attributes[1].nodeValue.split('/')[3].split('?')[0];
												
												aReview.id = review_id;
												review[i] = aReview;
												
												var user_url = "http://www.goodreads.com/review/show.xml?id="+review_id+"&key=STO3498KRCE6nQSWMR199Q";
												uyql = "select * from html where url=\""+user_url+"\" and xpath=\'//review'" ;	
												deferred.push($.get("https://query.yahooapis.com/v1/public/yql",
													{
														q: uyql,
														format: "xml",
														index: i
													},
													function(uxml){	
														user_review_id = parseInt($(uxml).find("id")[0].innerHTML);
														user_review_rating = $(uxml).find("rating")[0].innerHTML;
														 
														var user_review = {id: user_review_id,rating: user_review_rating};
														user_reviews.push(user_review);
													}
													))
												j++;
												//		}
											}
														//else {
														//	review[j].text ="Rejected Review";
														
														//	j++
														//	}
													//}
													$.when.apply($, deferred).done( function () {
														console.log("completed reviews");
														display_reviews(review,user_reviews);
														$('body').removeClass('ui-loading');
														$.mobile.hidePageLoadingMsg();
													})	
													}
								)
													
																
							}
					).done(function() {
								alert( "goodread retrevial failed" );
							  });
					).then(callback)					
	}				

	function setData(isbn,val) {
	  window.localStorage && window.localStorage.setItem('book-store:'+isbn, val);
	  return this;
	}
	function getAllData(){
		$('#images').empty();
		if (window.localStorage.length > 0) {
            
            for (i = 0; i < window.localStorage.length; i++) {
                key = window.localStorage.key(i);
                if (/book-store:\d+/.test(key)) {
					var find_isbn = key.split(":");
					isbn = find_isbn[1];
					var src_str = "<img class='bookimg'  style='max-width: 8em' data-id='"+isbn+"' src='"+window.localStorage.getItem(key)+"' />"
                    $('#images').append(src_str);
                }
				
            }
			$(".bookimg").addClass("imageDisplay");
			$(".bookimg").on("click", function (e) {
				
				getBookDetails(e.target.dataset.id,true,function(){
					console.log("changing page");
					$.mobile.changePage('#first')});
				
			});
		}
	}
	function getData(isbn) {
	  return window.localStorage && window.localStorage.getItem('book-store:'+isbn);
	}
	function removeData(isbn) {
	  return window.localStorage && window.localStorage.removeItem('book-store:'+isbn);
	}
		
	$(document).ready(function() {
	
		$("#less").hide();
		$("#full_description").hide();
					
		$("#listbooks").on("click", function (e) {
			getAllData();
			$.mobile.changePage('#fourth');
		});
		$("#delete_book").on("click", function (e) {             
				e.preventDefault();
				$.mobile.showPageLoadingMsg();
				if (book) {
				removeData(book.isbn);
				getAllData();
				}
                $.mobile.hidePageLoadingMsg();
				$.mobile.changePage('#fourth');
                
            });	 
		$("#save_event").on("click", function (e) {             
				e.preventDefault();
				$.mobile.showPageLoadingMsg();
				if (book) {
				setData(book.isbn,book.showimg);
				getAllData();
				}
                $.mobile.hidePageLoadingMsg();
				$.mobile.changePage('#fourth');
                
            });
		$("#books").on("click", function (e) {	
			 getAllData();
		});
			 
		$("#viewer").on("click", function (e) {	
			 var viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
			 viewer.load('ISBN:9780979194047',alertNotFound);
			
		});
		$("#test_scan").on("click", function (e) {		
			getBookDetails("9780393351590",false,function(){console.log("changing page");$.mobile.changePage('#first')});		
		});
	});