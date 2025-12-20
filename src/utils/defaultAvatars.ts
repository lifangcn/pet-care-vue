/**
 * 默认头像选项
 * 使用 UI Avatars API 生成简单头像（在线服务）
 */

export interface AvatarOption {
  id: string
  name: string
  url: string
}

// 生成头像 URL 的工具函数
const generateavatar = (name: string, backgroundColor: string): string => {
  // 使用 UI Avatars 服务生成头像
  // 如果没有网络，可以使用本地 SVG，但这里优先使用在线服务
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${backgroundColor.replace('#', '')}&color=fff&size=200&bold=true`
}

export const DEFAULT_AVATARS: AvatarOption[] = [
  {
    id: 'avatar-1',
    name: '蓝色头像',
    url: generateavatar('用户', '54A0FF'),
  },
  {
    id: 'avatar-2',
    name: '绿色头像',
    url: generateavatar('用户', '1DD1A1'),
  },
  {
    id: 'avatar-3',
    name: '橙色头像',
    url: generateavatar('用户', 'FF9F43'),
  },
  {
    id: 'avatar-4',
    name: '粉色头像',
    url: generateavatar('用户', 'FF6B9C'),
  },
  {
    id: 'avatar-5',
    name: '紫色头像',
    url: generateavatar('用户', 'A855F7'),
  },
  {
    id: 'avatar-6',
    name: '青色头像',
    url: generateavatar('用户', '14B8A6'),
  },
]

/**
 * 获取默认头像 URL
 * @param index 头像索引（0-5）
 * @returns 头像 URL
 */
export const getDefaultAvatar = (index: number = 0): string => {
  if (index >= 0 && index < DEFAULT_AVATARS.length) {
    return DEFAULT_AVATARS[index].url
  }
  return DEFAULT_AVATARS[0].url
}

