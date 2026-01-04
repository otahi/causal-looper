#!/bin/bash

# Download required JavaScript files
curl https://cdn.jsdelivr.net/npm/d3@7 -o d3.js
curl https://cdn.jsdelivr.net/npm/d3-graphviz@5.6.0/build/d3-graphviz.js -o d3-graphviz.js
curl https://cdn.jsdelivr.net/npm/@hpcc-js/wasm@2.2.0/dist/index.min.js -o wasm.js
curl https://unpkg.com/@hpcc-js/wasm/dist/graphvizlib.wasm -o js/graphvizlib.wasm