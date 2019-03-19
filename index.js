const nwBuild = require('./src/nw-build')
const winBuild = require('./src/win-build')
const publish = require('./src/publish.js')
const path = require('path')
const fs = require('fs')

const resolvePath = function () {
  return path.resolve(process.env.INIT_CWD, ...arguments)
}

let project_package = require(resolvePath('package.json'))

module.exports = async function () {
  if (!project_package.build) throw new Error('请在package.json中添加build')
  if (project_package.build.createDesktopIcon === undefined) project_package.build.createDesktopIcon = true
  let nwBuilder = {
    files: project_package.build.files,
    platforms: project_package.build.platforms || ['win'],
    version: project_package.build.nwVersion || '0.14.7',
    flavor: project_package.build.nwFlavor || 'normal',
    appName: project_package.name,
    appVersion: project_package.version,
    buildType: () => 'win-unpacked',
    zip: true,
    winVersionString: {
      CompanyName: project_package.author || '',
      FileVersion: project_package.version,
      LegalCopyright: project_package.build.copyright || ''
    }
  }
  if (project_package.build.icon) {
    nwBuilder.winIco = resolvePath(project_package.build.icon)
  }
  if (project_package.build.output) {
    nwBuilder.buildDir = resolvePath(project_package.build.output)
  }
  nwBuilder.winVersionString.FileDescription = nwBuilder.appName + '客户端'
  nwBuilder.winVersionString.ProductName = nwBuilder.appName + '客户端'

  // const manifest = project_package.build.manifest || ['name', 'version', 'window', 'main']

  // const newPackage = {}
  //
  // newPackage.publish = project_package.build.publish || ''
  //
  // manifest.map(item => {
  //   if (item.constructor === String) {
  //     newPackage[item] = project_package[item]
  //   } else if (item.constructor === Object) {
  //     for (let name in item) {
  //       newPackage[name] = item[name]
  //     }
  //   }
  // })
  //
  // fs.writeFileSync(resolvePath(project_package.build.filePath || 'dist', 'package.json'), JSON.stringify(newPackage, null, 2))
  const newPackage = {
    ...project_package,
    main: project_package.build.main || project_package.main
  }
  fs.writeFileSync(resolvePath(project_package.build.filePath || 'dist', 'package.json'), JSON.stringify(newPackage, null, 2))

  // fs.copyFileSync(resolvePath('package.json'), resolvePath(project_package.build.filePath || 'dist', 'package.json'))

  await nwBuild(nwBuilder)

  console.log('packing done\n');

  if (process.argv.find(item => /^--dir|-d$/.test(item))) return

  let task = []

  console.log('building...\n');
  // if (!nwBuilder.winIco) {
  //   console.error('没有winIco属性')
  //   process.exit(1)
  // }

  Array.from(['win64', 'win32']).map(item => {
    task.push(winBuild({
      AppExePath: `${resolvePath(project_package.build.output, nwBuilder.buildType())}\\${item}`,
      FilesPath: `${resolvePath(project_package.build.output, nwBuilder.buildType())}\\${item}`,
      AppExeName: `${nwBuilder.appName}.exe`,
      AppVersion: nwBuilder.appVersion,
      AppName: `${project_package.build.appName}`,
      EnglishName: project_package.name,
      OutputDir: nwBuilder.buildDir,
      platform: item,
      SetupIconFile: nwBuilder.winIco || '',
      AppPublisher: nwBuilder.winVersionString.CompanyName,
      Copyright: nwBuilder.winVersionString.LegalCopyright,
      AppId: `{{${project_package.build.appId}}`,
      LicenseFile: project_package.build.license ? resolvePath(project_package.build.license) : '',
      ...project_package.build.innosetup || {Files: [], Registry: []}
    }))
  })

  await Promise.all(task)
  if (project_package.build.publish) await publish(project_package)

  console.log('building done\n');
}
