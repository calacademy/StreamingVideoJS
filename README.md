## Test

```shell
$ cordova run android
```

## Deploy

### Generate release APK

```shell
$ cordova build android --release
```

### Sign with p12 cert

```shell
$ keytool -list -v -keystore pocketpenguins-air.p12

$ jarsigner -storetype pkcs12 -sigalg SHA1withRSA -digestalg SHA1 -keystore pocketpenguins-air.p12 pp.apk 1

$ zipalign 4 pp.apk pp-aligned.apk
```
