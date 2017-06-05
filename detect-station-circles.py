# jack morris 06/04/17
# many thanks to 
    # http://opencv-python-tutroals.readthedocs.io/en/latest/py_tutorials/py_imgproc/py_template_matching/py_template_matching.html
import cv2, math
import numpy as np
from matplotlib import pyplot as plt

image_name = 'system-map-color.png'
template_name = 'system-station-circle-template.png'

img_rgb = cv2.imread(image_name)
img_gray = cv2.cvtColor(img_rgb, cv2.COLOR_BGR2GRAY)
template = cv2.imread(template_name,0)
w, h = template.shape[::-1]

res = cv2.matchTemplate(img_gray,template,cv2.TM_CCOEFF_NORMED)
threshold = 0.62
loc = np.where(res >= threshold)
pts = zip(*loc[::-1])

# distance formula
def _distance(p1, p2):
  return math.hypot(p1[0]-p2[0], p1[1]-p2[1])

# to remove overlapping templates: filter pts by min_distance px
min_distance = math.hypot(w/2, h/2)
filtered_pts = [] 
for pt in pts:
  point_fits = True
  for fpt in filtered_pts:
    distance = _distance(pt, fpt)
    if distance <= min_distance: 
      point_fits = False
      break
  if point_fits: filtered_pts.append(pt)

print "Found",len(filtered_pts),"stations."

# take user input
pt_i = 0
stations = []
for pt in filtered_pts:
  pt_i += 1
  img_rgb_copy = img_rgb.copy()
  cv2.rectangle(img_rgb_copy, pt, (pt[0] + w, pt[1] + h), (0,0,255), 2)
  cv2.imshow('image ' + str(pt_i), img_rgb_copy)
  station_name = raw_input('Enter station name: ')
  center_coords = [pt[0] + w/2, pt[1] + h/2]
  station_obj = { 'Name': station_name, 'Map Coords': center_coords }
  stations.append(station_obj)
  cv2.destroyAllWindows()

print
print stations
cv2.imshow('image',img_rgb)
# cv2.waitKey(0)


# write output file
cv2.imwrite('res.png',img_rgb)