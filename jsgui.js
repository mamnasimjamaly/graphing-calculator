function JSgui() {
	this.currInput = 0;
	this.lineColors = {"#FF0000" : -1, "#0000FF" : -1, "#00FF00" : -1, "#FF00FF" : -1, "#00FFFF" : -1,
		"#000000" : -1, "#990000" : -1, "#000099" : -1, "#009900" : -1, "#999900" : -1, "#990099" : -1, "#009999" : -1};
	this.lineSettings = {0 : {color : "#FF0000"}};
	this.currtool = "pointer";
	this.currEq = 0;
	this.gridlines = "normal";
	this.settings = {};
	
	this.setQuality = function(q) {
		$("#quality_select a").removeClass("option_selected");
		var q2 = String(q).replace(".", "");
		$("#quality_select_"+q2).addClass("option_selected");

		jsgcalc.quality = q;
		jsgcalc.draw();
	}

	this.setAngles = function(q) {
		$("#angle_select a").removeClass("option_selected");
		$("#angle_select_"+q).addClass("option_selected");

		Calc.angles = q;
		jsgcalc.draw();
	}

	this.selectEquation = function(x) {
		this.currEq = x;
		$("#graph_inputs div.graph_input_wrapper").removeClass("active_equation");
		$("#graph_input_wrapper_"+x).addClass("active_equation");
		jsgcalc.draw();
	}

	this.setTool = function(t) {
		$("#tool_select a").removeClass("toolbar_selected");
		$("#tool_select_"+t).addClass("toolbar_selected");
		
		//Toolbox
		$(".toolbox").hide();
		$("#toolbox_"+t).show();
		$("#toolbox_"+t).css("top", $("#tool_select_"+t).offset().top - 23);
		$("#toolbox_"+t).css("right", $(document).width() - $("#tool_select_"+t).offset().left + 5);
		
		this.currtool = t;
		jsgcalc.draw();
	}
	
	this.doTrace = function(xval) {
		jsgcalc.draw();
		jsgcalc.drawTrace(jsgcalc.getEquation(this.currEq), "#000000", xval);
	}

	this.setGridlines = function(t) {
		$("#gridlines_select a").removeClass("option_selected");
		$("#gridlines_select_"+t).addClass("option_selected");

		this.gridlines = t;
		jsgcalc.draw();
	}

	this.hideSidebar = function() {
		$("#sidewrapper").hide();
		$("#hideSidebar").hide();
		$("#showSidebar").show();
		$("#toolbar").css("right", "0px");
		jsgcalc.resizeGraph($("#wrapper").width() - widthPlusPadding("#toolbar"), $("#wrapper").height());
		
		this.setTool(this.currtool);
	}

	this.showSidebar = function() {
		$("#sidewrapper").show();
		$("#hideSidebar").show();
		$("#showSidebar").hide();
		$("#toolbar").css("right", "252px");
		jsgcalc.resizeGraph($("#wrapper").width() - $("#sidewrapper").width() - widthPlusPadding("#toolbar"), $("#wrapper").height());
		
		this.setTool(this.currtool);
	}
	
	this.updateInputData = function() {
		var next = [];
		$("#graph_inputs div.graph_input_wrapper").each(function(index) {
			var color = $(".graph_color_indicator", this).attr("data-color");
			if (!color && jsgcalc.lines[index])
				color = jsgcalc.lines[index].color;
			next.push({
				equation: $.trim($("input", this).val()),
				color: color
			});
		});
		jsgcalc.lines = next;
	}

	this.evaluate = function() {
		this.updateInputData();
		jsgcalc.draw();
	}

	this.findAvailableColor = function() {
		for(var color in this.lineColors) {
			if(this.lineColors[color] == -1)
				return color;
		}
	}
	
	//Update gui values
	this.updateValues = function() {
		$("input.jsgcalc_xmin").val(Math.round(jsgcalc.currCoord.x1 * 1000) / 1000);
		$("input.jsgcalc_xmax").val(Math.round(jsgcalc.currCoord.x2 * 1000) / 1000);
		$("input.jsgcalc_ymin").val(Math.round(jsgcalc.currCoord.y1 * 1000) / 1000);
		$("input.jsgcalc_ymax").val(Math.round(jsgcalc.currCoord.y2 * 1000) / 1000);
	}

	this.addInput = function(equation) {
		this.updateInputData();
		var newcolor = this.findAvailableColor();
		this.lineColors[newcolor] = this.currInput;
		jsgcalc.lines.push({
			equation: equation || "",
			color: newcolor
		});
		this.currInput++;
		this.currEq = jsgcalc.lines.length - 1;
		this.refreshInputs();
	}

	this.removeInput = function(index) {
		index = Number(index);
		this.updateInputData();
		if (jsgcalc.lines.length <= 1) {
			jsgcalc.lines[0].equation = "";
			this.currEq = 0;
			this.refreshInputs();
			jsgcalc.draw();
			return;
		}

		jsgcalc.lines.splice(index, 1);
		if (this.currEq > index)
			this.currEq--;
		if (this.currEq >= jsgcalc.lines.length)
			this.currEq = jsgcalc.lines.length - 1;
		this.refreshInputs();
		jsgcalc.draw();
	}
	
	this.refreshInputs = function() {
		var equations = jsgcalc.lines;
		var self = this;
		var color;

		for (color in this.lineColors)
			this.lineColors[color] = -1;

		var container = $("#graph_inputs");
		container.empty();

		equations.forEach(function(eq, i) {
			self.lineColors[eq.color] = i;

			var wrapper = $("<div>", {
				id: "graph_input_wrapper_" + i,
				"class": "graph_input_wrapper"
			});
			var swatch = $("<div>", {
				"class": "graph_color_indicator",
				id: "graph_color_indicator_" + i
			}).css("backgroundColor", eq.color).attr("data-color", eq.color);
			var display = $("<div>", { "class": "graph_equation_display" });
			display.append($("<span>").text("y ="));
			display.append($("<input>", {
				id: "graph_input_" + i,
				type: "text",
				value: eq.equation,
				spellcheck: "false",
				autocomplete: "off"
			}));
			var remove = $("<button>", {
				type: "button",
				"class": "remove_equation",
				title: "Remove equation",
				text: "\u00d7"
			});
			var error = $("<div>", { "class": "equation_error_text" });

			wrapper.append(display, swatch, remove, error);
			wrapper.on("click", function() {
				self.selectEquation(i);
			});
			remove.on("click", function(event) {
				event.stopPropagation();
				self.removeInput(i);
			});
			display.find("input").on("keydown", function(event) {
				if (event.key === "Enter") {
					event.preventDefault();
					self.evaluate();
				}
			});
			container.append(wrapper);
		});

		this.currInput = equations.length;
		$("#graph_input_wrapper_" + this.currEq).addClass("active_equation");
	}
	

}

var jsgui = new JSgui;
window.jsgui = jsgui;
window.JSgui = JSgui;

$(document).ready(function() {
	$(".toolbox_close a").click(function() {
		$(".toolbox").hide();
	});

	$("#toolbox_zoombox input").on("keydown", function(event) {
		if (event.key !== "Enter")
			return;
		jsgcalc.setWindow(
			$("#toolbox_zoombox_xmin").val(),
			$("#toolbox_zoombox_xmax").val(),
			$("#toolbox_zoombox_ymin").val(),
			$("#toolbox_zoombox_ymax").val()
		);
	});

	$("#toolbox_trace_input").on("keydown", function(event) {
		if (event.key !== "Enter")
			return;
		event.preventDefault();
		jsgui.doTrace($(this).val());
	});
});
