/* dependencies */

//  jQuery 1.6+ 
//  jquery-data
//  act.js
//  natural-sort.js
//  ui.js

(function () {

    // *** registering parse functions ***

    act.bind('parse_operation', parseOperation);
    act.bind('parse_person', parsePerson);
    act.bind('parse_backup', parseBackup);

    // *** binding user actions ***

    bindAction('select', 'click', function () {
        var view = findParentView(this);
        toggleSelection(view);
    });

    bindAction('selectAll', 'click', function () {
        var currentControl = $(this);
        var checked = currentControl.attr('checked');
        var entityName = currentControl.parseData('entity');
        var viewName = currentControl.parseData('view');
        var views = $(document).findByData({ view: viewName, entity: entityName }).filter("[data-id]");
        views.each(function () {
            var currentView = $(this);
            if (checked == 'checked') {
                applySelection(currentView);
            } else {
                removeSelection(currentView);
            }
        });
    });

    bindAction('sort', 'click', function () {
        var control = $(this);
        var listName = control.attr('data-sort-list');
        var list = $(document).findByData({ list: listName });
        var keyName = control.attr('data-sort-key');
        var order = control.attr('data-sort-order');
        var elems = $.makeArray(list.children());
        var extractKey = function (elem) {
            var keyContainer = $(elem).findByData({ 'sort-key': keyName });
            var keyValue = keyContainer.attr('data-sort-value');
            if (typeof (keyValue) === 'undefined') {
                keyValue = keyContainer.html();
            }
            return keyValue.toLowerCase();
        };
        var sorted = naturalSort(elems, extractKey);
        list.empty();
        for (i in sorted) {
            if (order === 'descending') {
                list.append(sorted[i]);
            } else {
                list.prepend(sorted[i]);
            }
        }
        // changing sort order attribute for reversing in future
        if (order === 'descending') {
            control.attr('data-sort-order', 'ascending');
        } else {
            control.attr('data-sort-order', 'descending');
        }
    });

    bindAction('create', 'click', function () {
        var entityName = $(this).parseData('entity');
        sendRequest('Create', entityName, {}, function (response) {
            ui.showModal(response);
        });

    });

    bindAction('delete', 'click', function () {
        var entityName = $(this).parseData('entity');
        var selected = $(document).findByData({ selected: 'true', entity: entityName });
        var count = selected.length;
        //TODO: rewrite confirmation to modal
        if (confirm('Delete ' + count + ' ' + entityName + ' forever?')) {
            selected.each(function () {
                var current = $(this);
                var id = current.attr('data-id');
                sendRequest('Delete', entityName, { id: id }, function (response) {
                    var allViews = $(document).findByData({ entity: entityName, id: id });
                    allViews.remove();
                    refreshDeleteControls();
                    $.modal.close();
                });
            });
        }
    });

    bindAction('edit', 'click', function () {
        var view = findParentView(this);
        var entityName = view.parseData('entity');
        var id = view.parseData('id');
        sendRequest('edit', entityName, { id: id }, function (response) {
            ui.showModal(response);
        });
    });

    bindAction('save', 'click', function (event) {
        event.preventDefault();
        var view = findParentView(this, 'edit');
        var entityName = view.parseData('entity');
        view.removeAttr('data-selected'); // delete workaround no longer needed
        var data = act('parse_' + entityName, view); // call by name
        sendRequest('save', entityName, data, function (response) {
            updateEntities(response.affected);
            $.modal.close();
        });
    });

    bindAction('cancel', 'click', function () {
        $.modal.close();
    });

    bindAction('import', 'click', function () {
        sendRequest('import', 'operation', {}, function (response) {
            ui.showModal(response);
        });
    });

    bindAction('saveImport', 'click', function (event) {
        event.preventDefault();
        var view = findParentView(this, 'import');
        var textarea = view.find('textarea');
        var text = textarea.prop('value');
        sendRequest('saveImport', 'operation', { text: text }, function (response) {
            updateEntities(response.affected);
            view.find('.textLeftMessage').html('Text left below was not recognized');
            textarea.attr('value', response.textLeft);
        });
    });

    bindAction('backup', 'click', function (event) {
        sendRequest('create', 'backup', {}, function (response) {
            var backups = $(document).findByData({ list: 'backup' });
            backups.prepend(response);
        });
    });

    bindAction('restoreBackup', 'click', function (event) {
        var message = 'Restore backup? All data will be replaced by data from backup, '
            + 'but current snapshot will be taken.'
        if (confirm(message)) {
            var view = findParentView($(this));
            var id = view.attr('data-id');
            sendRequest('restore', 'backup', { id: id }, function (response) {
                window.location = '/operations';
            });
        }
    });


    // *** helper functions ***

    function updateEntities(data)
    // data is array of descriptors to update: [{entity: person, id: 1}, ...]
    {
        for (i in data) {
            var e_name = data[i].entity;
            var e_id = data[i].id;
            updateExistingViews(e_name, e_id);
            complementLists(e_name, e_id);
        }
        refreshDeleteControls();
    }

    function updateExistingViews(entityName, id) {
        var views = $(document).findByData({ entity: entityName, id: id });
        views.each(function () {
            var view = $(this);
            var viewName = view.parseData('view');
            var data = parseViewData(view);
            sendRequest(viewName, entityName, data, function (response) {
                var existingViews = $(document)
                    .findByData({ entity: entityName, view: viewName, id: id });
                existingViews.replaceWith(response);
            });
        });
    }

    function complementLists(entityName, id) {
        var lists = $(document).findByData({ list: entityName });
        lists.each(function () {
            var list = $(this);
            // list should not contain entity with same id ...
            var existing = list.findByData({ entity: entityName, id: id });
            if (existing.length != 0) {
                return;
            }
            var viewName = list.parseData('view');
            sendRequest(viewName, entityName, { id: id }, function (response) {
                list.prepend(response);
            });
        });
    }

    // envokes func when specified action occurs
    function bindAction(actionName, eventName, func) {
        var controls = $(document).findByData({ action: actionName });
        controls.live(eventName, function (event) {
            func.call(this, event);
        });
    }


    // Posts data to /{controller}/{action} and handles response.error
    function sendRequest(action, controller, data, successCallback) {
        var url = '/' + controller + '/' + action;
        $.post(url, data, function (response) {
            if (response.error) {
                ui.handleError(response.error);
                //ui.showError(response.error);
            } else {
                successCallback(response);
            }
        }).error(function () {
            ui.handleError('AjaxRequestFailure');
            //ui.showError('Request failed: ' + url);
        });
    }

    function applySelection(view) {
        var isSelected = view.parseData('selected');
        if (isSelected != 'true') {
            toggleSelection(view);
        }
    }

    function removeSelection(view) {
        var isSelected = view.parseData('selected');
        if (isSelected == 'true') {
            toggleSelection(view);
        }
    }

    function toggleSelection(view) {
        var isSelected = view.attr('data-selected');
        var control = view.findByData({ action: 'select' }).first();
        if (isSelected == 'true') {
            control.removeAttr('checked');
            view.removeAttr('data-selected');
        } else {
            control.attr('checked', 'checked');
            view.attr('data-selected', true);
        }
        refreshDeleteControls();
    }

    // disables delete controls if nothing selected, changes selectAll checkboxes state
    function refreshDeleteControls() {
        var controls = $(document).findByData({ action: 'delete' });
        controls.each(function () {
            var entityName = $(this).attr('data-entity');
            var allViews = $(document).findByData({ entity: entityName }).filter('[data-id]');
            var selectedViews = allViews.filterByData({ selected: true });
            var selectAllControls = $(document).findByData({ action: 'selectAll', entity: entityName });
            if (selectedViews.length == 0) {
                $(this).attr('disabled', 'disabled');
                selectAllControls.removeAttr('checked');
            } else if (selectedViews.length < allViews.length) {
                $(this).removeAttr('disabled');
                selectAllControls.removeAttr('checked');
            } else {
                $(this).removeAttr('disabled');
                selectAllControls.attr('checked', 'checked');
            }
        });
    }

    function parseOperation(view) {
        var fields = view.find('input[type="text"]');
        var flags = view.find('input[type="checkbox"]');
        var selected = new Array();
        for (i = 0; i < flags.length; i++) {
            if (flags[i].checked == true) {
                selected.push($(flags[i]).attr('data-id'));
            }
        }
        var data = {
            ID: Number(view.attr('data-id')),
            Date: fields[0].value,
            Amount: fields[1].value,
            Mark: fields[2].value,
            Description: fields[3].value,
            Participants: selected,
            Owner: view.attr('data-owner')
        }
        return $.param(data, true);
    }

    function parsePerson(view) {
        var fields = view.find('input');
        var data = {
            ID: Number(view.attr('data-id')),
            Name: fields[0].value
        }
        return $.param(data, true);
    }

    function parseBackup(view) {
        var fields = view.find('input');
        var data = {
            ID: Number(view.attr('data-id')),
            Mark: fields[0].value
        }
        return $.param(data, true);
    }

    // returns object with id and view params (if present) of the view
    function parseViewData(view) {
        var data = {};
        var params = parseViewParams(view);
        if (params != null) {
            data = params;
        }
        var id = $(view).parseData('id');
        data.id = id;
        return data;
    }

    // returns object with props from 'data-view-params' attribute of the view
    function parseViewParams(view) {
        var paramsStr = $(view).parseData('view-params');
        if (paramsStr != null) {
            return $.parseJSON(paramsStr);
        } else {
            return null;
        }
    }

    function findParentView(node, viewName) {
        var selector;
        if (typeof (viewName) != 'undefined') {
            selector = '[data-view=\"' + viewName + '\"]';
        } else {
            selector = '[data-view]';
        }
        return $(node).parents(selector).first();
    }

})();