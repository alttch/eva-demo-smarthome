#submodules:
	#git submodule init
	#git submodule update --recursive --remote
update-image-version: do-update-image-version pkg commit-ver docker-image

do-update-image-version:
	./update-image-version.sh

commit-ver:
	git commit -a -m "$(shell awk '/^from/ { print $$2 }' Dockerfile)"
	git push

pkg:
	tar --exclude=eva*.js --exclude=apps -czvf ./deploy/smarthome-demo.evapkg setup.py ui runtime/cctvsim

docker-image:
	jks build eva-demo-smarthome
