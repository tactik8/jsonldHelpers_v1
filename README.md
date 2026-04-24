
# Installation
```
npm install github:tactik8/jsonldHelpers_v1
```


for development continuous :
```
npx nodemon index.js
```

for packaging:
```
npx @vercel/ncc build src/index.js -m -o dist
```

```
npx esbuild src/index.js --bundle --minify --platform=node --outfile=dist/index.js
```
