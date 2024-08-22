exports.findValue = function ($, term) {
  const dtElement = $.find('dt').filter(function () {
    return $(this).text().trim() === term;
  });
  return dtElement.next('dd').text().trim().replace('  ', ' ');
};

exports.findCommunityCardValue = function (_$, el, term) {
  const dtElement = _$(el).find('.communityspecstitles').filter(function () {
    return _$(this).text().trim() === term;
  });
  return dtElement.next('.communityspecsvalues').text().trim().replace('  ', ' ');
};
