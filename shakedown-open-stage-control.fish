#!/usr/bin/env fish

open-stage-control \
    --no-gui \
    --custom-module /home/adam/git/shakedown-open-stage-control/custom_module/shakedown.js \
    --theme /home/adam/git/shakedown-open-stage-control/shakedown-theme.css \
    --no-qrcode \
    --load /home/adam/git/shakedown-open-stage-control/shakedown.json \
    --client-options "clientSync=0"  
    # --debug
