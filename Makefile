submodules:
	git submodule init
	git submodule update --recursive --remote

update-image-version:
	./update-image-version.sh
	git commit -a -m "$(shell grep from Dockerfile|awk '{ print $2 }')"
	git push
