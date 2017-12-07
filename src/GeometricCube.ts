import { Rotation, Point, Axis } from './Geometry'
import flatten = require('lodash/flatten')
const convexHull: (points: [number, number][]) => number[] = require('monotone-convex-hull-2d')

namespace Util {
  export function forEachFace (callbackfn: (face: Face) => void): void {
    times(6, callbackfn)
  }

  export function times (n: number, callbackfn: (i: number) => void): void {
    for (let i = 0; i < n; i++) {
      callbackfn(i)
    }
  }

  export function squareTimes (n: number, callbackfn: (i: number, j: number) => void): void {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        callbackfn(i, j)
      }
    }
  }
}

export enum Face {
  U = 0, R, F, D, L, B
}

export class GeometricFacelet {
  points: Point[] = []

  constructor (dimension: number, i: number, j: number) {
    this.points[0] = new Point(i, 0, dimension - (j + 1))
    this.points[1] = new Point(i + 1, 0, dimension - (j + 1))
    this.points[2] = new Point(i + 1, 0, dimension - j)
    this.points[3] = new Point(i, 0, dimension - j)

    const center = Point.mid(this.points[0], this.points[2])
    this.points.forEach(p => { p.scale(0.85, center) })
  }
}

export class GeometricFace {
  [i: number]: GeometricFacelet[]

  points: Point[] = []

  constructor (dimension: number, face: Face) {
    this.points[0] = new Point(0, 0, dimension)
    this.points[1] = new Point(dimension, 0, dimension)
    this.points[2] = new Point(dimension, 0, 0)
    this.points[3] = new Point(0, 0, 0)
    this.points.forEach(p => GeometricFace.transformToFace(p, dimension, face))

    Util.times(dimension, i => { this[i] = [] })
    Util.squareTimes(dimension, (i, j) => {
      this[i][j] = new GeometricFacelet(dimension, i, j)
      this[i][j].points.forEach(p => GeometricFace.transformToFace(p, dimension, face))
    })
  }

  private static transformToFace (point: Point, dimension: number, face: Face): void {
    switch (face) {
      case Face.U:
        break
      case Face.R:
        point
          .rotate({ axis: Axis.X, angle: -90 })
          .rotate({ axis: Axis.Y, angle: 90 })
          .translate(new Point(dimension, dimension, dimension))
        break
      case Face.F:
        point
          .rotate({ axis: Axis.X, angle: -90 })
          .translate(new Point(0, dimension, 0))
        break
      case Face.D:
        point
          .rotate({ axis: Axis.X, angle: 180 })
          .translate(new Point(0, dimension, dimension))
        break
      case Face.L:
        point
          .rotate({ axis: Axis.X, angle: -90 })
          .rotate({ axis: Axis.Y, angle: -90 })
          .translate(new Point(0, dimension, 0))
        break
      case Face.B:
        point
          .rotate({ axis: Axis.X, angle: -90 })
          .rotate({ axis: Axis.Y, angle: 180 })
          .translate(new Point(dimension, dimension, dimension))
        break
    }
  }

  center (): Point {
    return Point.mid(this.points[0], this.points[2])
  }
}

export class GeometricCube {
  [face: number]: GeometricFace

  constructor (public dimension: number, rotations: Rotation[], distance: number) {
    Util.forEachFace(face => {
      this[face] = new GeometricFace(dimension, face)
    })

    // Translation vector to centre the cube
    const t = new Point(-dimension / 2, -dimension / 2, -dimension / 2)
    this.forEach(point => {
      // Now scale and tranform point to ensure size/pos independent of dim
      point.translate(t).scale(1 / dimension)
    })

    this.forEach(point => {
      // Rotate cube as per perameter settings
      rotations.forEach(rot => {
        point.rotate(rot)
      })
      // Finally project the 3D points onto 2D
      point.project(distance)
    })
  }

  renderOrder (): Face[] {
    const faces = [Face.U, Face.R, Face.F, Face.D, Face.L, Face.B]
    faces.sort((a, b) => {
      return this[b].center().z - this[a].center().z
    })
    return faces
  }

  silhouette (): Point[] {
    const faces = [Face.U, Face.R, Face.F, Face.D, Face.L, Face.B]
    const points = flatten(faces.map(face => this[face].points))
    const approxPoints = points.map(p => {
      const approx = p.clone()
      approx.x = parseFloat(approx.x.toFixed(8))
      approx.y = parseFloat(approx.y.toFixed(8))
      return approx
    })
    const hull = convexHull(approxPoints.map(p => p.to2dArray()))
    return hull.map(index => points[index])
  }

  private forEach (callbackfn: (p: Point) => void): void {
    Util.forEachFace(face => {
      this[face].points.forEach(callbackfn)
      Util.squareTimes(this.dimension, (i , j) => {
        this[face][i][j].points.forEach(callbackfn)
      })
    })
  }
}