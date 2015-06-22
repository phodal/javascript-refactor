describe("Markdown", function () {
	beforeEach(function () {

	});
	afterEach(function () {

	});

	it("should parse h1~h3", function () {
		expect(ArtisanStack.md.parse("#Header1")).toBe("\n<h1>Header1</h1>\n\n");
		expect(ArtisanStack.md.parse("##Header2")).toBe("\n<h2>Header2</h2>\n\n");
		expect(ArtisanStack.md.parse("###Header3")).toBe("\n<h3>Header3</h3>\n\n");
		expect(ArtisanStack.md.parse("---")).toBe("\n\n<hr/>\n\n");
	});

	it("should parse link", function () {
		expect(ArtisanStack.md.parse("[phodal](http://www.phodal.com/)"))
			.toBe('\n<a class="mmd_phodalcom" href="http://www.phodal.com/">phodal</a>\n\n');

		expect(ArtisanStack.md.parse("![phodal](http://www.phodal.com/favicon.ico)"))
			.toBe('\n<img src="http://www.phodal.com/favicon.ico" alt="phodal" title="phodal" />\n\n');

		expect(ArtisanStack.md.parse("<h@phodal.com>")).toBe('\n<a href="mailto:h@phodal.com">h@phodal.com</a>\n');

		expect(ArtisanStack.md.parse("<http://www.phodal.com>"))
			.toBe('\n<a class="mmd_phodalcom" href="http://www.phodal.com">www.phodal.com</a>\n');

		expect(ArtisanStack.md.parse("[phodal][1]\n[1]: http://www.phodal.com/"))
			.toBe('\n<a class="mmd_phodalcom" href="http://www.phodal.com/">phodal</a>\n\n');
	});

	it("should special link", function () {
		expect(ArtisanStack.md.parse("* Twitter @phodal@t"))
			.toBe('<ul><li>Twitter <a class="mmd_twittercom" href="https://twitter.com/phodal">phodal</a></li>\n</ul>\n');

		expect(ArtisanStack.md.parse("* GitHub @phodal@gh"))
			.toBe('<ul><li>GitHub <a class="mmd_githubcom" href="https://github.com/phodal">phodal</a></li>\n</ul>\n');

		expect(ArtisanStack.md.parse("* Facebook @phodal@fb"))
			.toBe('<ul><li>Facebook <a class="mmd_facebookcom" href="https://www.facebook.com/phodal">phodal</a></li>\n</ul>\n');

		expect(ArtisanStack.md.parse("* Google+ @phodal@gp"))
			.toBe('<ul><li>Google+ <a class="mmd_googlecom" href="https://plus.google.com/+phodal">phodal</a></li>\n</ul>\n');
	});

	it("should parse font style", function () {
		expect(ArtisanStack.md.parse("**bold** text")).toBe('\n<b>bold</b> text\n');
		expect(ArtisanStack.md.parse("*italic* test")).toBe('\n<i>italic</i> test\n');
		expect(ArtisanStack.md.parse("~~italic~~ test")).toBe('\n<del>italic</del> test\n');
		expect(ArtisanStack.md.parse("*italic and **bold** text*")).toBe('\n<i>italic and <b>bold</b> text</i>\n');
	});

	it("should parse code", function () {
		expect(ArtisanStack.md.parse('```\nvar md   = document.getElementById("md").value```'))
			.toBe('<code>\nvar&nbsp;md&nbsp;&nbsp;&nbsp;=&nbsp;document.getElementById("md").value</code>\n\n');
	});

	it("should parse ul list", function () {
		expect(ArtisanStack.md.parse('* this\n* is a\n* list'))
			.toBe('<ul><li>this</li>\n<li>is a</li>\n<li>list</li>\n</ul>\n');

		expect(ArtisanStack.md.parse('1. this\n2. is a'))
			.toBe('<ol><li>this</li>\n<li>is a</li>\n</ol>\n');

		expect(ArtisanStack.md.parse('* this \n* is a\n  1. test\n  1. and\n  1. demo\n* list'))
			.toBe('<ul><li>this </li>\n<li>is a</li>\n<ol><li>test</li>\n<li>and</li>\n<li>demo</li>\n</ol><li>list</li>\n</ul>\n');
	});

	it("should parse ul table", function () {
		expect(ArtisanStack.md.parse('this | is a   | table\n-----|--------|--------\nwith | sample | content'))
			.toBe('<table><tr><th>this</th><th>is a</th><th>table</th></tr><tr><td>with</td><td>sample</td><td>content</td></tr>\n</table>');

		expect(ArtisanStack.md.parse('this | is a   | table\n-----:|:--------:|:--------\nwith | sample | content'))
			.toBe('<table><tr><th align="right">this</th><th align="center">is a</th><th align="left">table</th></tr><tr><td align="right">with</td><td align="center">sample</td><td align="left">content</td></tr>\n</table>');
	});

	it("should add the correct CSS class", function () {
		expect(ArtisanStack.md.addMarkdownClass('', '')).toBe('');
		expect(ArtisanStack.md.addMarkdownClass('894mayo.cc', false)).toBe('');
		expect(ArtisanStack.md.addMarkdownClass('http://894mayo.cc', false)).toBe('class="mmd_894mayocc" ');
	});

});

