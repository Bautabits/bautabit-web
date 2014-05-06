# Installation:
# sudo gem install jekyll rdiscount

SHELL := /bin/bash
.PHONY: site edit server browse clean

all: site

site: _site

_site:
	jekyll build

edit:
	subl .

server: _site
	cd _site && python ../serve.py
	#jekyll --auto --server

clean:
	rm -rf _site
