(function ($) {
    $.fn.parseData = function (name) {
        return this.attr('data-' + name);
    }

    $.fn.findByData = function (values) {
        var matched = null;
        for (name in values) {
            //alert(name + ' ' + values[name]);
            var selector = '[data-' + name + '=\"' + values[name] + '\"]';
            if (matched != null) {
                matched = matched.filter(selector);
            } else {
                matched = this.find(selector);
            }
        }
        return matched;
    }

    $.fn.filterByData = function (values) {
        var matched = this;
        for (name in values) {
            //alert(name + ' ' + values[name]);
            var selector = '[data-' + name + '=\"' + values[name] + '\"]';
            matched = matched.filter(selector);
        }
        return matched;
    }
})(jQuery);