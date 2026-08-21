#!/bin/bash
cd /workspace
NODE_PATH=/usr/local/lib/node_modules node .test/test_full_scenario.js > /workspace/.test/scenario_output.txt 2>&1
echo "DONE" >> /workspace/.test/scenario_output.txt
