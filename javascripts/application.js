var currentSlide = 0;
var currentRevealStep = -1;
var maxSlideHeight = 0;

$(window).load(function () {
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
      
      //console.log(text.match())
      
      
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
      }
      
      saveState();
    })
    
    
    if (window.location.hash.length > 1) {
  		var page = window.location.hash.split("#")[1];
  		loadState(page);
  	}
  	
  	
    updateInfo();
	
    $("#loading").fadeOut(function () {
      $("#presentation").fadeIn()
      $("#info").fadeIn()
    })
    
    $("#presentation .slide").css({ position: 'absolute' })
    
    $("#presentation").show()
    $("#presentation .slide").each(function() {
      if($(this).height() > maxSlideHeight)
        maxSlideHeight = $(this).height()
    });
    $("#presentation").hide()
    $("#presentation .slide").hide()
    
    $($(".slide")[0]).show()
    
    $(".slide").css({ height: maxSlideHeight })
    
    $("#presentation").css({ position: 'relative', "height": maxSlideHeight })
    
  })
  
})

function loadState(state) {
  currentSlide = parseInt(state.split(".")[0]);
  currentRevealStep = -1;
  var times_stepped = parseInt(state.split(".")[1]);
  
  for(var i = 0; i < times_stepped; i++)
    nextStep();
  
  if(currentRevealStep == getSlide(currentSlide, true).find("[data-reveal]").length - 1)
    getSlide(currentSlide, true).addClass('shown')
  
  $('#presentation').cycle(currentSlide, 'scrollDown');
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
    currentRevealStep = -1;
    
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
    
    currentRevealStep = -1;
    
    prevSlide();
    
    if(getSlide(currentSlide, true).hasClass('shown'))
      currentRevealStep = getSlide(currentSlide, true).find("[data-reveal]").length - 1
  }
  updateInfo();
}

function updateInfo() {
  $("#info").html(currentSlide+1 + "/" + $("#presentation .slide").length)
}

var transitionDuration = 150;

function nextSlide() {
  $("#presentation").queue(function() {
    
    $($(".slide")[currentSlide]).animate({top: -maxSlideHeight}, transitionDuration, function() {
      $(this).hide()
      $("#presentation").dequeue();
    })
    
    $($(".slide")[++currentSlide]).show().css({  top: maxSlideHeight }).animate({top: 0}, transitionDuration)
    
  });
}

function prevSlide() {
  $("#presentation").queue(function() {
    
    $($(".slide")[currentSlide]).animate({top: maxSlideHeight}, transitionDuration, function() {
      $(this).hide()
      $("#presentation").dequeue();
    })
    
    $($(".slide")[--currentSlide]).show().css({ top: -maxSlideHeight }).animate({top: 0}, transitionDuration)
    
  });
}