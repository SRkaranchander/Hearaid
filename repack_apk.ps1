$ErrorActionPreference = "Stop"

$baseDir = "e:\vscodes\hearaid\HearAid-main"
$srcApk = "$baseDir\HearAidapp.bak"
$targetApk = "$baseDir\HearAidapp.apk"
$apkFile = "$baseDir\HearAidapp"
$tempDir = "$baseDir\apk_temp"
$clientBuild = "$baseDir\client\build"
$jdkBin = "C:\Users\karan chander S.R\oracleJdk-26\bin"
$keystore = "$baseDir\debug.keystore"

Write-Host "1. Cleaning temp directory..."
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "2. Extracting original APK..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($srcApk, $tempDir)

Write-Host "3. Updating web assets with latest client build..."
$targetPublic = "$tempDir\assets\public"
if (-not (Test-Path $targetPublic)) {
    New-Item -ItemType Directory -Path $targetPublic | Out-Null
}

# Remove old static folder
if (Test-Path "$targetPublic\static") {
    Remove-Item "$targetPublic\static" -Recurse -Force
}

# Copy all files from client/build
Copy-Item "$clientBuild\*" -Destination $targetPublic -Recurse -Force

# Ensure cordova stubs exist
if (-not (Test-Path "$targetPublic\cordova.js")) {
    New-Item -ItemType File -Path "$targetPublic\cordova.js" | Out-Null
}
if (-not (Test-Path "$targetPublic\cordova_plugins.js")) {
    New-Item -ItemType File -Path "$targetPublic\cordova_plugins.js" | Out-Null
}

Write-Host "4. Removing old cryptographic signatures..."
$metaInf = "$tempDir\META-INF"
if (Test-Path "$metaInf\CERT.SF") { Remove-Item "$metaInf\CERT.SF" -Force }
if (Test-Path "$metaInf\CERT.RSA") { Remove-Item "$metaInf\CERT.RSA" -Force }
if (Test-Path "$metaInf\MANIFEST.MF") { Remove-Item "$metaInf\MANIFEST.MF" -Force }

Write-Host "5. Repacking into standard Android APK (forcing forward slashes)..."
if (Test-Path $targetApk) { Remove-Item $targetApk -Force }

$zip = [System.IO.Compression.ZipFile]::Open($targetApk, [System.IO.Compression.ZipArchiveMode]::Create)
$allFiles = Get-ChildItem -Path $tempDir -Recurse | Where-Object { -not $_.PSIsContainer }
$prefixLen = $tempDir.Length + 1

foreach ($file in $allFiles) {
    $entryName = $file.FullName.Substring($prefixLen).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $entryName)
}
$zip.Dispose()

# Copy to extensionless HearAidapp
Copy-Item $targetApk -Destination $apkFile -Force

Write-Host "6. Checking or creating debug keystore..."
if (-not (Test-Path $keystore)) {
    & "$jdkBin\keytool.exe" -genkey -v -keystore $keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
}

Write-Host "7. Signing APKs with jarsigner..."
& "$jdkBin\jarsigner.exe" -keystore $keystore -storepass android -keypass android $targetApk androiddebugkey
& "$jdkBin\jarsigner.exe" -keystore $keystore -storepass android -keypass android $apkFile androiddebugkey

Write-Host "8. Cleaning up temp directory..."
Remove-Item $tempDir -Recurse -Force

Write-Host "SUCCESS! Both HearAidapp.apk and HearAidapp updated and signed with forward-slash assets!"
