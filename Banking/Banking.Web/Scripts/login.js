(function () {
    $(document).ready(function () {
        //modifying menu
        $("menu").children().each(function () {
            $(this).remove();
        });
        $("menu").append("<h3>Welcome to the point of entrance</h3>");

        $("#codeInput").focus();

        $("#enter_code_form").submit(function (e) {
            e.preventDefault();
            // disabling inputs
            $("input").each(function () {
                $(this).attr("disabled", "disabled");
            });

            $("#codeInput").addClass("loading");
            // making data
            var code = $('#codeInput').prop('value');
            var hash = Crypto.SHA256(code);
            // sending login info
            $.post('Home/EnterCode', { code: hash }, function (response) {
                if (!response.error) {
                    window.location = '/operations';
                } else {
                    $("input").each(function () { $(this).removeAttr("disabled"); });
                    $("#codeInput").removeClass("loading");
                    ui.handleError(response.error);
                }
            }).error(function () { alert('For some strange(probably, magic?) reason, ajax reqest could not reach the server. Please, inform system administrator.'); })
        });
    });
})();