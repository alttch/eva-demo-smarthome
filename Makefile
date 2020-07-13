IMG=$(grep from Dockerfile|awk '{ print $2 }')
submodules:
	git submodule init
	git submodule update --recursive --remote

update-image-version:
	./update-image-version.sh
	git commit -a -m $IMG
	git push
