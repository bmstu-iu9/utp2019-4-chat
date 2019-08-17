$(document).ready(function()
// connection between the files
{
	// ussual set up for ajax
 $.ajaxSetup({ cache: false });
 $('#search').keyup(function()
 {
  $('#result').html('');
  $('#state').val('');
  //html and val
  var searchField = $('#search').val();
  var expression = new RegExp(searchField, "i");
  $.getJSON('data.json', function(data)
// change it depending on the new name  
  {
   $.each(data, function(key, value)
   {
	   // statment for checking the username and email 
	   // needs to be changed depending on the json file
    if (value.username.search(expression) != -1 || value.email.search(expression) != -1)
    {
     $('#result').append('<li class="list-group-item link-class">'+value.username+' | <span class="text-muted">'+value.email+'</span></li>');
    }
	// atributes for the waterfall list where the username stands 
   }
   );   
  }
  );
 }
 );
 
 $('#result').on('click', 'li', function() 
 {
  var click_text = $(this).text().split('|');
  // splitting the output
  $('#search').val($.trim(click_text[0]));
  $("#result").html('');
 }
 );
}
);