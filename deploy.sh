#!/bin/bash
set -e
git pull origin master
pm2 restart $1
pm2 log $1