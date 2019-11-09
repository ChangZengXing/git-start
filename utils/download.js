/**
 * Created by cy on 2019-01-15.
 */

import axios from 'axios'
import JSZip from './js-zip/index.min.js'
import { curDay } from './date-helper'
import { saveAs } from './file-saver'
import fileType from './file-type'
import { extName } from './path'

export const getBinary = url =>
  axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer'
  })
    .then(res => {
      console.log('getBinary res', res)
      // let disposition = res.headers['content-disposition']
      // let filename = decodeURI(disposition.match(/filename="(.*)"/)[1])
      return res.data
    })
    .catch(res => {
      console.error('Could not download the file from the backend.', res)
      // 这里强制resovle 防止出错中断
      return Promise.resolve('')
    })

const _saveAs = (url, name) => {
  if (name) {
    return saveAs(url, name)
  }
  return window.erpOpen(url)
}

export const download = (urls, name) => {
  let url = ''

  if (typeof urls === 'string') {
    url = urls
    return _saveAs(url, name)
  }

  if (Array.isArray(urls) && urls.length > 0) {
    if (urls.length === 1) {
      url = urls[0]
      if (typeof url === 'string') {
        return _saveAs(url, name)
      }
      if (typeof url === 'object') {
        return _saveAs(url.url, url.name)
      }
    } else {
      const zip = new JSZip()
      const files = urls.map((url, index) => {
        if (typeof url === 'string') {
          return { url: url, name: curDay() + '-' + index }
        }
        return url
      })

      let count = 0
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // 处理文件 404
        getBinary(file.url).then(res => {
          if (!res) {
            file.name = file.name + '-该文件不存在.txt'
          } else if (!extName(file.name)) {
            const ftype = fileType(new Uint8Array(res))
            if (ftype) {
              file.name = file.name + '.' + ftype.ext
            }
            console.log('file.name', file.name, ftype)
          }
          count++
          zip.file(file.name, Promise.resolve(res), { binary: true })
          console.log('resolve file', i, count, file)
          if (count === files.length) {
            return zip
              .generateAsync({ type: 'blob' })
              .then(function(content) {
                saveAs(content, `${(name ? name + '-' : '') + curDay().replace(/:/g, '-')}.zip`)
              })
              .catch(e => console.error(e))
          }
        })
      }
    }
  }
}
