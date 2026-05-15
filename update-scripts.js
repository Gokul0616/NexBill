const fs = require('fs');
const paths = [
  './package.json',
  './services/api-gateway/package.json',
  './services/identity-service/package.json',
  './services/subscription-service/package.json',
  './services/billing-service/package.json',
  './services/payment-service/package.json'
];

paths.forEach(p => {
  const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (p === './package.json') {
    pkg.scripts = {
      ...pkg.scripts,
      "dev:all": "concurrently \"npm run dev --prefix services/api-gateway\" \"npm run dev --prefix services/identity-service\" \"npm run dev --prefix services/subscription-service\" \"npm run dev --prefix services/billing-service\" \"npm run dev --prefix services/payment-service\""
    };
  } else {
    pkg.scripts = {
      ...pkg.scripts,
      "start": "node index.js",
      "dev": "nodemon index.js"
    };
  }
  fs.writeFileSync(p, JSON.stringify(pkg, null, 2));
});
