#!/bin/bash
curl -c cookies.txt -s -u admin:1b15525f3e4345c098edae93d400d15a 'http://localhost:8080/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,"%22:%22",//crumb)' > crumb.txt
CRUMB=$(cat crumb.txt | sed 's/"//g')
curl -X POST -u admin:1b15525f3e4345c098edae93d400d15a -b cookies.txt -H "$CRUMB" 'http://localhost:8080/job/deakin-coffee-pipeline/build'
echo "Build triggered!"
