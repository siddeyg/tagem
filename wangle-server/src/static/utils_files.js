"function populate_f_table(url){"
	"get_json(url, function(data){"
		"let s = \"\";"
		"file2post = {};"
		"for (const [thumb, id, name, sz, ext_db_n_post_ids, tag_ids] of data){"
			"s += \"<div class='tr' data-id='\" + id + \"'>\";"
				"s += '<div class=\"td\"><img class=\"thumb\" src=\"' + thumb + '\"></img></div>';"
				//"s += \"<td><a href='/d#\" + ls[1] + \"'>\" + ls[2] + \"</a></td>\";" // Dir  ID and name
				"s += \"<div class='td fname'><a onclick='view_file(\" + id + \")'>\" + name + \"</a></div>\";" // File ID and name
				"s += \"<div class='td'>\" + ext_db_n_post_ids + \"</div>\";" // 3rd column i.e. col[2]
				"s += \"<div class='td'>\" + tag_ids + \"</div>\";" // 4th column i.e. col[3]
				"s += \"<div class='td' data-n=\" + sz + \">\" + bytes2human(parseInt(sz)) + \"</div>\";" // 5th column i.e. col[4]
				
				// Populate file2post dictionary
				"file2post[id] = ext_db_n_post_ids.split(\":\");" // database_ids, post_ids
				
			"s += \"</div>\";"
		"}"
		"document.querySelector(\"#f .tbody\").innerHTML = s;"
		"column_id2name('x', \"#f .tbody\", 'view_db', 2);"
		"column_id2name('t', \"#f .tbody\", 'view_tag', 3);"
	"});"
"}"

"function merge_files(){"
	"const master_file_ids = get_selected_file_ids().split(\",\");"
	"const dupl_file_ids   = get_selected2_file_ids().split(\",\");"
	"if(master_file_ids.length !== 1){"
		"alert(\"There must be exactly one master file (use left mouse button to select them)\");"
		"return;"
	"}"
	"if(dupl_file_ids.length === 0){"
		"alert(\"No duplicate files selected (use middle mouse button to select them)\");"
		"return;"
	"}"
	"const master_f_id = master_file_ids[0];"
	"if(dupl_file_ids.includes(master_f_id)){"
		"alert(\"File cannot be selected as both master and duplicate\");"
		"return;"
	"}"
	"$.post({"
		"url:\"/merge/\"+master_f_id+\"/\"+dupl_file_ids.join(\",\"),"
		"success:function(){"
			"deselect_rows('#f .tbody .tr', 1);"
			"$(\"#f .tbody .tr.selected2\").remove();"
		"},"
		"error:err_alert"
	"});"
"}"

"function get_file_id(){"
	"return file_id;"
"}"
"function get_selected2_file_ids(){"
	"return $(\"#f .tbody .tr.selected2\").map((i, el) => el.dataset.id).get().join(\",\");"
"}"
"function get_selected_file_ids(){"
	"return $(\"#f .tbody .tr.selected1\").map((i, el) => el.dataset.id).get().join(\",\");"
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
		"error:err_alert"
	"});"
"}"
"function after_tagged_this_file(file_ids, tag_ids){"
	"display_tags_add(tag_ids, '#tags')"
"}"
"function after_tagged_selected_files(file_ids, tag_ids){"
	// TODO
"}"


"function set_embed_html(_dir_id, _mimetype, _file_name){"
	"const [_dir_name, _device_id] = d[(_dir_id === undefined) ? dir_id : _dir_id];"
	"const embed_pre = D[_device_id][2];"
	"const node = document.getElementById(\"view\");"
	"if (embed_pre === \"\"){"
		"const _src_end = (_dir_id === undefined) ? \"\" : \"/\" + _dir_id;"
		"const src = (_dir_name.startsWith(\"http\")) ? (_dir_name + _file_name) : (\"/S/f/\" + file_id + _src_end);"
		
		"let s;"
		"const _mimetype_str = mt[(_mimetype===undefined)?mimetype:_mimetype];"
		"switch(_mimetype_str.substring(0, _mimetype_str.indexOf('/'))){"
			"case 'image':"
				"s = \"<img src='\" + src + \"'/>\";"
				"break;"
			"case 'audio':"
				"s = \"<audio controls><source type='\" + _mimetype_str + \"' src='\" + src + \"'>Browser does not support audio</source></video>\";"
				"break;"
			"case 'video':"
				"s = \"<video controls><source type='\" + _mimetype_str + \"' src='\" + src + \"'>Browser does not support videos</source></video>\";"
				"break;"
			"case '':"
				// If no slash in the mimetype (probably "!!NONE!!")
				"s = \"<iframe src='\" + src + \"'>Browser does not support iframes</iframe>\";"
				"break;"
			"default:"
				"s = \"<object type='\" + _mimetype_str + \"' data='\" + src + \"'>Browser does not support object elements</object>\";"
		"}"
		"node.innerHTML = s;"
	"} else {"
		"node.innerHTML = embed_pre + _file_name + D[_device_id][3];"
	"}"
"}"

"function view_this_files_dir(){"
	"view_dir(dir_id);"
"}"
"function display_this_file(_dir_id, _mimetype){"
	"set_embed_html(_dir_id, _mimetype, file_name);"
	"hide(\"view-btns-container\");"
"}"
"function undisplay_this_file(){"
	"document.getElementById(\"view\").innerHTML = \"\";"
	"unhide(\"view-btns-container\");"
"}"
"function autoplay(){"
	"return document.getElementById('autoplay').checked;"
"}"
"function display_external_db(id, name, post_id){"
	"return \"<a class='db-link' onclick='view_post(\" + id + \",\\\"\" + post_id + \"\\\")'>View post on \" + name + \"</a>\";" // post_id is enclosed in quotes because Javascript uses doubles for integers and rounds big integers
"}"
"function display_external_dbs(db_and_post_ids){"
	"let s = \"\";"
	"for (var i = 0;  i < db_and_post_ids.length;  ++i){"
		"s += display_external_db(db_and_post_ids[i][0], x[db_and_post_ids[i][0]], db_and_post_ids[i][1]) + \"<br/>\";"
	"}"
	"document.getElementById(\"db-links\").innerHTML = s;"
"}"
"function view_file(_file_id){"
	"hide_all_except(['tags-container','file-info','tagselect-files-container','tagselect-files-btn']);"
	
	"file_tagger_fn = after_tagged_this_file;"
	"get_file_ids = get_file_id;"
	
	"if (_file_id !== undefined){"
		"file_id = _file_id;"
		"$.ajax({"
			"dataType: \"json\","
			"url: \"/a/f/i/\"+file_id,"
			"success: function(data){"
				"const [thumb, _dir_id, name, sz, ext_db_n_post_ids, tag_ids, mime, backups] = data;"
				"document.getElementById('profile-img').src = thumb;"
				"dir_id = _dir_id;"
				"file_name = name;"
				"const db_and_post_ids = ext_db_n_post_ids;"
				"if (db_and_post_ids !== \"\")"
					"display_external_dbs(db_and_post_ids.split(\",\").map(x => x.split(\":\")));"
				
				"if(tag_ids === \"\")"
					"file_tags = [];"
				"else{"
					"file_tags = tag_ids.split(\",\");"
					"display_tags(file_tags, \"#tags\");"
				"}"
				
				"mimetype = mime;"
				
				"document.getElementById('dir_name').onclick = view_this_files_dir;"
				"set_dir_name_from_id(dir_id, \"dir_name\");"
				
				"$('#profile-name').text(file_name);"
				
				"let _s = \"\";"
				"if (autoplay()){"
					"display_this_file();"
				"} else {"
					"undisplay_this_file();"
					"if(backups!==\"\"){"
						"for(const _dir_id_to_mimetype of backups.split(\",\")){"
							"const [_dir_id, _mimetype] = _dir_id_to_mimetype.split(\":\");"
							// dir_id of backup file
							"_s += '<button class=\"view-btn\" onclick=\"display_this_file(' + _dir_id + ',' + _mimetype + ')\">' + d[_dir_id][0] + '</button>';"
						"}"
					"}"
				"}"
				"document.getElementById(\"view-btns-backups\").innerHTML = _s;"
			"},"
			"error:err_alert"
		"});"
	"} else {"
		"$('#profile-name').text(file_name);"
	"}"
	
	"window.location.hash = 'f' + file_id;"
"}"

"function view_files(ls){"
	"hide_all_except(['f','tagselect-files-container','tagselect-files-btn']);"
	
	"file_tagger_fn = after_tagged_selected_files;"
	"get_file_ids = get_selected_file_ids;"
	
	"if (ls !== undefined){"
		"if (ls.length !== 0){"
			"populate_f_table('/a/f/id/' + ls.join(\",\"));"
		"}"
	"}"
	
	"window.location.hash = '';"
	
	"document.getElementById(\"profile-name\").textContent = \"Files\";"
"}"

"let playlist__file_ids = [];"
"let playlist__indx = 0;" // WARNING: This is the index of file_ids (which are set at offsets), not position in the overall playlist
"let playlist__qry;"
"let playlist_autoplay = false;"
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
					"playlist_autoplay = false;"
					"return;"
				"}"
				"playlist_autoplay = true;"
				"playlist__file_ids = data;"
				"playlist__indx = 0;"
				"playlist__next();"
			"},"
			"error: function(){"
				"playlist__qry = undefined;"
				"playlist_autoplay = false;"
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
