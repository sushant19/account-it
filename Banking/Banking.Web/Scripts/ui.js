(function () {
    var ui = {};
    this.ui = ui;

    $(document).ready(function () {
        stickActionsMenu();
        hideSelfLinks();
        activateTableSorter();
    });

    ui.showModal = function (data) {
        $.modal(data, {
            onOpen: function (dialog) {
                dialog.overlay.fadeIn('normal', function () {
                    dialog.container.slideDown('normal', function () {
                        dialog.data.fadeIn('normal');
                    });
                });
            },
            onClose: function (dialog) {
                dialog.data.fadeOut('normal', function () {
                    dialog.container.slideUp('normal', function () {
                        dialog.overlay.fadeOut('normal', function () {
                            $.modal.close(); // must call this!
                        });
                    });
                });
            }
        });
    }

    ui.showError = function () {
        $('#freeow').freeow("Error", message, { classes: ["smokey", "error"] });
    }

    function stickActionsMenu() {
        var target = $(".actionsMenu");
        if (target.length == 0) { return; }
        var padding = 11;     // 11 cause .actionsMenu_fixed has 10px padding + 1 px for magic o_0
        var topOffset = target.offset().top;
        var leftOffset = target.offset().left;
        var docked = false;
        $(document).scroll(function () {
            var docOffset = $(document).scrollTop();
            if (!docked && docOffset > topOffset - padding) {
                target.parent().append(
                target.clone()
                    .prop("data-cloned", "true")
                    .css("visibility", "hidden"));
                target.addClass("actionsMenu_fixed");
                target.css({ top: '0px', left: leftOffset - padding + 'px' })
                docked = true;
            }
            else if (docked && docOffset <= topOffset - padding) {
                target.removeClass("actionsMenu_fixed");
                $(".actionsMenu").filter("[data-cloned]").remove();     // reselecting because of cloning
                docked = false;
            }
        });
    }

    function hideSelfLinks() {
        function hrefSelector(href) {
            return '[href=\"' + href + '\"]';
        }
        var href = window.location.href;
        var pathname = window.location.pathname;
        var search = window.location.search.substring();
        $('a')
            .filter(hrefSelector(href) + ', ' + hrefSelector(pathname + search))
                .each(function () {
                    $(this).replaceWith($(this).html());
                });
    }

    function activateTableSorter() {
        $(".tableView").tablesorter({ headers: { 0: { sorter: false}} });
    }

})();