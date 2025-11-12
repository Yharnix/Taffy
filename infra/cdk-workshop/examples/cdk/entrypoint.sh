#!/bin/bash
set -e
cdk deploy --require-approval never --outputs-file outputs.json
cat outputs.json
DNS=$(jq -r '.[] | .ServiceDNS' outputs.json)
echo "url -> ${DNS}"
output="http://github-webhook.taffyrun.com/deployed?owner=${OWNER}&repo=${REPO}&pr_number=${PR}&dns=${DNS}"
echo $output
curl "$output"
