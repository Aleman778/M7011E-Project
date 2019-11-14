#!/bin/bash
echo "Installing node.js ..."
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install nodejs
echo "Installing node packages..."
npm install
echo "Starting server..."
npm start
