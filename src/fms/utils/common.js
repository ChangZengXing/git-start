/**
 * Created by cy on 2019-02-13.
 */

import MENUS from '@/fms/config/menus'

export const toggleBodyOverflow = hidden => {
  if (hidden) {
    document.body.classList.add('ky-erp-fms-overflow-hidden')
  } else {
    document.body.classList.remove('ky-erp-fms-overflow-hidden')
  }
}

export const pageScrollToTop = () => {
  const mainContainer = document.querySelector('.main-panel')
  mainContainer && mainContainer.scroll(0, 0)
}

export const getModuleCode = vm => {
  const curTag = vm.$route.meta.tag || vm.$route.path
  return (MENUS[curTag] || {}).moduleCode
}

/**
 * @this {String}
 * @param {number} start Index at which to start changing the string.
 * @param {number} delCount An integer indicating the number of old chars to remove.
 * @param {string} newSubStr The String that is spliced in.
 * @return {string} A new string with the spliced substring.
 */
export const StrSplice = (str, start, delCount, newSubStr) => {
  return str.slice(0, start) + newSubStr + str.slice(start + Math.abs(delCount))
}
