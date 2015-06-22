/*
 * micro-markdown.js
 * markdown in under 5kb
 *
 * Copyright 2014, Simon Waldherr - http://simon.waldherr.eu/
 * Released under the MIT Licence
 * http://simon.waldherr.eu/license/mit/
 *
 * Github:  https://github.com/simonwaldherr/micromarkdown.js/
 * Version: 0.3.0
 */

/*jshint strict: true */

//refactor to more semantic and readable method names
var regExpObject = {
  headline: /^(\#{1,6})([^\#\n]+)$/m,
  code: /\s\`\`\`\n?([^`]+)\`\`\`/g,
  hr: /^(?:([\*\-_] ?)+)\1\1$/gm,
  lists: /^((\s*((\*|\-)|\d(\.|\))) [^\n]+)\n)+/gm,
  boldItalic: /(?:([\*_~]{1,3}))([^\*_~\n]+[^\*_~\s])\1/g,
  links: /!?\[([^\]<>]+)\]\(([^ \)<>]+)( "[^\(\)\"]+")?\)/g,
  reflinks: /\[([^\]]+)\]\[([^\]]+)\]/g,
  smlinks: /\@([a-z0-9]{3,})\@(t|gh|fb|gp|adn)/gi,
  mail: /<(([a-z0-9_\-\.])+\@([a-z0-9_\-\.])+\.([a-z]{2,7}))>/gmi,
  tables: /\n(([^|\n]+ *\| *)+([^|\n]+\n))((:?\-+:?\|)+(:?\-+:?)*\n)((([^|\n]+ *\| *)+([^|\n]+)\n)+)/g,
  include: /[\[<]include (\S+) from (https?:\/\/[a-z0-9\.\-]+\.[a-z]{2,9}[a-z0-9\.\-\?\&\/]+)[\]>]/gi,
  url: /<([a-zA-Z0-9@:%_\+.~#?&\/\/=]{2,256}\.[a-z]{2,4}\b(\/[\-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)?)>/g
};

//handle codes
function codeHandler(mdStr, execStr) {
  return mdStr.replace(execStr[0], '<code>\n' + htmlEncode(execStr[1]).replace(/\n/gm, '<br/>').replace(/\ /gm, '&nbsp;') + '</code>\n');
}

//handle headlines
function headlineHandler(mdStr, execStr) {
  var count = execStr[1].length;
  return mdStr.replace(execStr[0], '<h' + count + '>' + execStr[2] + '</h' + count + '>' + '\n');
}

//handle lists
//TODO-large method
function listHandler(mdStr, execStr) {
  var casca = 0,
    helper1 = [],
    replaceStr,
    helper = execStr[0].split('\n'),
    status = 0,
    indent = false,
    i,
    line = 0,
    nstatus = 0;

  //ordered or unordered lists
  if ((execStr[0].trim().substr(0, 1) === '*') || (execStr[0].trim().substr(0, 1) === '-')) {
    replaceStr = '<ul>';
  } else {
    replaceStr = '<ol>';
  }

  for (i = 0; i < helper.length; i++) {
    if ((line = /^((\s*)((\*|\-)|\d(\.|\))) ([^\n]+))/.exec(helper[i])) !== null) {
      if ((line[2] === undefined) || (line[2].length === 0)) {
        nstatus = 0;
      } else {
        if (indent === false) {
          indent = line[2].replace(/\t/, '    ').length;
        }
        nstatus = Math.round(line[2].replace(/\t/, '    ').length / indent);
      }
      while (status > nstatus) {
        replaceStr += helper1.pop();
        status--;
        casca--;
      }
      while (status < nstatus) {
        if ((line[0].trim().substr(0, 1) === '*') || (line[0].trim().substr(0, 1) === '-')) {
          replaceStr += '<ul>';
          helper1.push('</ul>');
        } else {
          replaceStr += '<ol>';
          helper1.push('</ol>');
        }
        status++;
        casca++;
      }
      replaceStr += '<li>' + line[6] + '</li>' + '\n';
    }
  }
  while (casca > 0) {
    replaceStr += '</ul>';
    casca--;
  }
  if ((execStr[0].trim().substr(0, 1) === '*') || (execStr[0].trim().substr(0, 1) === '-')) {
    replaceStr += '</ul>';
  } else {
    replaceStr += '</ol>';
  }

  return mdStr.replace(execStr[0], replaceStr + '\n');
}

//handler table
//TODO-another large method
function tableHandler(mdStr, execStr, strict) {
  var replaceStr = '<table><tr>';
  var helper = execStr[1].split('|');
  var calign = execStr[4].split('|');
  var i, j;

  for (i = 0; i < helper.length; i++) {
    if (calign.length <= i) {
      calign.push(0);
    } else if ((calign[i].trimRight().slice(-1) === ':') && (strict !== true)) {
      if (calign[i][0] === ':') {
        calign[i] = 3;
      } else {
        calign[i] = 2;
      }
    } else if (strict !== true) {
      if (calign[i][0] === ':') {
        calign[i] = 1;
      } else {
        calign[i] = 0;
      }
    } else {
      calign[i] = 0;
    }
  }
  var cel = ['<th>', '<th align="left">', '<th align="right">', '<th align="center">'];
  for (i = 0; i < helper.length; i++) {
    replaceStr += cel[calign[i]] + helper[i].trim() + '</th>';
  }
  replaceStr += '</tr>';
  cel = ['<td>', '<td align="left">', '<td align="right">', '<td align="center">'];
  var helper1 = execStr[7].split('\n');
  for (i = 0; i < helper1.length; i++) {
    var helper2 = helper1[i].split('|');
    if (helper2[0].length !== 0) {
      while (calign.length < helper2.length) {
        calign.push(0);
      }
      replaceStr += '<tr>';
      for (j = 0; j < helper2.length; j++) {
        replaceStr += cel[calign[j]] + helper2[j].trim() + '</td>';
      }
      replaceStr += '</tr>' + '\n';
    }
  }
  replaceStr += '</table>';
  mdStr = mdStr.replace(execStr[0], replaceStr);
  return mdStr;
}

//handle italic and bold
function boldItalicHandler(mdStr, execStr) {
  var replaceStr = [];
  var replaceTags = [['<i>', '</i>'], ['<b>', '</b>'], ['<i><b>', '</b></i>']];

  if (execStr[1] === '~~') {
    mdStr = mdStr.replace(execStr[0], '<del>' + execStr[2] + '</del>');
  } else {
    //remove switch conditionals
    replaceStr = replaceTags[execStr[1].length - 1];
    mdStr = mdStr.replace(execStr[0], replaceStr[0] + execStr[2] + replaceStr[1]);
  }
  return mdStr;
}

//handle links
function linkHandler(mdStr, execStr, strict) {
  if (execStr[0].substr(0, 1) === '!') {
    mdStr = mdStr.replace(execStr[0], '<img src="' + execStr[2] + '" alt="' + execStr[1] + '" title="' + execStr[1] + '" />\n');
  } else {
    mdStr = mdStr.replace(execStr[0], '<a ' + addMarkdownClass(execStr[2], strict) + 'href="' + execStr[2] + '">' + execStr[1] + '</a>\n');
  }
  return mdStr;
}

//handle emails
function emailHandler(mdstr, execStr) {
  mdstr = mdstr.replace(execStr[0], '<a href="mailto:' + execStr[1] + '">' + execStr[1] + '</a>');
  return mdstr;
}

//handle urls
function urlHandler(mdStr, execStr, strict) {
  var replaceStr = execStr[1];
  if (replaceStr.indexOf('://') === -1) {
    replaceStr = 'http://' + replaceStr;
  }
  mdStr = mdStr.replace(execStr[0], '<a ' + addMarkdownClass(replaceStr, strict) + 'href="' + replaceStr + '">' + replaceStr.replace(/(https:\/\/|http:\/\/|mailto:|ftp:\/\/)/gmi, '') + '</a>');
  return mdStr;
}

//handle reference links
function refLinkHandler(mdStr, execStr, strict) {
    var helper, trashgc = [];
    var helper1 = new RegExp('\\[' + execStr[2] + '\\]: ?([^ \n]+)', "gi");
    if ((helper = helper1.exec(mdStr)) !== null) {
        mdStr = mdStr.replace(execStr[0], '<a ' + addMarkdownClass(helper[1], strict) + 'href="' + helper[1] + '">' + execStr[1] + '</a>');
        trashgc.push(helper[0]);
    }
    return {
        str: mdStr,
        trashgc: trashgc
    };
}

//handle smlinks
function smlinkHandler(str, execStr, strict) {
    var urlObj = {
        t: 'https://twitter.com/',
        gh: 'https://github.com/',
        fb: 'https://www.facebook.com/',
        gp: 'https://plus.google.com/+'
    };
    var replaceStr = urlObj[execStr[2]] + execStr[1];
    return str.replace(execStr[0], '<a ' + addMarkdownClass(replaceStr, strict) + 'href="' + replaceStr + '">' + execStr[1] + '</a>');
}

//handle hr
function hrHandler(mdStr, execStr) {
  return mdStr.replace(execStr[0], '\n<hr/>\n');
}

//encode to html string
function htmlEncode(mdStr) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(mdStr));
  mdStr = div.innerHTML;
  return mdStr;
}

//add mmd class to apply styles
function addMarkdownClass(str, strict) {
  var urlTemp;
  if ((str.indexOf('/') !== -1) && (strict !== true)) {
    urlTemp = str.split('/');
    if (urlTemp[1].length === 0) {
      urlTemp = urlTemp[2].split('.');
    } else {
      urlTemp = urlTemp[0].split('.');
    }
    return 'class="mmd_' + urlTemp[urlTemp.length - 2].replace(/[^\w\d]/g, '') + urlTemp[urlTemp.length - 1] + '" ';
  }
  return '';
}

//micro markdown main parse function
function parse(str, strict) {
  var execStr, trashgc = [];

  str = '\n' + str + '\n';

  //strict mode
  if (strict !== true) {
    regExpObject.lists = /^((\s*(\*|\d\.) [^\n]+)\n)+/gm;
  }

  /* code */
  while ((execStr = regExpObject.code.exec(str)) !== null) {
    str = codeHandler(str, execStr);
  }

  /* headlines */
  while ((execStr = regExpObject.headline.exec(str)) !== null) {
    str = headlineHandler(str, execStr);
  }

  /* lists */
  while ((execStr = regExpObject.lists.exec(str)) !== null) {
    str = listHandler(str, execStr);
  }

  /* tables */
  while ((execStr = regExpObject.tables.exec(str)) !== null) {
    str = tableHandler(str, execStr, strict);
  }

  /* bold and italic
   * TODO-why loop 3 times? should there a better idea? */
  for (var i = 0; i < 3; i++) {
    while ((execStr = regExpObject.boldItalic.exec(str)) !== null) {
      str = boldItalicHandler(str, execStr);
    }
  }

  /* links */
  while ((execStr = regExpObject.links.exec(str)) !== null) {
    str = linkHandler(str, execStr, strict);
  }

  /* emails */
  while ((execStr = regExpObject.mail.exec(str)) !== null) {
    str = emailHandler(str, execStr);
  }

  /* url */
  while ((execStr = regExpObject.url.exec(str)) !== null) {
    str = urlHandler(str, execStr, strict);
  }

  /* reference links */
  while ((execStr = regExpObject.reflinks.exec(str)) !== null) {
      var _ret = refLinkHandler(str, execStr, strict);
      str = _ret.str;
      trashgc = _ret.trashgc;
  }

  //  wtf?
  //TODO-remove this forLoop
  for (i = 0; i < trashgc.length; i++) {
    str = str.replace(trashgc[i], '');
  }

  /* smlinks */
  while ((execStr = regExpObject.smlinks.exec(str)) !== null) {
      str = smlinkHandler(str, execStr, strict);
  }

  /* horizontal line */
  while ((execStr = regExpObject.hr.exec(str)) !== null) {
    str = hrHandler(str, execStr);
  }

  //replace the whitespace and linefeed,
  //then return parsed markdown string
  return str.replace(/ {2,}[\n]{1,}/gmi, '<br/><br/>');
}