
build:
	docker build -t bbcrd/swf-hook .

test: build
	docker run --rm -i bbcrd/swf-hook npm test
