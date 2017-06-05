# jack morris 06/04/17
# many thanks to 
    # http://opencv-python-tutroals.readthedocs.io/en/latest/py_tutorials/py_imgproc/py_template_matching/py_template_matching.html
# import the necessary packages
import cv2
import numpy as np
from matplotlib import pyplot as plt

image_name = 'system-map-color.png'
template_name = 'system-station-circle-template.png'

img_rgb = cv2.imread(image_name)
img_gray = cv2.cvtColor(img_rgb, cv2.COLOR_BGR2GRAY)
template = cv2.imread(template_name,0)
w, h = template.shape[::-1]

res = cv2.matchTemplate(img_gray,template,cv2.TM_CCOEFF_NORMED)
threshold = 0.65
loc = np.where(res >= threshold)
pts = zip(*loc[::-1])


# filter pts by min_distance px
# min_distance = 5
# filtered_pts = 
# for i in xrange()

for pt in pts:
    cv2.rectangle(img_rgb, pt, (pt[0] + w, pt[1] + h), (0,0,255), 2)

print "Found",len(pts),"points."

cv2.imwrite('res.png',img_rgb)