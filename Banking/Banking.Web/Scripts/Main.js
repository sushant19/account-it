function assignBehavior(entityName) {

    function parseId(target) {
        var query = { id: Number(target.attr('data-id')) }
        return query;
    }

    function makeUrl(actionName) {
        return '/' + entityName + '/' + actionName + entityName;
    }

    $('.editButton').live('click', function () {
        var url = makeUrl('Edit');
        var target = $(this).parent().parent();
        var query = parseId(target);
        //var before = new Date();
        $.post(url, query, function (data) {
            //var after = new Date()
            //alert(after.getTime() - before.getTime());
            target.replaceWith(data);
        }).error(function () { alert('fck...'); })
    });

    $('.deleteButton').live('click', function () {
        var sure = confirm('Are you sure?');
        if (sure == true) {
            var url = makeUrl('Edit');
            var target = $(this).parent().parent();
            var query = parseId(target);
            //var before = new Date();
            $.post(url, query, function () {
               // var after = new Date()
                //alert(after.getTime() - before.getTime());
                target.remove();
            }).error(function () { alert('fck...'); })
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
            target.replaceWith(data);
        }).error(function () { alert('fck...'); })
    });

    $('.cancelButton').live('click', function () {
        var url = makeUrl('View');
        var target = $(this).parent().parent();
        var query = parseId(target);
        //var before = new Date();
        $.post(url, query, function (data) {
            //var after = new Date()
            //alert(after.getTime() - before.getTime());
            target.replaceWith(data);
        }).error(function () { alert('fck...'); })
    });

    $('.createButton').live('click', function () {
        var url = makeUrl('Create');
        //var before = new Date();
        $.post(url, {}, function (data) {
            //var after = new Date()
            //alert(after.getTime() - before.getTime());
            $('#headings').after(data);
        }).error(function () { alert('fck...'); })
    });

}