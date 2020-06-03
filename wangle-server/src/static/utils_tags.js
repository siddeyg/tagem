"function populate_t_id2name_table(url, selector){"
	"get_json(url, function(data){"
		"var s = \"\";"
		"for (const [id, tpl] of Object.entries(data)){"
			"s += \"<div class='tr'>\";"
			"s += \"<div class='td'><a href='/t#\" + id + \"'>\" + tpl[0] + \"</a></div>\";"
			"s += \"</div>\";"
		"}"
		"$(selector).html(s);"
	"});"
"}"
"function populate_t_table(url, selector){"
	"get_json(url, function(data){"
		"var s = \"\";"
		"for (var tagid of data){"
			"s += \"<div class='tr'>\";"
			"s += \"<div class='td'>\" + tagid + \"</div>\";"
			"s += \"</div>\";"
		"}"
		"$(selector).html(s);"
		"column_id2name('/a/t.json', selector, '/t#', 0);"
	"});"
"}"
"function set_tag_name_from_id(id, selector){"
	"get_json('/a/t.json', function(data){"
		"tag_name = data[id][0];"
		"$(selector).text(tag_name);"
	"});"
"}"
"function set_tag_thumb_from_id(id, selector){"
	"get_json('/a/t.json', function(data){"
		"$(selector).attr(\"src\", data[id][1]);"
	"});"
"}"
"function set_tag_cover_from_id(id, selector){"
	"get_json('/a/t.json', function(data){"
		"$(selector).attr(\"src\", data[id][2]);"
	"});"
"}"
"function populate_tagselect(tagselect){"
	"get_json(\"/a/t.json\", function(data){"
		"var s = \"\";"
		"for (const [id, tpl] of Object.entries(data)){"
			"s += \"<option value='\" + id + \"'>\" + tpl[0] + \"</option>\";"
		"}"
		"tagselect.html(s);"
		"tagselect.select2();" // Initialise it
	"});"
"}"

"function display_parent_tags(tag_id, selector){"
	// Similar to display_parent_dirs
	"get_json('/a/t2p.json', function(t2p){"
		"get_json('/a/t.json', function(t){"
			"const arr = t2p.filter(x => (x[0] == tag_id)).map(x => x[1]).map(x => \"<div class='user'><img src='\" + t[x][1] + \"' class='user-img'/><div class='username'><a href='/t#\" + x + \"'>\" + t[x][0] + \"</a></div></div>\");"
			"$(selector).html(arr.join(\"<br/>\"));"
		"});"
	"});"
"}"
"function display_child_tags(tag_id, selector){"
	"get_json('/a/t2p.json', function(t2p){"
		"get_json('/a/t.json', function(t){"
			"const arr = t2p.filter(x => (x[1] == tag_id)).map(x => x[0]).map(x => \"<div class='user'><img src='\" + t[x][1] + \"' class='user-img'/><div class='username'><a href='/t#\" + x + \"'>\" + t[x][0] + \"</a></div></div>\");"
			"$(selector).html(arr.join(\"<br/>\"));"
		"});"
	"});"
"}"
