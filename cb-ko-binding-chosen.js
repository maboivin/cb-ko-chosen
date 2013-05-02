﻿/*
binding format
data-bind = "table: {
    chosenOption: *** or {***} //the option passed to chosen function when create the chosen
    source: ***, //source items
    valueProp: *** //the property of the items in source that will be used as the value of the option
    selectedValue: *** //the value that user is selected, it can be array
    selectedValueItemProp: the prop of the items in selectedValue array, that will be used to match the value in source
    displayProp: the property of the items in source that will be used as the text of the option
}"
*/
(function () {
    var _ = {
        UO: ko.utils.unwrapObservable
    };

    _.CO = ko.bindingHandlers.chosen = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            if ($(element).prop("tagName") !== "SELECT") {
                throw "chosen binding can be applied only for select";
            }
            $(element).addClass("chzn-select");
            var value = valueAccessor();
            _.CO.updateSelect(element, value);
            
            var chosen;
            if (value.chosenOption) {
                chosen = $(element).chosen(_.UO(value.chosenOption));
            } else {
                chosen = $(element).chosen();
            }
            
            //hack: if the any parent of chosen css is set to "overflow: hidden", 
            //and the parent height is less to show the full chosen input and drop down, then the drowdown can't be show
            //here we add a div in side the form, as the root container, then it is ok
            if ($(element).parent()) {
                //on a modal
            }
            
            chosen.change(function (event, data) {
                _.CO.updateValue(value, $(element).val(), element, allBindingsAccessor);
                //if (ko.isObservable(value.selectedValue)) {
                //    value.selectedValue(data.selected);
                //} else {
                //    throw 'selectedValue must be bound to an observable field';
                //    //we throw this exception is becasue ,value is the binding value, will will copy from the specified property of viewModel
                //    //and if it is not a observable, then just value copy, which will not change the copied property of viewMode
                //    //value.selectedValue = data.selected;
                //}
            });
        },
        
        //set the bound view model property value to the selected value
        updateValue: function (databoundValue, selectedOptionValue, element, allBindingsAccessor) {
            //the value of option is alwasy the index so we must convet it to the corresponding data item
            if ($.isArray(selectedOptionValue) && databoundValue.selectedValueItemProp) {
                throw "Not supported yet";
            }
            var selectedOptionValueArray = [];
            if ($.isArray(selectedOptionValue)) {
                selectedOptionValueArray = selectedOptionValue;
            } else {
                selectedOptionValueArray.push(selectedOptionValue);
            }

            var tmpSetValueArray = [];
            for (var i = 0; i < selectedOptionValueArray.length; i++) {
                if (typeof(selectedOptionValueArray[i]) === "undefined" || selectedOptionValueArray[i] == null) {
                    continue;
                }
                var optionValue = $(element).children("[value=" + selectedOptionValueArray[i] + "]").data("item");
                
                if (typeof (_.UO(databoundValue.valueProp)) !== "undefined") {
                    optionValue = optionValue[_.UO(databoundValue.valueProp)];
                }
                tmpSetValueArray.push(optionValue);
            }
            
            if (ko.isObservable(databoundValue.selectedValue)) {
                //if multi select, then the target must be an observable array, so just update it with the array
                if ($(element).prop("multiple")) {
                    databoundValue.selectedValue(tmpSetValueArray);
                } else {
                    databoundValue.selectedValue(tmpSetValueArray[0]);
                }
                ////if multi select, then the target must be an observable array, so just update it with the array
                //if (tmpSetValueArray.length > 1) {
                //    databoundValue.selectedValue(tmpSetValueArray);
                //} else {
                //    //check if target is an array
                //    if (databoundValue.selectedValue.push) {
                //        databoundValue.selectedValue(tmpSetValueArray);
                //    } else {
                //        databoundValue.selectedValue(tmpSetValueArray[0]);
                //    }
                //}
            } else {
                throw 'selectedValue must be bound to an observable field';
                //we throw this exception is becasue ,value is the binding value, will will copy from the specified property of viewModel
                //and if it is not a observable, then just value copy, which will not change the copied property of viewMode
                //databoundValue.selectedValue = selectedOptionValue;
            }
        },
        
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            _.CO.updateSelect(element, valueAccessor());
            
            //for the case, if the selected value is not any option, but the chose is set to single select mode, then it will select the frist value, but won't trigger change event
            //so we force the value are always same between the element and the viewmodel
            _.CO.updateValue(valueAccessor(), $(element).val(), element, allBindingsAccessor);
            
            $(element).trigger("liszt:updated");
        },
        
        updateSelect: function(element, bindData) {
            element = $(element);
            element.empty();
            var value = _.UO(bindData);
            var source = _.UO(value.source);
            var valueProp = _.UO(value.valueProp);
            var selectedValue = _.UO(value.selectedValue);
            var displayProp = _.UO(value.displayProp);
            var selectedValueItemProp = _.UO(value.selectedValueItemProp);

            var selectedValueArray = [];
            if ($.isArray(selectedValue)) {
                selectedValueArray = selectedValue;
            } else {
                selectedValueArray.push(selectedValue);
            }

            function inArray(array, arrayItemProp, searchValue) {
                for (var j = 0; j < array.length; j++) {
                    var item = array[j];
                    if (arrayItemProp) {
                        item = item[arrayItemProp];
                    }
                    if (item == searchValue) {
                        return true;
                    }
                }
                return false;
            }


            for (var i = 0; i < source.length; i++) {
                var sourceItemValue = _.UO(source[i]);
                if (valueProp) {
                    sourceItemValue = _.UO(source[i][valueProp]);
                }

                var displayValue = _.UO(source[i]);
                if (displayProp) {
                    displayValue = _.UO(source[i][displayProp]);
                }
                var opt;

                if (inArray(selectedValueArray, selectedValueItemProp, sourceItemValue)) {
                    opt = $('<option selected="selected" value="' + i + '">' + displayValue + '</option>');
                } else {
                    opt = $('<option value="' + i + '">' + displayValue + '</option>');
                }
                opt.data("item", _.UO(source[i]));
                element.append(opt);
            }
        }
    };
})();