"function hide(id){"
	"document.getElementById(id).classList.add(\"hidden\");"
"}"
"function unhide(id){"
	"document.getElementById(id).classList.remove(\"hidden\");"
"}"
"function hide_all_except(ls){"
	"for(const id of ["
		"'help',"
		"'qry-help',"
		"'text-editor',"
		"'f',"
		"'d',"
		"'t',"
		"'tasks-container',"
		"'file-info',"
		"'user-info',"
		"'post-container',"
		"'tags-container',"
		"'parents-container',"
		"'children-container',"
		"'dirselect-container',"
		"'deviceselect-container',"
		"'protocolselect-container',"
		"'tagselect-files-container',"
		"'tagselect-files-btn',"
		"'tagselect-self-p-container',"
		"'tagselect-self-p-btn',"
		"'tagselect-self-c-container',"
		"'tagselect-self-c-btn',"
		"'add-t-dialog',"
		"'add-f-dialog',"
		"'add-d-dialog',"
		"'add-D-dialog',"
		"'orig-src-dialog'"
	"]){"
		"if(ls.includes(id))"
			"unhide(id);"
		"else "
			"hide(id);"
	"}"
"}"
"function toggle(id){"
	"const x = document.getElementById(id);"
	"if (x.classList.contains(\"hidden\"))"
		"unhide(id);"
	" else "
		"hide(id);"
"}"

"function timestamp2dt(t){"
	"return new Date(t*1000).toISOString().slice(-24, -5)"
"}"
"function get_json(url, fn){"
	"$.ajax({"
		"dataType: \"json\","
		"url: url,"
		"success: fn,"
		"error:err_alert"
	"});"
"}"
"function set_var_to_json_then(var_name, url, fn){"
	// All global variable are set in the window object
	"if (window[var_name] !== undefined){"
		"fn();"
		"return;"
	"}"
	"get_json(url, function(data){"
		"const additions = get_cookie(var_name + '_adds');"
		"if (additions !== undefined){"
			"merge_into(data, JSON.parse(additions));"
		"}"
		
		"const dels = get_cookie(var_name + '_dels');"
		"if (dels !== undefined){"
			"del_keys(data, JSON.parse(dels));"
		"}"
		
		"window[var_name] = data;"
		
		"fn();"
	"});"
"}"
"function sub_into(data, node, fn_name){"
	"let s = \"\";"
	"if (data instanceof Array)"
		"data = Object.fromEntries(data.entries());" // Convert ["foo","bar"] -> {0:"foo", 1:"bar"}
	"const _s = node.text();"
	"if(_s === \"\")"
		"return;"
	"for (var tagid of node.text().split(\",\")){"
		"const x = data[tagid];"
		"s += \"<a onclick='\" + fn_name + \"(\" + tagid + \")'>\" + ((x instanceof Array)?x[0]:x) + \"</a> \";"
	"}"
	"node.html(s);"
"}"

"function invert_dict(data){"
	"return Object.fromEntries(Object.entries(data).map(([k, v]) => [v, k]));"
"}"

"function zipsplitarr(keys, vals){"
	// Convert two arrays into a dictionary
	// [foo, bar], [ree, gee] -> [[foo,ree], [foo,gee], [bar,ree], [bar,gee]]
	"const arr = [];"
	"for (const key of keys){"
		"for (const val of vals){"
			"arr.push([key, val]);"
		"}"
	"}"
	"return arr;"
"}"

"function error_alert(title, text){"
	"alert(title + \"\\n\" + text);"
"}"

"function err_alert(r,title,text){"
	"error_alert(r.statusText, text + \"\\nfor url: \" + this.url);"
"}"
