#!/usr/bin/env fish

open-stage-control \
    --no-gui \
    --custom-module /home/adam/git/beard-open-stage-control/custom_module/shakedown.js\
    --theme /home/adam/git/beard-open-stage-control/beard-theme.css \
    --no-qrcode \
    --client-options "clientSync=0" 
    # --load /home/adam/git/beard-open-stage-control/beard-test-eq-resize.json
    # --debug
