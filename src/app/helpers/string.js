const numberFormat = (number, decimals, dec_point, thousands_sep) => {
  // http://phpjs.org/functions/number_format

  number = (number + '')
    .replace(/[^0-9+\-Ee.]/g, '');
  const n = !isFinite(+number) ? 0 : +number;
  const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
  const sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep;
  const dec = (typeof dec_point === 'undefined') ? '.' : dec_point;
  let s = '';
  const toFixedFix = (n, prec) => {
    const k = Math.pow(10, prec);
    return '' + (Math.round(n * k) / k)
        .toFixed(prec);
  };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
      .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  return s.join(dec);
}

const getNumberSign = (number) => {
  return (number > 0) ? '+' : '';
}

const numberSigned = (number) => {
  return getNumberSign(number) + numberFormat(number);
}

export {
  numberFormat,
  numberSigned
}
