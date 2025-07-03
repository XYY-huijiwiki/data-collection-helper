// a small part of `https://github.com/qsniyg/maxurl`

var add_http = function (url: string): string {
  if (/^\/\/[^/]+\.[a-z]+\//.test(url)) return 'http:' + url
  if (!url.match(/^[a-z]+:\/\//)) return 'http://' + url
  return url
}

var norm_url = function (url: string) {
  return (
    url
      // https://www.test.com?test -> https://www.test.com/?test
      .replace(/^([a-z]+:\/\/[^/]+)(\?.*)/, '$1/$2')
      // https://www.test.com./ -> https://www.test.com/
      .replace(/^([a-z]+:\/\/[^/]+\.[^/]+)\.([?#/].*)?$/, '$1$2')
  )
}

var get_domain_nosub = function (domain: string) {
  var domain_nosub = domain.replace(/^.*\.([^.]*\.[^.]*)$/, '$1')
  // stream.ne.jp
  // *.edu.tr
  // *.in.ua
  if (/^(?:(?:com?|org|net|edu)\.[a-z]{2}|(?:ne|or)\.jp|in\.ua)$/.test(domain_nosub)) {
    domain_nosub = domain.replace(/^.*\.([^.]*\.[^.]*\.[^.]*)$/, '$1')
  }

  return domain_nosub
}

function bigImage(src: string) {
  if (!src.match(/^(?:https?|x-raw-image):\/\//) && !src.match(/^(?:data|blob):/)) return src

  var origsrc = src
  src = norm_url(src)

  var protocol
  var domain
  var port

  if (!src.match(/^(?:data|x-raw-image|blob):/)) {
    // to prevent infinite loops
    if (src.length >= 65535) return src

    var protocol_split = src.split('://')
    protocol = protocol_split[0]
    var splitted = protocol_split[1].split('/')
    domain = splitted[0]

    port = domain.replace(/.*:([0-9]+)$/, '$1')
    if (port === domain) port = ''
    domain = domain.replace(/(.*):[0-9]+$/, '$1')
  } else {
    //protocol = src.replace(/^([-a-z]+):.*/, "$1");
    protocol = 'data'
    domain = ''
    src = '' // FIXME: this isn't great
  }

  //   var domain_nowww = domain.replace(/^www\./, '')
  var domain_nosub = get_domain_nosub(domain)

  if (domain_nosub === '360buyimg.com' && domain.match(/^(?:img[0-9]*|m)\./)) {
    return src
      .replace(
        /(:\/\/[^/]*\/)(?:[a-z0-9]+\/+s[0-9]+x[0-9]+_jfs|popWaterMark\/+jfs)\//,
        '$1imgzone/jfs/'
      )
      .replace(/![^/]*(?:[?#].*)?$/, '')
      .replace(/.jpg.avif$/, '.jpg')
  }

  if (domain === 'img-tmdetail.alicdn.com') {
    let newsrc = src.replace(/^[a-z]+:\/\/[^/]+\/+bao\/+uploaded\/+([^/]+\.[^/]+\/+)/, '$1')
    if (newsrc !== src) return add_http(newsrc)
  }

  if (domain_nosub === 'alicdn.com' || domain_nosub === 'aliexpress-media.com') {
    return src
      .replace(/\.[0-9]+x[0-9]+(\.[^/.]*)(?:[?#].*)?$/, '$1')
      .replace(/(\.[^/._?#]+)_(?:[0-9z]+x[0-9z]+(?:x[0-9z]+)?)?(?:[qQ][0-9]+)?\.[^/.]+$/, '$1')
      .replace(/(\.[^/._?#]+)_\.webp(?:[?#].*)?$/, '$1')
      .replace(/\?.*/, '')
  }

  if (domain_nosub === '1818lao.com' && domain.match(/^i[0-9]*\./)) {
    return src.replace(/:\/\/[^/]*\/aliexpress[0-9]*(\/kf\/)/, '://ae01.alicdn.com$1')
  }

  return src
}

function maxurl(src: string) {
  for (let index = 0; index < 5; index++) {
    src = bigImage(src)
  }
  return src
}

export default maxurl
export { add_http }
