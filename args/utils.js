function prettyDate(date, compareTo) {
  compareTo = compareTo || new Date();
  var diff = (compareTo.getTime() - date.getTime()) / 1000;
  var dayDiff = Math.floor(diff / 86400);

  if (dayDiff < 0) {
    return '';
  }

  if (dayDiff === 0) {
    if (diff < 60) {
      return 'Just Now';
    } else if (diff < 120) {
      return '1 minute ago';
    } else if (diff < 3600) {
      return Math.floor(diff / 60) + ' minutes ago';
    } else if (diff < 7200) {
      return '1 hour ago';
    } else if (diff < 86400) {
      return Math.floor(diff / 3600) + ' hours ago';
    }
  } else if (dayDiff === 1) {
    return 'Yesterday';
  } else if(dayDiff < 7) {
    return dayDiff + ' days ago';
  } else if (dayDiff === 7) {
    return '1 week ago';
  } else if (dayDiff < 42) {
    return Math.ceil(dayDiff / 7) + ' weeks ago';
  } else if (dayDiff < 365) {
    return Math.ceil(dayDiff * 12 / 365) + ' months ago';
  } else {
    var years = Math.round(dayDiff / 365);
    return years + ' year' + (years != 1 ? 's' : '') + ' ago';
  }
}

exports.prettyDate = prettyDate;