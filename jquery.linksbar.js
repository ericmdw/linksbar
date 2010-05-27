/* jQuery Linksbar
 * version 1.0
 * by Eric Montgomery - http://devewm.com/projects/linksbar
 * 
 * Allows users to create quick on-site links that are stored completely in
 * the browser.
 * 
 * Usage:
 * 
 * <div id="mysite_linksbar"></div>
 * 
 * $('#mysite_linksbar').linksbar();
 * 
 * If you use this, send me a wave and let me know how you like it.
 * Google Wave ID is ericwmontgomery.
 * 
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details.
 */

(function($) {
	$.fn.linksbar = function() {
		var debugMode = false; // enable this during testing to be notified of any known problems
		
		var dbg = function(message) {
			if(!debugMode) return;
			
			if(typeof(console)!="undefined" && typeof(console.log)!="undefined") {
				console.log('jQuery Linksbar::debug:: ' + message);
			} else {
				alert('jQuery Linksbar::debug:: ' + message);
			}
		};
		
		if(typeof(localStorage)=="undefined") {
			dbg("ERROR - jQuery Linksbar cannot operate because HTML5 Local Storage is not supported.");
			return;
		}
		
		var target = this;
		
		// setup json serialization if it is not already provided as a JSON object.
		// this code is pre-minified since it should not need to be modified during
		// the normal development process. full source is in json2.custom.js.
		if(typeof(JSON)=="undefined"){dbg('Using non-native JSON impl from json.org...');window.JSON={};(function(){function f(n){return n<10?'0'+n:n;}if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+f(this.getUTCMonth()+1)+'-'+f(this.getUTCDate())+'T'+f(this.getUTCHours())+':'+f(this.getUTCMinutes())+':'+f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}if(typeof rep==='function'){value=rep.call(holder,key,value);}switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==='string'){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}return str('',{'':value});};}if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}return reviver.call(holder,key,value);}cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}throw new SyntaxError('JSON.parse');};}}());}
		
		// need serialize and unserialize functions so we can
		// store all data into one variable. this keeps the local storage
		// clean for other uses on the same site.
		var serialize = function(data) {
			return JSON.stringify(data);
		};
		
		var unserialize = function(data) {
			return JSON.parse(data);
		};
		
		var getSavedLinks = function() {
			var data = localStorage.getItem('jquery_linksbar');
			if(null != data) 
				return unserialize(data);
			else
				return {};
		};
		
		var getNames = function() {
			var names = [];
			for(name in getSavedLinks()) {
				names.push(name);
			}
			
			return names;
		};
		
		var _hack_ensureStorageUpdateTriggers = function() {
			window.setTimeout(function() {
				if(!_hack_storageChangeHandled) {
					_hack_storageChangeHandled = true;
					render();
				}
			}, 250);
		};
		
		var saveLink = function(name, url) {
			var links = getSavedLinks();
			links[name] = url;
			_hack_storageChangeHandled = false;
			localStorage.setItem('jquery_linksbar', serialize(links));
			_hack_ensureStorageUpdateTriggers();
		};
		
		var removeLink = function(name) {
			var links = getSavedLinks();
			delete(links[name]);
			_hack_storageChangeHandled = false;
			localStorage.setItem('jquery_linksbar', serialize(links));
			_hack_ensureStorageUpdateTriggers();
		};
		
		var showAddForm = function() {
			var formHtml = '<div id="linksbar_prevent_click" style="display:none;z-index:100000;"></div>' +
			               '<div id="linksbar_addlink_form" style="display:none;z-index:100001;"><div class="title">Add Link</div>' +
			               '<form onsubmit="return false;">' +
			               '<div class="field"><label for="linkName">Name</label><input type="text" name="linkName"></div>' +
			               '<div class="field"><label for="linkUrl">URL</label><input type="text" name="linkUrl"></div>' +
			               '<div class="buttons"><input value="Save" type="submit"><input value="Cancel" type="button"></div>'
			               '</form></div>';
			
			if($('#linksbar_addlink_form').length == 0) {
				$('body').append(formHtml);
			}
			
			$('#linksbar_addlink_form input[value="Save"]').bind('click', function() {
				saveLink($('#linksbar_addlink_form input[name="linkName"]').val(),$('#linksbar_addlink_form input[name="linkUrl"]').val());
				$('#linksbar_addlink_form').remove();
				$('#linksbar_prevent_click').remove();
			});
			
			$('#linksbar_addlink_form input[value="Cancel"]').bind('click', function() {
				$('#linksbar_addlink_form').remove();
				$('#linksbar_prevent_click').remove();
			});
			
			$('#linksbar_addlink_form input[name="linkUrl"]').val(window.location);
			
			$('#linksbar_prevent_click').show();
			$('#linksbar_addlink_form').show();
			$('#linksbar_addlink_form input[name="linkName"]').focus();
		};
		
		var showRemoveForm = function() {
			var names = getNames();
			var formHtml = '<div id="linksbar_prevent_click" style="display:none;z-index:100000;"></div>' +
			               '<div id="linksbar_removelink_form" style="display:none;z-index:100001;"><div class="title">Remove Link</div>' +
			               '<div class="field"><select name="removeLink"><option>Select a link to remove</option>';
			for(var i = 0; i < names.length; i++) {
				var name = names[i];
				formHtml += '<option value="' + name.replace('"', '&quot;') + '">' + name + '</option>';
			}
			formHtml += '</select></div><div class="buttons"><input type="button" value="Remove"><input type="button" value="Cancel"></div></div>';
			
			if($('#linksbar_removelink_form').length == 0) {
				$('body').append(formHtml);
			}
			
			$('#linksbar_removelink_form input[value="Remove"]').bind('click', function() {
				removeLink($('#linksbar_removelink_form [name="removeLink"]').val());
				$('#linksbar_removelink_form').remove();
				$('#linksbar_prevent_click').remove();
			});
			
			$('#linksbar_removelink_form input[value="Cancel"]').bind('click', function() {
				$('#linksbar_removelink_form').remove();
				$('#linksbar_prevent_click').remove();
			});
			
			$('#linksbar_prevent_click').show();
			$('#linksbar_removelink_form').show();
		};
		
		var render = function() {
			var links = getSavedLinks();
			
			var html = '<div class="linksbar"><div class="linksbar_links">';
			for(name in links) {
				var url = links[name];
				html += '<a href="' + url + '">' + name + '</a>';
			}
			html += '</div><div class="linksbar_buttons">';
			html += '<a href="" class="add">+</a><a href="" class="remove">-</a>';
			html += '</div><div style="clear: both;"></div></div>';
			
			
			$(target).each(function() {
				$(this).html(html);
			});
			
			$('.linksbar_buttons .add').each(function() {
				$(this).bind('click', function() {
					showAddForm();
					return false;
				});
			});
			
			$('.linksbar_buttons .remove').each(function() {
				$(this).bind('click', function() {
					showRemoveForm();
					return false;
				});
			});
		};
		
		var _hack_storageChangeHandled = true;
		
		var setupStorageHandler = function() {
			var storageHandler = function() {
				render();
				_hack_storageChangeHandled = true;
			};
			
			// jQuery bind function doesn't support the storage event yet, have
			// to do this the old-fashioned way.
			if($.browser.msie) {
				document.attachEvent('onstorage', storageHandler);
			} else if($.browser.safari) {
				window.addEventListener('storage', storageHandler, false);
			} else {
				document.addEventListener('storage', storageHandler,false);
			}
		};
		
		setupStorageHandler();
		render();
	};
})(jQuery);