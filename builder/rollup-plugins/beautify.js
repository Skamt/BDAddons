const beautify = require('js-beautify').js;

const config = {
	"indent_size": "1",
	"indent_char": "\t",
	"max_preserve_newlines": "2",
	"preserve_newlines": true,
	"keep_array_indentation": false,
	"break_chained_methods": false,
	"indent_scripts": "keep",
	"brace_style": "preserve-inline",
	"space_before_conditional": true,
	"unescape_strings": false,
	"jslint_happy": false,
	"end_with_newline": true,
	"wrap_line_length": "0",
	"indent_inner_html": false,
	"comma_first": false,
	"e4x": false,
	"indent_empty_lines": false
};

module.exports = function() {
	return {
		name: "beautify",
		renderChunk(source) {
			return beautify(source, config)
		}
	};
};