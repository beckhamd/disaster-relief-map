$( document ).ready(function() {
  $('.ui.dropdown').dropdown();

  $('.ui.checkbox').checkbox();

  $('.message .close')
    .on('click', function() {
      $(this).closest('.message').transition('fade');
    });

  $('#warning-message').transition('slide down in', '500ms');
});
