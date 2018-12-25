#!/bin/bash
cp config.ios.xml config.xml
ionic cordova build ios --buildFlag='-UseModernBuildSystem=0'
