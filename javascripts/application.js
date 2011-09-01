var currentSlide = 0;
var currentRevealStep = -1;
var maxSlideHeight = 0;

$(window).load(function () {
  maxSlideHeight = $("#presentation").height()
  
  $("#loading").fadeIn();
  $.get("presentation.md", function(data) {
    conv = new Showdown.converter();
    slides = data.split(/\n[^\\]\+\+/)
    
    $.each(slides, function() {
      text = this
      classes = (a=this.match(/^([a-zA-Z ]+)\+/)) && a[1].split(" ") || []
      text = text.replace (/^([a-zA-Z ]+)\+/, '')
      
      text = text.replace(/@@(ruby|javascript)\n((.*?\n)+?)@@/g, function(x, lang, code) {
        return '<pre class="sh_'+lang+'">'+code.replace("!", "\\!")+'</pre>' 
      })
      
      text = text.replace(/(\n|^)[^\\]\!(.+)/, "# $2 #")
      text = text.replace('\\!', '!')
      
      text = text.replace(/\n[^\\]\%(.+)/g, "<span data-reveal='true'>$1</span>")
      text = text.replace('\\%', '%')
      
      html = conv.makeHtml(text)
      
      classes.push('slide')
      slide = $("<div class='"+classes.join(" ")+"'>"+html+"</div>")
      
      if(classes.indexOf("incremental") != -1)
        slide.find("li").attr("data-reveal", "true")
      
      $('#presentation').append(slide)
    })
    
    $("[data-reveal]").css("visibility", "hidden");

    sh_highlightDocument();
    
    $(window).keydown(function(event) {
      var key = event.keyCode;
      
      if (key == 37 || key == 33 || key == 38) // Left arrow, page up, or up arrow
        prevStep()
      
      else if (key == 39 || key == 34 || key == 40) // Right arrow, page down, or down arrow
        nextStep()
      
      else if (key == 116) // F5, laser pointer on kensington
        event.preventDefault()
      
      else if (key == 66) { // b, stop button on kensington
        if($("#presentation:visible")[0])
          $("#presentation").fadeOut(function() {
            $("#overlay").fadeIn()
          })
        else
          $("#overlay").fadeOut(function() {
            $("#presentation").fadeIn()
          })
          
      } else if (key == 36) // Pos1
        goToSlide(0)
      
      else if (key == 35) // End
        goToSlide($("#presentation .slide").length-1)
      
    })

	$(window).click(function(event) {

		if($(event.target).attr('href')){
			return true
		}

		nextStep()
	})
    
    // Load a position from hash or start at the first slide
    if (window.location.hash.length > 1) {
  		var page = window.location.hash.split("#")[1]
  		loadState(page)
  	} else
  	  goToSlide(0)
  	
  	  
  	// Showtime!
  	$("#loading").fadeOut(function () {
      $("#presentation").fadeIn()
      $("#info").fadeIn()
    })
    
  })
  
})

function loadState(state) {
  var newSlide = parseInt(state.split(".")[0]);
  var times_stepped = parseInt(state.split(".")[1]);
  
  goToSlide(newSlide)
  
  for(var i = 0; i < times_stepped; i++)
    nextStep();
  
  if(currentRevealStep == getSlide(currentSlide, true).find("[data-reveal]").length - 1)
    getSlide(currentSlide, true).addClass('shown')
}

function saveState() {
  if(currentRevealStep > -1)
    revealPart = "."+(currentRevealStep+1)
  else
    revealPart = "";
  window.location.hash = "#"+currentSlide+revealPart
}


function nextStep() {
  reveals = getSlide(currentSlide, true).find("[data-reveal]")
  
  if(currentRevealStep < reveals.length - 1 && !getSlide(currentSlide, true).hasClass('shown')) 
    {
      currentRevealStep++
      $(reveals[currentRevealStep]).css("visibility", "visible")
      
    }
  else if(getSlide(currentSlide+1)) {
    getSlide(currentSlide, true).addClass('shown')
    
    nextSlide();
    
    if(getSlide(currentSlide, true).hasClass('shown'))
      currentRevealStep = getSlide(currentSlide, true).find("[data-reveal]").length - 1
  }
  updateInfo();
}

function getSlide(num, jq) {
  x = $("#presentation .slide")[num]
  if(jq)
    x = $(x)
  return x;
}

function prevStep() {
  reveals = getSlide(currentSlide, true).find("[data-reveal]")
  if(currentRevealStep > -1 && !getSlide(currentSlide, true).hasClass('shown')) { // we have stepped
    $(reveals[currentRevealStep]).css("visibility", "hidden")
    currentRevealStep--;
  }
  else if(getSlide(currentSlide-1)) {
    if(currentRevealStep == reveals.length - 1)
      getSlide(currentSlide, true).addClass('shown')
    
    prevSlide();
    
    if(getSlide(currentSlide, true).hasClass('shown'))
      currentRevealStep = getSlide(currentSlide, true).find("[data-reveal]").length - 1
  }
  updateInfo();
}

function updateInfo() {
  $("#info").html(currentSlide+1 + "/" + $("#presentation .slide").length)
  saveState()
}

var transitionDuration = 150;

function nextSlide() {
  $("#presentation").queue(function() {
    
    $($(".slide")[currentSlide]).animate({top: -maxSlideHeight}, transitionDuration, function() {
      $(this).hide()
      updateInfo();
      $("#presentation").dequeue();
    })
    
    $($(".slide")[++currentSlide]).show().css({  top: maxSlideHeight }).animate({top: 0}, transitionDuration)
    
    currentRevealStep = -1
    
    updateInfo();
  });
}

function prevSlide() {
  $("#presentation").queue(function() {
    
    $($(".slide")[currentSlide]).animate({top: maxSlideHeight}, transitionDuration, function() {
      $(this).hide()
      updateInfo();
      $("#presentation").dequeue();
    })
    
    $($(".slide")[--currentSlide]).show().css({ top: -maxSlideHeight }).animate({top: 0}, transitionDuration)
    
    currentRevealStep = -1
    
    updateInfo();
  });
}

function goToSlide(num) {
  currentSlide = num;
  $(".slide").hide();
  $($(".slide")[currentSlide]).show().css({top: 0})
  currentRevealStep = -1
  
  updateInfo();
}