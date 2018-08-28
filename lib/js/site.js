
var rate_info = {
	base: '',
	rates: {}
};

$(document).ready(function(){
	start();

	// Base amount (top textbox) user input
	$('#base_amount').keyup(function(){
		var input = $(this).val();
		var converted_currency = $('#converted_currency').val();

		if(input.length > 0) {
			if(checkValidInput(input)) {
				removeBaseInputError();

				var converted = convertFromBase(
					input
					, rate_info.rates[converted_currency]
				);

				setConvertAmounts(converted);
				setBaseAmountLabel(input);
			}
			else {
				addBaseInputError();
			}
		}
		else {
			removeBaseInputError();
			clearAmountsAndLabels();
		}
	});

	// Converted amonut (bottom textbox) user input
	$('#converted_amount').keyup(function(){
		var input = $(this).val();
		var converted_currency = $('#converted_currency').val();
		if(input.length > 0) {
			if(checkValidInput(input)) {
				removeConvertInputError();

				var converted = convertToBase(
					input
					, rate_info.rates[converted_currency]
				);

				setBaseAmounts(converted);
				setConvertAmountLabel(input);
			}
			else {
				addConvertInputError();
			}
		}
		else {
			removeConvertInputError();
			clearAmountsAndLabels();
		}
	});

	$('#base_currency').change(function(){
		// Changing base - re-call API
		getRateInfo(
			$(this).val()
			, $('#base_amount').val()
		);
	});

	$('#converted_currency').change(function(){
		var base_amount = formatDecimal($('#base_amount').val());
		var converted_currency = $(this).val();

		var converted = convertFromBase(
			base_amount
			, rate_info.rates[converted_currency]
		);

		setBaseAmounts(base_amount);
		setConvertAmounts(converted);
		setConvertCurrency(converted_currency)
	});

	$('.switch-currencies').click(function(){
		getRateInfo(
			$('#converted_currency').val()
			, $('#base_amount').val()
			, $('#base_currency').val()
		);
	});
});

function getRateInfo(base, amount, conversion) {
	base = base || getDefaultBaseSymbol();
	amount = (amount == '') ? 1 : amount;	
	base_amount = amount || 1;

	//var default_conversion_symbol = (base == getDefaultConversionSymbol()) ? getDefaultBaseSymbol() : getDefaultConversionSymbol();
	
	conversion = conversion || getDefaultConversionSymbol();
	if(base == conversion) {
		return;
	}

	$.ajax({
		url: getRateAPIURL() + base,
		type: 'GET',
		dataType: 'JSON',
		success: function(result){
			setupPage(
				result
				, base_amount
				, conversion
			);
		}
	});
}

function setupPage(data, base_amount, conversion) {
	rate_info.base = data.base;
	rate_info.rates = data.rates;

	setBaseAmounts(base_amount);
	setBaseCurrency(rate_info.base);

	var converted = convertFromBase(base_amount, rate_info.rates[conversion]);
	setConvertAmounts(converted);
	setConvertCurrency(conversion);

	// Resetting the dropdowns from the API result - remove all old options in dropdown
	$('#base_currency').find('option').remove();
	$('#converted_currency').find('option').remove();

	// Add in the base currnecy option, as it is not returned in the API result
	$('#base_currency').append($("<option></option>").attr("value",rate_info.base).attr("id",rate_info.base).text(rate_info.base));

	// Add the options to the dropdown based on the rates returned
	$.each(rate_info.rates, function(key, value){
		$('#base_currency').append($("<option></option>").attr("value",key).attr("id",key).text(key));
		$('#converted_currency').append($("<option></option>").attr("value",key).attr("id",key).text(key));
	});

	// Select the value in the converted currency (second) dropdown to the selected conversion currency
	$('#converted_currency option#' + conversion).attr('selected', 'selected');
}


function checkValidInput(check) {
	var regexStr = /^[0-9]*\.?[0-9]*$/;

	// Only allow numbers and periods
	if(regexStr.test(check)) {
		return true
	}
	else {
		// Invalid input
		return false;
	}
}

function convertFromBase(base_value, rate) {
	base_value = parseFloat(base_value);
	return (base_value * rate).toFixed(getFixedDecimal());
}

function convertToBase(converted_value, rate) {
	converted_value = parseFloat(converted_value);
	return (converted_value / rate).toFixed(getFixedDecimal());
}

function setBaseAmounts(amount) {
	setBaseAmountLabel(amount);
	setBaseAmountTextbox(amount);
}

function setConvertAmounts(amount) {
	setConvertAmountLabel(amount);
	setConvertAmountTextbox(amount);
}

function setBaseAmountLabel(amount) {
	$('#base_amount_label').text(formatMoney(amount));
}

function setBaseAmountTextbox(amount) {
	$('#base_amount').val(formatDecimal(amount));
}

function setConvertAmountLabel(amount) {
	$('#converted_amount_label').text(formatMoney(amount));
}

function setConvertAmountTextbox(amount) {
	$('#converted_amount').val(formatDecimal(amount));
}

function setConvertCurrency(currency) {
	$('#converted_currency_label').html(currency);
}

function setBaseCurrency(currency) {
	$('#base_currency_label').html(currency);
}

function addBaseInputError() {
	$('#base_amount').addClass('invalid-input');
}

function addConvertInputError() {
	$('#converted_amount').addClass('invalid-input');
}

function removeBaseInputError() {
	$('#base_amount').removeClass('invalid-input');
}

function removeConvertInputError() {
	$('#converted_amount').removeClass('invalid-input');
}

function formatDecimal(amount) {
	amount = (amount == '') ? 1 : amount;
	return parseFloat(amount).toFixed(getFixedDecimal());
}

function formatMoney(amount) {
	amount = (amount == '') ? 1 : amount;
	amount = formatDecimal(amount);

    var amount_split = amount.split(".");

    var leftside = amount_split[0];
    var rightside = amount_split[1];

    var counter = 0;
    var formatted = "";
    for(var i = leftside.length-1; i >= 0; i--){
    	if(counter % 3 == 0 && counter > 0) {
        	formatted = "," + formatted;
        }
        formatted = leftside.charAt(i) + formatted;
        counter++;
    }

    return formatted + "." + rightside;
}

function clearAmountsAndLabels() {
	$('#base_amount').val('');
	$('#base_amount_label').html('');
	$('#converted_amount').val('');
	$('#converted_amount_label').html('');
}

function getRateAPIURL() {
	return 'https://api.exchangeratesapi.io/latest?base=';
}

function getDefaultBaseSymbol() {
	return 'USD';
}

function getDefaultConversionSymbol() {
	return 'EUR';
}

function getFixedDecimal() {
	return  2;
}

function start() {
	getRateInfo();
}

