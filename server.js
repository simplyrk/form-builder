const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const isDebugMode = process.env.DEBUG === 'true';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(80, (err) => {
    if (err) throw err;
    // Only log in debug mode or as a startup message
    if (isDebugMode || process.env.NODE_ENV === 'production') {
      console.log('> Ready on http://localhost:80');
    }
  });
}); 