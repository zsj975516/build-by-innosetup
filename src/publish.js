/**
 * 生成升级配置文件 upgrade.json
 */
const path = require('path');
const YAML = require('yamljs');
const fs = require('fs');
const crypto = require('crypto');

const exec = require('child_process').exec

const resolvePath = function () {
  return path.resolve(process.env.INIT_CWD, ...arguments)
}

async function makeUpgrade (config) {
  const basePath = resolvePath(config.build.output)
  try {
    let upgradeJson = {
      version: config.version,
      releaseDate: new Date(),
      files: []
    };

    let fileNames = [`${config.build.appName}_win32_${config.version}.exe`, `${config.build.appName}_win64_${config.version}.exe`];

    let files = fileNames.reduce((old, item) => {
      let stat = fs.statSync(path.resolve(basePath, item))
      let file
      if (/win32/i.test(item)) {
        file = old[32]
      } else {
        file = old[64]
      }
      if (stat.mtimeMs > file.time) {
        file.platform = /win32/i.test(item) ? 'win32' : 'win64'
        file.url = item
        file.time = stat.mtimeMs
        file.size = stat.size
        return old
      }
      return old
    }, {32: {time: 0, size: 0}, 64: {time: 0, size: 0}})
    for (let key in files) {
      let file = files[key]
      file.md5 = await getMD5(path.resolve(basePath, file.url))
      delete file.time
      upgradeJson.files.push(file)
    }

    fs.writeFileSync(path.resolve(basePath, 'latest.yml'), YAML.stringify(upgradeJson, 4, 2), 'utf-8');
    if (config.build.openDirOnFinish) {
      exec(`start "" "${basePath}"`)
    }
  } catch (e) {
    throw e;
  }
}

function getMD5 (filepath) {
  return new Promise((resolve, reject) => {
    let stream = fs.createReadStream(filepath)
    let fsHash = crypto.createHash('md5')
    stream.on('data', function (d) {
      fsHash.update(d)
    })
    stream.on('end', function () {
      let md5 = fsHash.digest('hex')
      resolve(md5)
    })
  })
}

module.exports = makeUpgrade;
