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

    $('tr[data-id]').find('div').live('dblclick', function () {
        var url = makeUrl('Edit');
        var target = $(this).parent().parent();
        var query = parseId(target);
        //var before = new Date();
        $.post(url, query, function (data) {
            //var after = new Date()
            //alert(after.getTime() - before.getTime());
            target.replaceWith(filterResponse(data));
        }).error(function () { showError('Edit request failed'); });
    });

    $('.editButton').live('click', function () {
        var url = makeUrl('Edit');
        var target = $(this).parent().parent();
        var query = parseId(target);
        //var before = new Date();
        $.post(url, query, function (data) {
            //var after = new Date()
            //alert(after.getTime() - before.getTime());
            target.replaceWith(filterResponse(data));
        }).error(function () { alert('fck...'); })
    });

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