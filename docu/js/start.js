 
$(document).ready(function(){
    
    $("* [data-toggle='collapse']").click(function(e){
        
        var el = e.target;
        var collapse = el.getAttribute("data-target");
        $(collapse).collapse();
        
    });
    
});