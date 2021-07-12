#!/bin/sh

eva lm job create --enable "@system('/opt/sse/_sse.sh')" every 1 minute
