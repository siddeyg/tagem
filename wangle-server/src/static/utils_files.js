"function populate_f_table(url){"
	"get_json(url, function(data){"
		"var s = \"\";"
		"for (var ls of data){"
			"s += \"<div class='tr' data-id='\" + ls[1] + \"'>\";"
				"s += '<div class=\"td\"><img class=\"thumb\" src=\"' + ls[0] + '\"></img></div>';"
				//"s += \"<td><a href='/d#\" + ls[1] + \"'>\" + ls[2] + \"</a></td>\";" // Dir  ID and name
				"s += \"<div class='td fname'><a onclick='view_file(\" + ls[1] + \")'>\" + ls[2] + \"</a></div>\";" // File ID and name
				"s += \"<div class='td'>\" + ls[3] + \"</div>\";"
				
			"s += \"</div>\";"
		"}"
		"document.querySelector(\"#f .tbody\").innerHTML = s;"
		"column_id2name('t', \"/a/t.json\", \"#f .tbody\", 'view_tag', 2);"
	"});"
"}"

"function get_file_id(){"
	"return file_id;"
"}"
"function get_selected_file_ids(){"
	"return $(\"#f .tbody .tr.selected\").map((i, el) => el.dataset.id).get().join(\",\");"
"}"

"function tag_files_then(file_ids, selector, fn){"
	"const tagselect = $(selector);"
	"const tag_ids = tagselect.val();"
	"$.post({"
		"url: \"/f/t/\" + file_ids + \"/\" + tag_ids.join(\",\"),"
		"success: function(){"
			"tagselect.val(\"\").change();" // Deselect all
			"fn(file_ids, tag_ids);"
		"},"
		"error: function(){"
			"alert(\"Error tagging file\");"
		"}"
	"});"
"}"
"function after_tagged_this_file(file_ids, tag_ids){"
	"display_tags_add(tag_ids, '#tags')"
"}"
"function after_tagged_selected_files(file_ids, tag_ids){"
	// TODO
"}"


"function set_embed_html(_device_id, _dir_name, _file_name){"
	"set_var_to_json_then('D', \"/a/D.json\", function(){"
		"const embed_pre = D[_device_id][2];"
		"if (embed_pre === \"\"){"
			"var src;"
			"if (_dir_name.startsWith(\"http\")){"
				"src = _dir_name + _file_name;"
			"} else {"
				"src = \"/S/f/\" + file_id;"
			"}"
			
			"const node = document.getElementById(\"view\");"
			
			"if (/\\.(jpe?g|png|gif)$/.exec(_file_name) !== null){"
				"node.innerHTML = \"<img src='\" + src + \"'/>\";"
			"} else {"
				"node.innerHTML = \"<video controls><source type='\" + mimetype + \"' src='\" + src + \"'></source></video>\";"
			"}"
			
			"node.onclick = null;" // NOTE: Look into removeEventListener
		"} else {"
			"node.innerHTML = embed_pre + _file_name + D[_device_id][3];"
		"}"
	"});"
"}"

"function view_this_files_dir(){"
	"view_dir(dir_id);"
"}"
"function display_this_file(){"
	"set_embed_html(device_id, dir_name, file_name);"
"}"
"function view_file(_file_id){"
	"unhide('tags-container');"
	"hide('parents-container');"
	"hide('children-container');"
	"hide('f');"
	"hide('d');"
	"hide('t');"
	"document.getElementById('before-files-tbl').innerHTML = '<a id=\"dir_name\"></a><br/><div id=\"view\"></div><br/><a onclick=\"display_this_file()\">View</a>';"
	"unhide('before-files-tbl');"
	"unhide('tagselect-files-container');"
	"hide('tagselect-self-p-container');"
	"hide('tagselect-self-c-container');"
	
	"file_tagger_fn = after_tagged_this_file;"
	"get_file_ids = get_file_id;"
	
	"if (_file_id !== undefined){"
		"file_id = _file_id;"
		"$.ajax({"
			"dataType: \"json\","
			"url: \"/a/f/i/\"+file_id,"
			"success: function(data){"
				"var s = \"\";"
				
				"document.getElementById('profile-img').src = data[0];"
				"dir_id = data[1];"
				"file_name = data[2];"
				"file_tags = data[3].split(\",\");"
				"display_tags(file_tags, \"#tags\");"
				"mimetype = data[4];"
				
				"document.getElementById('dir_name').onclick = view_this_files_dir;"
				"set_dir_name_from_id(dir_id, \"dir_name\");"
				
				"$('#profile-name').text(file_name);"
				
				"if (autoplay){"
					"display_this_file();"
				"}"
			"},"
			"error: function(){"
				"alert(\"Error populating table\");"
			"}"
		"});"
	"} else {"
		"$('#profile-name').text(file_name);"
	"}"
	
	"window.location.hash = 'f' + file_id;"
"}"

"function view_files(ls){"
	"hide('tags-container');"
	"hide('parents-container');"
	"hide('children-container');"
	"hide('before-files-tbl');"
	"unhide('f');"
	"hide('d');"
	"hide('t');"
	"unhide('tagselect-files-container');"
	"hide('tagselect-self-p-container');"
	"hide('tagselect-self-c-container');"
	
	"file_tagger_fn = after_tagged_selected_files;"
	"get_file_ids = get_selected_file_ids;"
	
	"if (ls !== undefined){"
		"populate_f_table('/a/f/id/' + ls.join(\",\"));"
		"fancify_tbl(\"#f .tbody\");"
	"}"
	
	"window.location.hash = '';"
	
	"document.getElementById(\"profile-name\").textContent = \"Files\";"
"}"

"let playlist__file_ids = [];"
"let playlist__indx = 0;" // WARNING: This is the index of file_ids (which are set at offsets), not position in the overall playlist
"let playlist__qry;"
"let autoplay = false;"
"function playlist__next(){"
	"if (playlist__indx == playlist__file_ids.length){"
		"$.post({"
			"url: \"/q/\","
			"data: playlist__qry,"
			"dataType: \"json\","
			"success: function(data){"
				"if (data.length == 0){"
					"alert(\"Reached end of playlist\");"
					"playlist__qry = undefined;"
					"autoplay = false;"
					"return;"
				"}"
				"autoplay = true;"
				"playlist__file_ids = data;"
				"playlist__indx = 0;"
				"playlist__next();"
			"},"
			"error: function(){"
				"playlist__qry = undefined;"
				"autoplay = false;"
				"alert(\"Query error (incorrect syntax?)\");"
				"unhide(\"qry-help\");"
			"}"
		"});"
		"return;"
	"}"
	"view_file(playlist__file_ids[playlist__indx]);"
	"++playlist__indx;"
	"playlist__on_img_load();"
"}"
"function playlist__on_img_load(){"
	"setTimeout(playlist__next, 8000);"
"}"
