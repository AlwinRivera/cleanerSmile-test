var prod_name = decodeURI(getQueryStringByName("title"));
var keycode = getQueryStringByName('keycode');
var defaultOfferDetails = "default";


function getCurrency() {

    var country = getQueryStringByName("country");
    if (country.toLowerCase() == "php") {
        return 'PHP';
    }
    else if (country.toLowerCase() == "esp") {
        return '€';
    }

    else if (country.toLowerCase() == "gbr") {
        return '£';
    }
    else if (country.toLowerCase() == "zaf") {
        return 'R';
    }
    else if (country.toLowerCase() == "aus") {
        return 'AUD';
    }
    else {
        return '$';
    }
}


(function () {

    var Cart = {
        url: function () {
            var url = window.location.protocol
            return url = 'https://orders.mccrev.com/onlineorder/v2';
        },
        getOffer: function () {
            var offer = window.location.pathname;
            offer = offer.match(/\/(.*?)\//);
            return (!offer) ? '' : offer[1]
        },
        queryString: function () {
            return {
                bp: "firstpage",
                offer: this.getOffer(),
                website: $.trim($('#website').val())
            }
        },
        retrieveData: function (data) {
            var countries = data.offer[0].Country;
            /*refactor*/
            for (var i in countries) {
                //temporary fix for ph currency 
                var currecyPrefix = countries[i].CurrencyPrefix == 'Php' ? '₱' : countries[i].CurrencyPrefix;
                CartHTML.data[Object.keys(countries[i])[0]] = {
                    currencyPrefix: currecyPrefix,
                    currencyAb: countries[i].CurrencyAbbreviation
                }
                // console.log(CartHTML.data)
            }
            /*refactor*/
            for (var country in CartHTML.data) {
                //console.log(Object.keys(CartHTML.data).length)
                for (var i in data.ProductOptions) {
                    var prodData = data.ProductOptions[i];
                    var countryData = CartHTML.data[country];
                    //get keycode last char
                    var prodQuantity = prodData.DefaultKeycode.slice(-1) //prodData.ProductDescription.charAt(0);                        
                    var prodName = prodData.ProductName;
                    var prodPrice = prodData.ProductPrice;
                    var defaultKeycode = prodData.DefaultKeycode;
                    var hierarchy = prodData.Hierarchy;
                 
                    //console.log(decodeURIComponent(prodData.DefaultOfferTerms))

                    var checkCountry = Object.keys(CartHTML.data).length == 1 ? true : prodData.DefaultKeycode.indexOf(country) >= 0

                   /* if (checkCountry) {
                        if (!countryData.hasOwnProperty([prodName])) {
                      
                            countryData[prodName] = {}
                            countryData[prodName][prodQuantity] = prodPrice
                        } else {
   
                            countryData[prodName][prodQuantity] = prodPrice //+ prodData.DefaultKeycode
                        }
                    }*/

                  


                   if (checkCountry) {
                        if (!countryData.hasOwnProperty([prodName])) {

                            countryData[prodName] = {}
                            countryData[prodName]['price'] = {};
                            countryData[prodName]['keycode'] = {};
                            countryData[prodName]['monthly'] = {};//monthly /ongoingkeycode
                            countryData[prodName]['quarterly'] = {};//quarterly
                            countryData[prodName]['ongoingProductDescription'] = {};

                            if (prodData.ProductDescription.indexOf('Subscribe') != -1 &&      prodData.ProductDescription.indexOf('monthly') != -1) {
                                countryData[prodName]['monthly'][prodQuantity] = defaultKeycode
                            }

                            if (prodData.ProductDescription.indexOf('Subscribe') != -1 && prodData.ProductDescription.indexOf('quarterly') != -1) {
                                countryData[prodName]['quarterly'][prodQuantity] = defaultKeycode
                            }

                            if (prodData.ProductDescription.indexOf('Subscribe') != -1) {

                                countryData[prodName]['ongoingProductDescription'][prodQuantity] = decodeURIComponent(prodData.ProductDescription);
                            }                          
                           
                            if (prodData.ProductDescription.indexOf('Subscribe') == -1) {
                                countryData[prodName]['keycode'][prodQuantity] = defaultKeycode
                            }

                            countryData[prodName]['price'][prodQuantity] = prodPrice;
                        } else {


                            if (prodData.ProductDescription.indexOf('Subscribe') != -1 && prodData.ProductDescription.indexOf('monthly') != -1) {
                                countryData[prodName]['monthly'][prodQuantity] = defaultKeycode
                            }

                            if (prodData.ProductDescription.indexOf('Subscribe') != -1 && prodData.ProductDescription.indexOf('quarterly') != -1) {
                                countryData[prodName]['quarterly'][prodQuantity] = defaultKeycode
                            }

                            if (prodData.ProductDescription.indexOf('Subscribe') == -1) {
                                countryData[prodName]['keycode'][prodQuantity] = defaultKeycode
                            }

                            if (prodData.ProductDescription.indexOf('Subscribe') != -1) {
                                countryData[prodName]['ongoingProductDescription'][prodQuantity] = decodeURIComponent(prodData.ProductDescription)
                            }


                            countryData[prodName]['price'][prodQuantity] = prodPrice
                            //countryData[prodName][prodQuantity] = prodPrice //+ prodData.DefaultKeycode
                        }
                    }

                    //product Description
                    if (checkCountry) {
                        if (!countryData.hasOwnProperty('productDescription')) {
                            countryData['productDescription']= {}
                            countryData['productDescription'][prodQuantity] =decodeURIComponent(prodData.ProductDescription);
                        } else {
                            countryData['productDescription'][prodQuantity] = decodeURIComponent(prodData.ProductDescription); //+ prodData.DefaultKeycode
                        }
                    }

                    //temp addition
                    var description = decodeURIComponent(prodData.DefaultOfferTerms);
                    if (description.indexOf('description') > 1) {
                        if (!CartHTML.dataDescription.hasOwnProperty([prodName])) {
                            CartHTML.dataDescription[prodName] = description
                        }

                    }
                }
            }
        },
        getData: function (func) {       
            $.post(this.url(), this.queryString(), this.retrieveData).done(function () {
                console.log(CartHTML.data)
                func(CartHTML.data);
            });
           
        },
        //get json
        Init: function () {
            $.post(this.url(), this.queryString(), this.retrieveData)
             .done(function () {
                 if ($(".product-template-block").length > 0) {
                     CartHTML.displayDataTempBlock();
                     CartEventTemplateBlock.Event();
                    
                 } else {
                     alert("This is a template block pls. add div with a class product-template-block");
                 }

             })
        }
    }

    //function for adding commas for the amount
    function numberWithCommas(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    function getQueryStringByName (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function changeOfferDetails(keycode, defaultCount, prod_name, defaultOfferDetails) {
        if ($("span.custom-checkbox-check").length == 1) {
        
            var product_price = $("input.product-option[data-keycode='" + keycode + "']").attr("data-product-price");
            var offerdetails = $.parseHTML($("input.product-option[data-hierarchy='1']").attr("data-offerterms"));

            var $html = $('<div />', { html: $(offerdetails).find("." + defaultOfferDetails + "").html() });
            $html.find(".main-total").html(getCurrency() + product_price);
            $html.find(".count").html(defaultCount);
            $html.find(".product-name").html(prod_name);
            $(".offerdetail").html($html.html());


        }
    }

    var CartHTML = {
        defaultCountry: $('#dd').attr('data-country'),
        productTempBlock:($(".product-template-block").attr("selection")=="single")? "single": "multiple",
        itemInCart: {},
        data: {},
        dataDescription: {},
        //set default country
        selectedCountry: (getQueryStringByName("country")!="")?getQueryStringByName("country").toUpperCase():$('#dd').attr('data-country'),
        displayDataTempBlock: function () {       
            //check if fields_country is exists or Country selected is setup in webmgnt
            if (getQueryStringByName("fields_country") == "") {               
                window.location.href = "index.html";
            } else if (!this.data.hasOwnProperty(getQueryStringByName("fields_country"))) {
                alert(getQueryStringByName("fields_country") + " is not available in this page");
                window.location.href = "index.html";
            } else {
                this.selectedCountry = getQueryStringByName("fields_country").toUpperCase();
                $(".product-template-block *").remove();
            }

            var data = this.data;
            var prodCount = 1;             
            var countryData = data[this.selectedCountry];        
      
            var currencyPrefix = countryData.currencyPrefix;
            var currencyAb = countryData.currencyAb;

            function breakDown(str, obj, curSel, prodDesc) {
               
                var nodays = (parseInt(curSel) * 30), totalPrice = currencyPrefix + numberWithCommas((parseFloat(obj[curSel]) / curSel).toFixed(2));
                var itemValue = "";

                if (typeof prodDesc != "undefined") {
                    if (prodDesc.indexOf("Week") > -1) {
                        itemValue = (parseInt(curSel) * 1);
                    }
                    //} else if (prodDesc.indexOf("month") || prodDesc.indexOf("months")) {
                    //    itemValue = nodays;
                        //} 
                    else {
                        itemValue = curSel;
                    }
                }
              
                var option = str.replace(/{{item}}/g, itemValue);
                var option = option.replace(/{{totalPrice}}/g, currencyPrefix + numberWithCommas(parseFloat(obj[curSel]).toFixed(2)) + "(" + currencyAb + ")");
                option = option.replace(/{{nodays}}/g, nodays);

                if (typeof prodDesc != "undefined") {
                    option = option.replace(/{{productDescription}}/g, prodDesc);
                }
                option = option.replace(/{{perBottle}}/g, totalPrice + "(" + currencyAb + ")");
                return option;               
            }
         
            for (var prodName in countryData) {
           
                if (prodName != "productDescription" && countryData[prodName] && typeof countryData[prodName] === 'object' && countryData[prodName].constructor === Object) {
                    var defaultKeycodeObj = countryData[prodName]['keycode'];
                    var defaultKeycode = defaultKeycodeObj[Object.keys(defaultKeycodeObj)[0]];//default first keycode


                    var template = $("#product-template").html();
                    template = template.split("{{prodPosition}}").join(prodCount);
                    template = template.split("{{prodDescription}}").join(this.dataDescription[prodName]);
                    template = template.split("{{prodName}}").join(prodName);
                    

                    if (template.split("{{defaultKeycode}}") != undefined) {
                        template = template.split("{{defaultKeycode}}").join(defaultKeycode);
                    }

                    if (template.split("{{country}}") != undefined) {
                        template = template.split("{{country}}").join(this.selectedCountry.toLowerCase());
                    }

                    var column = "";
                    if (this.productTempBlock == "multiple") {
                            var breakdownItem = [];
                            for (var item in countryData[prodName]) {
                                var breakdownContent = $($.parseHTML(template)).find("#breakdown" + prodCount).html();
                                breakdownItem.push(breakDown(breakdownContent, countryData[prodName], item, countryData['productDescription'][item]));
                            }

                            template = $($.parseHTML(template)).find("#breakdown" + prodCount)
                                .html(breakdownItem.reverse())
                                .parent().parent().parent().html();

                            column="row"
                    } else {
                        column = "col-sm-6";
                    }

                    $(".product-template-block").append($("<div/>").addClass(column+" autoship product-" + prodCount).html(template));
                    prodCount++;
                }
            }
        },
      
    }

    var CartEventTemplateBlock = {
        Event: function () {        
            $(".ordernow").on("click", this.proceedtoPayment);
            $("#selection").on('change', this.updateQuantity);
            $("#subscribe").on('change', this.updateQuantity);
            $("#selection-bills").on('change', this.updateDelivery);
        },

        updateBottleQuantity: function (obj) {
            var position = $(obj).attr('data-position');
            var itemSelected = $("input[name='product-" + position + "']:checked").val();

            //check if input has an attribute data-bottle to update bottle pic quantity otherwise nothing happen
            if ($(obj).attr("data-bottle") == "true") {
                var prodImage = $(".prod-img-" + position);
                var path = prodImage.attr("src");
                var imagepath = path.slice(0, path.lastIndexOf("/") + 1);
                $(prodImage).attr("src", imagepath + "prod" + position + "-" + itemSelected + ".png");
            }
        },
        
        updateQuantity: function () {

            var optionSelected;
            $("#selection-bills option").removeAttr("selected");
          

            if ($(this).prop("nodeName") == "SELECT") {
                $("#subscribe").prop("checked", false);
                optionSelected = $(this).find("option:selected");
                $(".item-image-holder").css("display", "none");
                var number = $(this).find("option:selected").attr("number");
                $(".item-image-holder[quantity=" + number + "]").css("display", "block")

            } else {
                optionSelected = $("#selection option:selected");
                $(".item-image-holder[quantity=" + number + "]").css("display", "none")
            }
        

            $(".count").html(optionSelected.attr("quantity"));//quantity
            sessionStorage.setItem('count_order', optionSelected.attr("quantity"));// 

            if ($("#subscribe").is(":checked")) {
                

               
                defaultOfferDetails = "quarterly";
                $("#selection-bills").removeAttr("disabled").val(defaultOfferDetails);            
                CartEventTemplateBlock.updateDelivery();
          
               
            } else {
               
                
                defaultOfferDetails = "default";
                $("#selection-bills").attr("disabled", "disabled").val(defaultOfferDetails);                   
                CartEventTemplateBlock.updateDelivery();
              
            
            }
        }, 

        updateDelivery: function () {

            if ($(this).prop("nodeName") == "SELECT") {
                defaultOfferDetails = $(this).val();
            } 
        
            var defaultCount = sessionStorage.getItem("count_order");
            if ($("#subscribe").is(":checked")) {
                var optionSelected = $("#selection").find("option:selected");     

                if ($("#selection-bills").val() == "monthly") {
                    keycode = optionSelected.attr("monthly");
                } else {
                    keycode = optionSelected.attr("quarterly");
                }
                $("input.product-option[data-keycode='" + keycode + "']").prev().trigger('mouseup');

            } else {
                keycode = $("#selection").find("option:selected").attr("defaultkeycode")
                $("input.product-option[data-keycode='" + keycode + "']").prev().trigger('mouseup');
            }
   
            
            changeOfferDetails(keycode, defaultCount, prod_name, defaultOfferDetails)
        }
        ,
        //proceed to payment not cart
        proceedtoPayment: function () {
            var position = $(this).attr("data-position");
            var title = $("#title-" + position).text();
            var defaultKeycode = $("#order-product-" + position).attr("defaultKeycode");
            var selectedCountry = "&country="+CartHTML.selectedCountry;
            var defaultCountry = '&defaultCountry=' + CartHTML.defaultCountry;
            location.href = "payment.html?title=" + encodeURI(title) +"&keycode="+defaultKeycode+""+ selectedCountry + defaultCountry;
        }
    
    }

    var Cartpayment = (function () {
        ///refactor
        var defaultCount = "";
        function checkOut(data) {        
            var countryData = CartHTML.data[CartHTML.selectedCountry];
                prod_name = decodeURI(getQueryStringByName("title"));
            var defaultCountry = getQueryStringByName('defaultCountry');
                keycode = getQueryStringByName('keycode');
           
            for (var prodName in countryData) {
                if (prodName == prod_name ) {
                    var template = $("#display-item-in-cart").html();
                    var option = "";
                    var i = 1;

                    for (var options in countryData[prod_name].ongoingProductDescription) {
                        var tempDom = $('<output>').append(countryData[prod_name].ongoingProductDescription[options]);
                        var quantity = $(tempDom).find("span").html();
                    
                        $(tempDom).find("span").remove();
                        option += "<option number='" + i + "' quantity='" + quantity.substring(0, 2).trim() +
                                  "' monthly='" + countryData[prod_name].monthly[options] +
                                  "' quarterly='" + countryData[prod_name].quarterly[options] +
                                  "'  defaultkeycode='" + countryData[prod_name].keycode[options] + "'>" + $(tempDom).html() + "</option>";

                        if (i == 1) {
                            defaultCount = quantity.substring(0, 2).trim();//get the default count                         
                        }
                        i++;                       
                    }
                  
                    template = template.split("{{prodName}}").join(prod_name);
                    template = template.split("{{selection}}").join(option)
                    $(".cart-line-items").prepend(template)
                }
            }
         
            CartEventTemplateBlock.Event();

            $(document).one("ajaxStop", function () {
              
                var execInterval = setInterval(function () {
                    $('.product-radio').each(function () {
                        var radioButtonLoad = $('.product-radio span').length;
                        if (radioButtonLoad != 0) {
                            $("input.product-option[data-keycode='" + keycode + "']").prev().trigger('mouseup');
                            //$(".product-radio span").eq(1).trigger("mouseup");
                            $('.product-radio').find("input.product-option[data-keycode='" + keycode + "']").trigger('click');//select default option
                          
                           
                            //number of order
                            $(".count").html(defaultCount);
                            sessionStorage.setItem('count_order', defaultCount);
                            changeOfferDetails(keycode, defaultCount, prod_name, defaultOfferDetails);
                          
                           
                        }
                        else {
                          
                            return
                        }
                    })
                 
                    clearInterval(execInterval);
                }, 100);
               
                $("#fields_country_select").val(getQueryStringByName('country')).trigger("change");     
            });      
        }
        return {
            checkOut: checkOut
        }
    })()

    //ty page
    var Thankyou = (function () {   
       
        //html template
        var template = function () {
            $('.displaySummary').html();
             var template = $("#summary-display").html();               
             template = template.split("{{prodTitle}}").join(getQueryStringByName("title"));            
             template = template.split("{{prodPrice}}").join(getCurrency()+""+getQueryStringByName("amount"));
             template = template.split("{{DateAdded}}").join(getQueryStringByName("dateadded"));
             template = template.split("{{Descriptor}}").join(getQueryStringByName("descriptor"));
             template = template.split("{{count}}").join(sessionStorage.getItem("count_order"));

           
           $('.displaySummary').append(template);           
           $(".firstname").html(getQueryStringByName("fields_fname"));
           $(".lastname").html(getQueryStringByName("fields_lastname"));
            
         
        }

        return {
            init: template
        }

    })()

    var InitPage = (function () {
        //refactor
        var load = (function () {
            if (window.location.href.indexOf('payment.html') > -1) {

                return Cart.getData(Cartpayment.checkOut);
            } else if (window.location.href.indexOf('thankyou') > -1) {
        
                return Thankyou.init()
            } else {
                return Cart.Init()
            }
        })();
        return {
            load: load
        };
    }());

})();


