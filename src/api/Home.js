import request from '@/utils/request'

/**
 * 获取每日推荐歌单
 * @param limit-请求的歌曲数
 * @returns Promise
 */
export const recommendMusic = (params) =>
  request({
    url: '/personalized',
    params,
  })

/**
 *
 * @param limit-获取歌单歌曲
 * @returns Promise
 */
export const getPlaylist = (params) =>
  request({
    url: '/playlist/track/all',
    params,
  })

/**
 * 获取推荐最新音乐
 * @param limit-请求的歌曲数
 * @returns Promise
 */
export const newMusic = (params) =>
  request({
    url: '/personalized/newsong',
    params,
  })
