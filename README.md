### Generating apks

```shell
#!/bin/sh

$ keytool -list -v -keystore pocketpenguins-air.p12

$ jarsigner -storetype pkcs12 -sigalg SHA1withRSA -digestalg SHA1 -keystore pocketpenguins-air.p12 pp.apk 1

$ zipalign 4 pp.apk pp-aligned.apk
```
