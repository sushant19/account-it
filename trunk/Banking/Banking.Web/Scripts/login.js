 (function () {
     $(document).ready(function () {
         // removing menu
         $("menu").children().each(function () {
             $(this).remove();
         });
         // putting message in place of menu
         $("menu").append("<h3>Welcome to the point of entrance</h3>");
         // focusing on password field
         $("#codeInput").focus();
         // handling pass code submition
         $("#enter_code_form").submit(function (e) {
             e.preventDefault();
             disableUI();
             // making data
             var code = $('#codeInput').prop('value');
             var hash = Crypto.SHA256(code);
             // sending login info
             $.post('Home/EnterCode', { code: hash }, function (response) {
                 // handling response
                 if (!response.error) {
                     // redirect to home
                     window.location = '/';
                 } else {
                     ui.handleError(response.error);
                 }
             }).error(function () {
                 ui.showError('For some strange(probably, magic?) reason, '
                    + 'ajax reqest could not reach the server. Please, inform system administrator.');
             }).complete(function () {
                 enableUI();
             });
         });
     });

     function disableUI() {
         $("input").each(function () {
             $(this).attr("disabled", "disabled");
             $("#codeInput").addClass("loading");
         });
     }

     function enableUI() {
         $("input").each(function () { $(this).removeAttr("disabled"); });
         $("#codeInput").removeClass("loading");
         $('#codeInput').val('');
         $('#codeInput').focus();
     }
 })();