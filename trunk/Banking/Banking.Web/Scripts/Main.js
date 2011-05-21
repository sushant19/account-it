function showError(message) {
    $('#freeow').freeow("Error", message, { classes: ["smokey", "error"] });
}

function assignBehavior(entityName) {

    function parseId(target) {
        var query = { id: Number(target.attr('data-id')) }
        return query;
    }

    // if session expired, then EnterCode will be returned
    // instead of whatever requested, so we need redirect...
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
        alert(target.prop("data-is-editing"))
        var url = makeUrl('Edit');

        var query = parseId(target);
        //var before = new Date();
        $.post(url, query, function (data) {
            //var after = new Date()
            //alert(after.getTime() - before.getTime());
            target.replaceWith(filterResponse(data));
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
        var sure = confirm('Are you sure?');
        if (sure == true) {
            var ids = $.map($('tr'), function (row) {
                var checkbox = $(row).find('.itemCheck');
                if (checkbox.prop('checked') == true) {
                    return $(row).attr('data-id');
                }
                else {
                    return null;
                }
            });
            var url = makeUrl('Delete');
            for (var i = 0; i < ids.length; i++) {
                var query = { id: ids[i] };
                $.post(url, query, function (response) {
                    $('tr').filter('[data-id=\"' + response.id + '\"]').remove();
                }).error(function () { showError('Delete request failed'); });
            }
        }
    });

    $('.saveButton').live('click', function () {
        var url = makeUrl('Save');
        var target = $(this).parent().parent();
        var query = parseFields(target);
        //var before = new Date();
        $.post(url, query, function (data) {
            //var after = new Date()
            //alert(after.getTime() - before.getTime());
            target.replaceWith(filterResponse(data));
        }).error(function () { showError('Save request failed'); })
    });

    $('.cancelButton').live('click', function () {
        var url = makeUrl('View');
        var target = $(this).parent().parent();
        var query = parseId(target);
        //var before = new Date();
        $.post(url, query, function (data) {
            //var after = new Date()
            //alert(after.getTime() - before.getTime());
            target.replaceWith(filterResponse(data));
        }).error(function () { showError('Cancel request failed'); })
    });

    $('.createButton').live('click', function () {
        var url = makeUrl('Create');
        //var before = new Date();
        $.post(url, {}, function (data) {
            //var after = new Date()
            //alert(after.getTime() - before.getTime());
            $('#headings').after(filterResponse(data));
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