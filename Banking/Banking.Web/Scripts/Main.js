function showError(message) {
    $('#freeow').freeow("Error", message, { classes: ["smokey", "error"] });
}

function showModal(data) {
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

function assignBehavior(entityName) {

    function parseId(target) {
        var query = { id: Number(target.attr('data-id')) }
        return query;
    }

    // if session expired, then EnterCode will be returned
    // instead of whatever requested, so we need redirect...
    //TODO: right solution to detect if data or document was returned
    function filterResponse(data) {
        if (data.indexOf("DOCTYPE") == -1) {
            return data;
        } else {
            window.location.href = "/authorize";
        }
    }

    // /{Operation}/{View}{Operation}
    function makeUrl(actionName) {
        return '/' + entityName + '/' + actionName + entityName;
    }

    $('tr[data-id]').find('div').live('click', function () {
        var target = $(this).parent().parent();
        target.prop("data-is-editing", "true");
        var url = makeUrl('Edit');

        var query = parseId(target);
        //var before = new Date();
        $.post(url, query, function (data) {
            //var after = new Date()
            //alert(after.getTime() - before.getTime());
            //target.replaceWith(filterResponse(data));
            var data_filtered = filterResponse(data);
            showModal(data_filtered);
        }).error(function () { showError('Edit request failed'); });
    });
//    $('.editButton').live('click', function () {
//        var url = makeUrl('Edit');
//        var target = $(this).parent().parent();
//        var query = parseId(target);
//        //var before = new Date();
//        $.post(url, query, function (data) {
//            //var after = new Date()
//            //alert(after.getTime() - before.getTime());
//            target.replaceWith(filterResponse(data));
//        }).error(function () { alert('fck...'); })
//    });

    $('.deleteButton').live('click', function () {
        var ids = $.map($('tr'), function (row) {
            var checkbox = $(row).find('.itemCheck');
            if (checkbox.prop('checked') == true) {
                return $(row).attr('data-id');
            }
            else {
                return null;
            }
        });
        if (ids.length == 0) {
            showError("Select something first!");
        }
        else if (confirm('Are you sure?')) {
            var url = makeUrl('Delete');
            for (var i = 0; i < ids.length; i++) {
                var query = { id: ids[i] };
                $.post(url, query, function (response) {
                    $('tr').filter('[data-id=\"' + response.id + '\"]').remove();
                }).error(function () { showError('Delete request failed'); });
                //TODO: Sessions?
            }
        }
    });

    $('.saveButton').live('click', function (e) {
        e.preventDefault();
        var url = makeUrl('Save');
        var target = $(this).parent().parent().parent();
        id = target.attr('data-id');
        var views = $('[data-id=' + id + ']');
        var query = parseFields(target);
        //var before = new Date();
        $.post(url, query, function (data) {
            //var after = new Date()
            //alert(after.getTime() - before.getTime());
            //target.replaceWith(filterResponse(data));
            $.modal.close();
            var data_filtered = filterResponse(data);
            if (views.length > 1) {
                views.replaceWith(data_filtered);
            }
            else {
                $("#operations").children('tbody').append(data_filtered);
            }
        }).error(function () { showError('Save request failed'); })
    });

    $('.cancelButton').live('click', function () {
//        var url = makeUrl('View');
//        var target = $(this).parent().parent();
//        var query = parseId(target);
//        //var before = new Date();
//        $.post(url, query, function (data) {
//            //var after = new Date()
//            //alert(after.getTime() - before.getTime());
//            //target.replaceWith(filterResponse(data));
//            $.modal.close();
//        }).error(function () { showError('Cancel request failed'); })
//request not needed — we only hide modal dialog
        $.modal.close();
    });

    $('.createButton').live('click', function () {
        var url = makeUrl('Create');
        //var before = new Date();
        $.post(url, {}, function (data) {
            //var after = new Date()
            //alert(after.getTime() - before.getTime());
            //$('#headings').after(filterResponse(data)); this is old version with putting new item within existing ones table
            var data_filtered = filterResponse(data);
            showModal(data_filtered);
        }).error(function () { showError('Create request failed'); })
    });

}
$(document).ready(function () {
    var target = $(".actionsMenu");
    $(target)
    if (target.length == 0) { return; }
    var topOffset = target.offset().top;
    var leftOffset = target.offset().left;
    var docked = false;
    $(document).scroll(function () {
        var docOffset = $(document).scrollTop();
        if (!docked && docOffset > topOffset - 11) { // 11 cause .actionsMenu_fixed has 10px padding + 1 px for magic, yes this is hardcoding so what?!
            target.parent().append(target.clone().prop("data-cloned", "true").css("visibility", "hidden"));
            target.addClass("actionsMenu_fixed");
            target.css({ top: '0px', left: leftOffset - 11 + 'px' })
            docked = true;
        }
        else if (docked && docOffset <= topOffset - 11) {
            target.removeClass("actionsMenu_fixed");
            $(".actionsMenu").filter("[data-cloned]").remove();
            docked = false;
        }
    });
});