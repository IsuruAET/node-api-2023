# node-api-2023

### Create environment variable files

Create development, production and test env files with following names. Set values using .env.template
.env.development
.env.production
.env.test

### Generate RSA key-pair

> ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key

### Don't add passphrase

> openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub

> cat jwtRS256.key

> cat jwtRS256.key.pub

Encode generated keys

[Base64 encode the keys](https://www.base64encode.org/)
