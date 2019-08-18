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
    if (value.name.search(expression) != -1 || value.birthday.search(expression) != -1)
    {
     $('#result').append('<li class="list-group-item link-class"><img src="'+value.image+'" height="40" width="40" class="img-thumbnail" /><span class="text-success"> '+value.name+'<span/> | <span class="text-muted">'+value.birthday+'</span></li>');
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