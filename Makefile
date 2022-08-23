#submodules:
	#git submodule init
	#git submodule update --recursive --remote
update-version: do-update-image-version pkg commit-ver docker-image

do-update-image-version:
	./update-image-version.sh

commit-ver:
	git commit -a -m "$(shell awk '/^from/ { print $$2 }' Dockerfile)"
	git push

pkg:
	#rm -f ./deploy/smarthome-demo.evapkg
	#tar --exclude=eva*.js --exclude=apps -czvf ./deploy/smarthome-demo.evapkg setup.py ui runtime/cctvsim
	rm -rf _build_v4
	mkdir -p _build_v4
	cp -rf ui _build_v4/
	cp -rf runtime/cctvsim4 _build_v4/
	find _build_v4/ui -maxdepth 1 -name "*.j2" -exec \
		sed -i 's/$$eva.debug = true;/&\n        $$eva.api_version = 4;/g' {} \;
	find _build_v4/ui/config -name "*.yml" -exec \
		sed -i 's/f=127.0.0.1/f=.local\/127.0.0.1/g' {} \;
	cd _build_v4 && tar --exclude=eva*.js --exclude=apps -czvf ../deploy/smarthome-demo.tgz ui cctvsim4

docker-image:
	jks build eva-demo-smarthome
