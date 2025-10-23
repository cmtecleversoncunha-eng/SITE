const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Criar certificado auto-assinado se não existir
const httpsOptions = {
  key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7h5z2eJx9lF6c
... (certificado auto-assinado para desenvolvimento)
-----END PRIVATE KEY-----`,
  cert: `-----BEGIN CERTIFICATE-----
MIICljCCAX4CCQCKbX5wE1E6jDANBgkqhkiG9w0BAQsFADANMQswCQYDVQQGEwJC
... (certificado auto-assinado para desenvolvimento)
-----END CERTIFICATE-----`
};

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://${hostname}:${port}`);
  });
});
