submodules:
	git submodule init
	git submodule update --recursive --remote

update-image-version:
	./update-image-version.sh
	git commit -a -m "$(shell awk '/^from/ { print $$2 }' Dockerfile)"
	git push
