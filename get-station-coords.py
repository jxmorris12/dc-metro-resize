# jack morris 06/04/17
# thanks to https://developer.wmata.com/docs/services/5476364f031f590f38092507/operations/5476364f031f5909e4fe3311

import config
import httplib, urllib, base64

api_key = config.api_key

headers = {
    # Request headers
    'api_key': api_key,
}

params = urllib.urlencode({
    # Request parameters
    #'LineCode': '{string}',
})

try:
    conn = httplib.HTTPSConnection('api.wmata.com')
    conn.request("GET", "/Rail.svc/json/jStations?%s" % params, "{body}", headers)
    response = conn.getresponse()
    data = response.read()
    print(data)
    conn.close()
except Exception as e:
    print("[Errno {0}] {1}".format(e.errno, e.strerror))