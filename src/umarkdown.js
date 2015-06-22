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
var regExpObeject = {
  headline: /^(\#{1,6})([^\#\n]+)$/m,
  code: /\s\`\`\`\n?([^`]+)\`\`\`/g,
  hr: /^(?:([\*\-_] ?)+)\1\1$/gm,
  lists: /^((\s*((\*|\-)|\d(\.|\))) [^\n]+)\n)+/gm,
  bolditalic: /(?:([\*_~]{1,3}))([^\*_~\n]+[^\*_~\s])\1/g,
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
  return mdStr.replace(execStr[0], '<code>\n' + micromarkdown.htmlEncode(execStr[1]).replace(/\n/gm, '<br/>').replace(/\ /gm, '&nbsp;') + '</code>\n');
}

//handle headlines
function headlineHandler(mdStr, execStr) {
  var count = execStr[1].length;
  return mdStr.replace(execStr[0], '<h' + count + '>' + execStr[2] + '</h' + count + '>' + '\n');
}

//handle lists
function listHandler(mdStr, execStr) {
  var casca = 0,
    helper1 = [],
    repstr,
    helper = execStr[0].split('\n'),
    status = 0,
    indent = false,
    i,
    line = 0,
    nstatus = 0;

  //ordered or unordered lists
  if ((execStr[0].trim().substr(0, 1) === '*') || (execStr[0].trim().substr(0, 1) === '-')) {
    repstr = '<ul>';
  } else {
    repstr = '<ol>';
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
        repstr += helper1.pop();
        status--;
        casca--;
      }
      while (status < nstatus) {
        if ((line[0].trim().substr(0, 1) === '*') || (line[0].trim().substr(0, 1) === '-')) {
          repstr += '<ul>';
          helper1.push('</ul>');
        } else {
          repstr += '<ol>';
          helper1.push('</ol>');
        }
        status++;
        casca++;
      }
      repstr += '<li>' + line[6] + '</li>' + '\n';
    }
  }
  while (casca > 0) {
    repstr += '</ul>';
    casca--;
  }
  if ((execStr[0].trim().substr(0, 1) === '*') || (execStr[0].trim().substr(0, 1) === '-')) {
    repstr += '</ul>';
  } else {
    repstr += '</ol>';
  }

  return mdStr.replace(execStr[0], repstr + '\n');
}

//handler table
function tableHandler(str, stra) {
  var repstr = '<table><tr>';
  var helper = stra[1].split('|');
  var calign = stra[4].split('|');
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
  for (var i = 0; i < helper.length; i++) {
    repstr += cel[calign[i]] + helper[i].trim() + '</th>';
  }
  repstr += '</tr>';
  cel = ['<td>', '<td align="left">', '<td align="right">', '<td align="center">'];
  var helper1 = stra[7].split('\n');
  for (i = 0; i < helper1.length; i++) {
    var helper2 = helper1[i].split('|');
    if (helper2[0].length !== 0) {
      while (calign.length < helper2.length) {
        calign.push(0);
      }
      repstr += '<tr>';
      for (j = 0; j < helper2.length; j++) {
        repstr += cel[calign[j]] + helper2[j].trim() + '</td>';
      }
      repstr += '</tr>' + '\n';
    }
  }
  repstr += '</table>';
  str = str.replace(stra[0], repstr);
  return str;
}

//handle italic and bold
function italicboldHandler(str, stra) {
  while ((stra = regExpObeject.bolditalic.exec(str)) !== null) {
    var repstr = [];
    if (stra[1] === '~~') {
      str = str.replace(stra[0], '<del>' + stra[2] + '</del>');
    } else {
      switch (stra[1].length) {
        case 1:
          repstr = ['<i>', '</i>'];
          break;
        case 2:
          repstr = ['<b>', '</b>'];
          break;
        case 3:
          repstr = ['<i><b>', '</b></i>'];
          break;
      }
      str = str.replace(stra[0], repstr[0] + stra[2] + repstr[1]);
    }
  }
  return str;
}

//handle links
function linkHandler(str, stra, strict) {
  if (stra[0].substr(0, 1) === '!') {
    str = str.replace(stra[0], '<img src="' + stra[2] + '" alt="' + stra[1] + '" title="' + stra[1] + '" />\n');
  } else {
    str = str.replace(stra[0], '<a ' + micromarkdown.mmdCSSclass(stra[2], strict) + 'href="' + stra[2] + '">' + stra[1] + '</a>\n');
  }
  return str;
}

//handle emails
function emailHandler(str, stra) {
  str = str.replace(stra[0], '<a href="mailto:' + stra[1] + '">' + stra[1] + '</a>');
  return str;
}

//handle urls
function urlHandler(str, stra, strict) {
  var replaceStr = stra[1];
  if (replaceStr.indexOf('://') === -1) {
    replaceStr = 'http://' + replaceStr;
  }
  str = str.replace(stra[0], '<a ' + micromarkdown.mmdCSSclass(replaceStr, strict) + 'href="' + replaceStr + '">' + replaceStr.replace(/(https:\/\/|http:\/\/|mailto:|ftp:\/\/)/gmi, '') + '</a>');
  return str;
}

//handle reference links

var micromarkdown = {
  parse: function(str, strict) {
    var line, nstatus = 0,
      status, cel, calign, indent, helper, helper1, helper2, count, repstr, stra, trashgc = [],
      casca = 0,
      i = 0,
      j = 0;
    str = '\n' + str + '\n';

    if (strict !== true) {
      regExpObeject.lists = /^((\s*(\*|\d\.) [^\n]+)\n)+/gm;
    }

    /* code */
    while ((stra = regExpObeject.code.exec(str)) !== null) {
      str = codeHandler(str, stra);
    }

    /* headlines */
    while ((stra = regExpObeject.headline.exec(str)) !== null) {
      str = headlineHandler(str, stra);
    }

    /* lists */
    while ((stra = regExpObeject.lists.exec(str)) !== null) {
      str = listHandler(str, stra)
    }

    /* tables */
    while ((stra = regExpObeject.tables.exec(str)) !== null) {
      str = tableHandler(str, stra);
    }

    /* bold and italic */
    for (i = 0; i < 3; i++) {
      str = italicboldHandler(str, stra);
    }

    /* links */
    while ((stra = regExpObeject.links.exec(str)) !== null) {
      str = linkHandler(str, stra, strict);
    }

    /* emails */
    while ((stra = regExpObeject.mail.exec(str)) !== null) {
      str = emailHandler(str, stra);
    }

    /* url */
    while ((stra = regExpObeject.url.exec(str)) !== null) {
      str = urlHandler(str, stra, strict);
    }

    /* reference links */
    while ((stra = regExpObeject.reflinks.exec(str)) !== null) {
      helper1 = new RegExp('\\[' + stra[2] + '\\]: ?([^ \n]+)', "gi");
      if ((helper = helper1.exec(str)) !== null) {
        str = str.replace(stra[0], '<a ' + micromarkdown.mmdCSSclass(helper[1], strict) + 'href="' + helper[1] + '">' + stra[1] + '</a>');
        trashgc.push(helper[0]);
      }
    }
    for (i = 0; i < trashgc.length; i++) {
      str = str.replace(trashgc[i], '');
    }
    while ((stra = regExpObeject.smlinks.exec(str)) !== null) {
      switch (stra[2]) {
        case 't':
          repstr = 'https://twitter.com/' + stra[1];
          break;
        case 'gh':
          repstr = 'https://github.com/' + stra[1];
          break;
        case 'fb':
          repstr = 'https://www.facebook.com/' + stra[1];
          break;
        case 'gp':
          repstr = 'https://plus.google.com/+' + stra[1];
          break;
      }
      str = str.replace(stra[0], '<a ' + micromarkdown.mmdCSSclass(repstr, strict) + 'href="' + repstr + '">' + stra[1] + '</a>');
    }

    /* horizontal line */
    while ((stra = regExpObeject.hr.exec(str)) !== null) {
      str = str.replace(stra[0], '\n<hr/>\n');
    }

    str = str.replace(/ {2,}[\n]{1,}/gmi, '<br/><br/>');
    return str;
  },
  htmlEncode: function(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    str = div.innerHTML;
    return str;
  },
  mmdCSSclass: function(str, strict) {
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
};

ArtisanStack.md = micromarkdown;
