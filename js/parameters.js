/* TODO 
	add space between controls
	group booleans ?
*/


//<label id="param1_label" for="param1_val">Display name</label>
//<input type="text" id="param1_val" readonly style="border:0; color:#f6931f; font-weight:bold;">
//<div id="param1">
//  <div id="param1_handle" class="ui-slider-handle"></div>
//</div>
var params = [
	{
		type:'int',
		id:'radius',
		displayName:'The Radius',
		rangeMin:10,
		rangeMax:360,
		default:30
	},
	{
		type:'length',
		id:'height',
		displayName:'The Height',
		rangeMin:10,
		rangeMax:20,
		default:15
	},
	{
		type: "string",
		id: "equation",
		displayName: "Formula",
		default: "Math.cos(Math.sqrt(x * x + y * y))"
	},
	{
		type: "string",
		id: "other",
		displayName: "Other",
		default: "Other stuff"
	},
	{
		type: "list",
		id: "technique",
		displayName: "Size Specifies",
		listLabels: ["Radius", "Length of Apothem", "Length of Side"],
		listValues: ["R", "A", "S"],
		default: "c"
	},
	{
		id: "pointed",
		displayName: "Pointed",
		type: "bool",
		default: true
	},
	{
		id: "colored",
		displayName: "Colored",
		type: "bool",
		default: false
	}
]

var paramDefs
function Parameters (aParamDefs,parent,callback){
	paramDefs = aParamDefs;
	parent.empty();
	for(var i = 0; i < paramDefs.length;i++){
		switch (paramDefs[i].type){
			case 'angle':
			case 'float':
			case 'int':
			case 'length':
				Slider(paramDefs[i],parent,callback);
			break;
			case 'bool':
				BoolParam(paramDefs[i],parent,callback);
			break;
			case 'file':
				console.log(paramDefs[i].type+' is not implemented');
			break;
			case 'list':
				List(paramDefs[i],parent,callback);
			break;
			case 'sketch':
				console.log(paramDefs[i].type+' is not implemented');
			break;
			case 'string':
				StringParam(paramDefs[i],parent,callback);
			break;
			default:
			break;
		}
	}
}
function Slider(paramDef, parent,callback){
	var param = 'param_'+paramDef.id;
	//this.param = param;
	var label = $(document.createElement('label')).prop('id',param+'_label').prop('for',param+'_val').text(paramDef.displayName+':').addClass('param_label');
	var labelVal = $(document.createElement('input')).prop('type','text').prop('id',param+'_val').prop('readonly',true).prop('style','border:0; color:#f6931f; font-weight:bold;');
	var slider = $(document.createElement('div')).prop('id',param).prop('index',paramDef.id);
	var sliderHandle = $(document.createElement('div')).prop('id',param+'_handle').addClass('paramHandle ui-slider-handle');
	parent.append(label);
	parent.append(labelVal);
	parent.append(slider)
	slider.append(sliderHandle);
	parent.append($(document.createElement('label')));

	var handle = $( '#'+param+'_handle' );
    $( '#'+param ).slider({
	  value:paramDef.default || paramDef.rangeMin,
      min: paramDef.rangeMin,
      max: paramDef.rangeMax,
      step: paramDef.steps || undefined,
      create: function() {
        handle.text( $( this ).slider( "value" ) );
      },
      slide: function( event, ui ) {
        handle.text( ui.value );
		$( '#'+param+'_val' ).val( ' '+ui.value );
		callback(this.index,ui.value)
      }
    });
	$( '#'+param+'_val' ).val( " " + $( '#'+param ).slider( "value" ) );
}

function List(paramDef, parent,callback){
	var param = 'param_'+paramDef.id;
	var label = $(document.createElement('label')).prop('id',param+'_label').prop('for',param+'_val').text(paramDef.displayName+': ');//.addClass('param_label');
	var selector = $(document.createElement('select')).prop('id',param).prop('name',param).prop('index',paramDef.id);
	parent.append(label);
	parent.append(selector)
	for(var i = 0; i < paramDef.listValues.length;i++){
		//fixme - remove white space from id?
		var value = paramDef.listValues[i];
		var name = paramDef.listLabels ? paramDef.listLabels[i] : value;
		var option = $(document.createElement('option')).prop('value',value).text(name);
		if (value == paramDef.default) option.prop('selected','selected');
		selector.append(option);		
	}

    $( '#'+param ).selectmenu({
		select: function( event, ui ) {
			callback(this.index,ui.item.value)
		}
	});
}

function StringParam(paramDef, parent,callback){
	var param = 'param_'+paramDef.id;
	var label = $(document.createElement('label')).prop('id',param+'_label').prop('for',param+'_val').text(paramDef.displayName+': ');//.addClass('param_label');
	//var input = $(document.createElement('textarea')).prop('id',param).prop('name',param).prop('rows',paramDef.singleLine?1:3).prop('cols',20).prop('display', 'block').text(paramDef.default).prop('index',paramDef.id);
	var input = $(document.createElement('input')).prop('type','text').prop('id',param).prop('name',param).text(paramDef.default).prop('index',paramDef.id)
	var aligner = $(document.createElement('p')).addClass('aligner');
	input.change(function (event,ui) {
		callback(this.index,event.target.value)
	});
	parent.append(aligner);
	aligner.append(label);
	aligner.append(input);
}

function BoolParam(paramDef, parent,callback){
	var param = 'param_'+paramDef.id;
	var fieldSet = $(document.createElement('fieldset'));
	var fieldSetLabel = $(document.createElement('legend')).text(paramDef.displayName);
	var label = $(document.createElement('label')).prop('id',param+'_label').prop('for',param).text(paramDef.displayName);//.addClass('param_label');
	var boolParam = $(document.createElement('input')).prop('type','checkbox').prop('id',param).prop('name',param).prop('checked',paramDef.default).addClass('bool_param').prop('index',paramDef.id);

	boolParam.change(function (event,ui) {
		callback(this.index,event.target.checked)
	});
	
	parent.append(fieldSet);
	//fieldSet.append(fieldSetLabel);
	fieldSet.append(label);
	fieldSet.append(boolParam);


    $( '.bool_param' ).checkboxradio({
    });
}

