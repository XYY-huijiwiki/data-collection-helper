import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/zh-cn'

dayjs.extend(LocalizedFormat)
dayjs.locale('zh-cn')

export default dayjs
