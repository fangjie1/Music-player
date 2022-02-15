import { recommendMusic, newMusic, getPlaylist} from './Home';
import { hotSearch, searchResult } from './Search';
import { getSongById, getLyricById } from './Play';

export const recommendMusicAPI = recommendMusic //首页-推荐歌单
export const recommendGetPlaylistAPI = getPlaylist //首页-推荐歌单
export const newMusicAPI = newMusic //首页-最新音乐

export const hotSearchAPI = hotSearch // 热搜
export const searchResultAPI = searchResult // 搜索结果

export const getSongByIdAPI = getSongById // 歌曲播放地址
export const getLyricByIdAPI = getLyricById // 歌词-歌词数据