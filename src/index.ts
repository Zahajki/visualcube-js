import SvgCubeVisualBuilder, { Arrow } from './SvgCubeVisualizer'
import { Rotation } from './Geometry'
import * as Color from 'color'
const prettifyXml: (input: string, options?: {indent: number, newline: string}) => string = require('prettify-xml')
import { writeFileSync } from 'fs'

export default class VisualCube {
}

const faceletColors = [
  [['magenta', 'yellow', 'yellow'], ['magenta', 'yellow', 'yellow'], ['yellow', 'yellow', 'yellow']],
  [['magenta', 'red', 'red'], ['magenta', 'red', 'red'], ['red', 'red', 'red']],
  [['magenta', 'blue', 'blue'], ['magenta', 'blue', 'blue'], ['blue', 'blue', 'blue']],
  [['magenta', 'white', 'white'], ['magenta', 'white', 'white'], ['white', 'white', 'white']],
  [['magenta', 'orange', 'orange'], ['magenta', 'orange', 'orange'], ['orange', 'orange', 'orange']],
  [['magenta', 'green', 'green'], ['magenta', 'green', 'green'], ['green', 'green', 'green']]
].map(face => face.map(row => row.map(name => Color(name)/*.alpha(0.9)*/)))

const rotations: Rotation[] = [
  ['y', -30],
  ['x', 25]
  // ['x', -90]
]

const arrows: Arrow[] = [
  [
      // facelets
    [[1, 2, 1], [2, 2, 0]],
    'both',
    Color('gray'),
    0, 0
  ],
  [
    [[0, 0, 1], [0, 0, 0], [0, 2, 0], [0, 2, 1]],
    'end',
    Color('skyblue'),
    -0.2, 0.3
  ]
]

const svg = new SvgCubeVisualBuilder(3, 'normal')
  .visualize(rotations, 5, 512, Color('rgba(0, 255, 255, 0.0)'), Color('rgba(0, 12, 16, 0.9)'), faceletColors, arrows)
writeFileSync('test.svg', prettifyXml(svg.xml))
