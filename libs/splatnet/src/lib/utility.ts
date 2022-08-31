const base64Encode = (value: string): string => {
  return Buffer.from(value, 'binary').toString('base64');
};

const urlSafeBase64Encode = (val: string): string => {
  return base64Encode(val)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const buildQuery = (parameters: { [key: string]: string }): string => {
  let query = '';
  for (const i in parameters) {
    query += i + '=' + parameters[i] + '&';
  }
  query = query.replace(/&$/, '');
  return query;
};

export { urlSafeBase64Encode, buildQuery };
