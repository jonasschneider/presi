currentSlide = 0;
currentRevealStep = -1;
$(window).load(function () {
  $("#loading").fadeIn();
  $.get("presentation.md", function(data) {
    conv = new Showdown.converter();
    slides = data.split(/\n[^\\]\+\+/)
    
    $.each(slides, function() {
      text = this
      classes = (a=this.match(/^([a-zA-Z ]+)\+/)) && a[1].split(" ") || []
      text = text.replace (/^([a-zA-Z ]+)\+/, '')
      
      text = text.replace(/\n\!(.+)/, "# $1 #")
      
      text = text.replace(/[^\\]\%(.+)/g, "<span data-reveal='true'>$1</span>")
      text = text.replace('\\%', '%')
      
      //console.log(text.match())
      text = text.replace(/@@(ruby|javascript)\n((.*?\n)+?)@@/g, '<pre class="sh_$1">$2</pre>')
      
      
      html = conv.makeHtml(text)
      
      classes.push('slide')
      slide = $("<div class='"+classes.join(" ")+"'>"+html+"</div>")
      
      if(classes.indexOf("incremental") != -1)
        slide.find("li").attr("data-reveal", "true")
      
      $('#presentation').append(slide)
    })
    
    $("[data-reveal]").hide();
    $("#presentation").show()
    //setup manual jquery cycle
    $('#presentation').cycle({
      timeout: 0,
      speed: 300,
      ease: 'easeOutCubic'
    })
    $("#presentation").hide()
    sh_highlightDocument();
    updateInfo();
    
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
    })
    
    $("#loading").fadeOut(function () {
      $("#presentation").fadeIn()
      $("#info").fadeIn()
    })
  })
})

function nextStep() {
  reveals = getSlide(currentSlide, true).find("[data-reveal]")
  
  if(currentRevealStep < reveals.length - 1 && !getSlide(currentSlide, true).hasClass('shown')) 
    {
      currentRevealStep++
      $(reveals[currentRevealStep]).show()
      
    }
  else if(getSlide(currentSlide+1)) {
    getSlide(currentSlide, true).addClass('shown')
    currentSlide++;
    currentRevealStep = -1;
    $('#presentation').cycle(currentSlide, 'scrollUp')
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
    $(reveals[currentRevealStep]).hide()
    currentRevealStep--;
  }
  else if(getSlide(currentSlide-1)) {
    if(currentRevealStep == reveals.length - 1)
      getSlide(currentSlide, true).addClass('shown')
    currentSlide--;
    currentRevealStep = -1;        
    $('#presentation').cycle(currentSlide, 'scrollDown')
  }
  updateInfo();
}

function updateInfo() {
  $("#info").html(currentSlide+1 + "/" + $("#presentation .slide").length)
}