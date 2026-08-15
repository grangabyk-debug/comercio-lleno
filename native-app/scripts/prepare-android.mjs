import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root=process.cwd()
const androidRoot=path.join(root,'android')
const manifestPath=path.join(androidRoot,'app','src','main','AndroidManifest.xml')
const buildGradlePath=path.join(androidRoot,'app','build.gradle')
const variablesPath=path.join(androidRoot,'variables.gradle')
const iconPath=path.join(root,'assets','icon.svg')

if(!fs.existsSync(manifestPath)) throw new Error('Primero ejecutá npx cap add android.')

let manifest=fs.readFileSync(manifestPath,'utf8')
const permissions=[
  '<uses-permission android:name="android.permission.CAMERA" />',
  '<uses-permission android:name="android.permission.VIBRATE" />',
]
for(const permission of permissions){
  if(!manifest.includes(permission)) manifest=manifest.replace(/<manifest([^>]*)>/,`<manifest$1>\n    ${permission}`)
}
fs.writeFileSync(manifestPath,manifest)

if(fs.existsSync(buildGradlePath)){
  let build=fs.readFileSync(buildGradlePath,'utf8')
  build=build.replace(/versionCode\s+\d+/, 'versionCode 2')
  build=build.replace(/versionName\s+["'][^"']+["']/, 'versionName "1.1.0"')
  fs.writeFileSync(buildGradlePath,build)
}

if(fs.existsSync(variablesPath)){
  let vars=fs.readFileSync(variablesPath,'utf8')
  vars=vars.replace(/compileSdkVersion\s*=\s*\d+/, 'compileSdkVersion = 36')
  vars=vars.replace(/targetSdkVersion\s*=\s*\d+/, 'targetSdkVersion = 36')
  fs.writeFileSync(variablesPath,vars)
}

const densities={mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192}
for(const[density,size]of Object.entries(densities)){
  const dir=path.join(androidRoot,'app','src','main','res',`mipmap-${density}`)
  fs.mkdirSync(dir,{recursive:true})
  const png=await sharp(iconPath).resize(size,size,{fit:'contain'}).png().toBuffer()
  fs.writeFileSync(path.join(dir,'ic_launcher.png'),png)
  fs.writeFileSync(path.join(dir,'ic_launcher_round.png'),png)

  const foregroundSize=Math.round(size*2.25)
  const foreground=await sharp(iconPath).resize(foregroundSize,foregroundSize,{fit:'contain'}).png().toBuffer()
  fs.writeFileSync(path.join(dir,'ic_launcher_foreground.png'),foreground)
}

const valuesDir=path.join(androidRoot,'app','src','main','res','values')
fs.mkdirSync(valuesDir,{recursive:true})
const colorsPath=path.join(valuesDir,'ic_launcher_background.xml')
fs.writeFileSync(colorsPath,'<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#F5FAF7</color>\n</resources>\n')

const splashDir=path.join(androidRoot,'app','src','main','res','drawable')
fs.mkdirSync(splashDir,{recursive:true})
const splash=await sharp({create:{width:1200,height:1200,channels:4,background:'#F5FAF7'}})
  .composite([{input:await sharp(iconPath).resize(360,360,{fit:'contain'}).png().toBuffer(),gravity:'center'}])
  .png().toBuffer()
fs.writeFileSync(path.join(splashDir,'splash.png'),splash)

console.log('Android preparado para Google Play: API 36, versión 1.1.0, cámara, vibración, iconos y splash.')
