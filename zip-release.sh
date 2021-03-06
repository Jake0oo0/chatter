#!/bin/bash
# This script zips all of the releases into separate zip files for
# easy uploading to Github or wherever else necessary.

cd build/Chatter;
for i in */; do 
	cd "$i";
  rm -rf locales/
	zip -r "../chatter-${i%/}.zip" "."; 
	echo "Zipped $i"; 
	cd ../; 
done