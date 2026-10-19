import https from 'https';

const body = JSON.stringify({ ident: null, uid: 'x', pass: 'y' });

const result = await new Promise((resolve, reject) => {
  const req = https.request(
    {
      hostname: 'web.spaggiari.eu',
      path: '/rest/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Z-Dev-ApiKey': 'Tg1NWEwNGIgIC0K',
        'User-Agent': 'CVVS/std/4.1.7 Android/10',
        'Content-Length': Buffer.byteLength(body),
      },
    },
    (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data.slice(0, 200) }));
    },
  );
  req.on('error', reject);
  req.write(body);
  req.end();
});

console.log(JSON.stringify(result));
if (String(result.body).includes('Access Denied')) process.exit(2);
if (result.status === 422 || result.status === 200) process.exit(0);
process.exit(1);
