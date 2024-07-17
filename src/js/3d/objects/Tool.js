import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useHelper } from '@react-three/drei'
import { useControls } from 'leva'

// const PlaneHelper = ({ plane, size }) => {
// 	const ref = useRef()
// 	useHelper(ref, THREE.PlaneHelper, size, 0xffffff)
// 	return <primitive ref={ref} object={plane} />
// }

const Tool = ({ children }) => {
	const childrenRef = useRef(null)

	const { scene, camera, gl } = useThree()

	const { animate } = useControls({
		animate: {
			label: 'Animate',
			value: true,
		},
	})

	const planeXControl = useControls(
		'planeX',
		{
			displayHelper: {
				label: 'displayHelper',
				value: true,
			},
			// negated: {
			// 	label: 'negated',
			// 	value: false,
			// },
			constant: {
				label: 'constant',
				value: 0,
				min: -1,
				max: 1,
			},
		},
		{
			color: 'red',
		}
	)

	const planeYControl = useControls(
		'planeY',
		{
			displayHelper: {
				label: 'displayHelper',
				value: true,
			},
			// negated: {
			// 	label: 'negated',
			// 	value: false,
			// },
			constant: {
				label: 'constant',
				value: 0,
				min: -1,
				max: 1,
			},
		},
		{
			color: 'green',
		}
	)

	const planeZControl = useControls(
		'planeZ',
		{
			displayHelper: {
				label: 'displayHelper',
				value: true,
			},
			// negated: {
			// 	label: 'negated',
			// 	value: false,
			// },
			constant: {
				label: 'constant',
				value: 0,
				min: -1,
				max: 1,
			},
		},
		{
			color: 'blue',
		}
	)

	const createPlaneStencilGroup = (geometry, plane, renderOrder) => {
		const group = new THREE.Group()
		const baseMat = new THREE.MeshBasicMaterial()
		baseMat.depthWrite = false
		baseMat.depthTest = false
		baseMat.colorWrite = false
		baseMat.stencilWrite = true
		baseMat.stencilFunc = THREE.AlwaysStencilFunc

		const mat0 = baseMat.clone()
		mat0.side = THREE.BackSide
		mat0.clippingPlanes = [plane]
		mat0.stencilFail = THREE.IncrementWrapStencilOp
		mat0.stencilZFail = THREE.IncrementWrapStencilOp
		mat0.stencilZPass = THREE.IncrementWrapStencilOp

		const mesh0 = new THREE.Mesh(geometry, mat0)
		mesh0.renderOrder = renderOrder
		group.add(mesh0)

		const mat1 = baseMat.clone()
		mat1.side = THREE.FrontSide
		mat1.clippingPlanes = [plane]
		mat1.stencilFail = THREE.DecrementWrapStencilOp
		mat1.stencilZFail = THREE.DecrementWrapStencilOp
		mat1.stencilZPass = THREE.DecrementWrapStencilOp

		const mesh1 = new THREE.Mesh(geometry, mat1)
		mesh1.renderOrder = renderOrder
		group.add(mesh1)

		return group
	}

	const object = useMemo(() => new THREE.Group(), [])

	const xPlane = useRef()
	const yPlane = useRef()
	const zPlane = useRef()

	const planes = useMemo(() => [xPlane, yPlane, zPlane], [])

	useHelper(planeXControl.displayHelper && xPlane, THREE.PlaneHelper, 2, 'red')
	useHelper(planeYControl.displayHelper && yPlane, THREE.PlaneHelper, 2, 'green')
	useHelper(planeZControl.displayHelper && zPlane, THREE.PlaneHelper, 2, 'blue')


	useEffect(() => {
		if (!planes[0].current) return

		scene.add(object)

		// scene.add(new THREE.AmbientLight(0xffffff, 1.5))

		// const dirLight = new THREE.DirectionalLight(0xffffff, 3)
		// dirLight.position.set(5, 10, 7.5)
		// dirLight.castShadow = true
		// dirLight.shadow.camera.right = 2
		// dirLight.shadow.camera.left = -2
		// dirLight.shadow.camera.top = 2
		// dirLight.shadow.camera.bottom = -2
		// dirLight.shadow.mapSize.width = 1024
		// dirLight.shadow.mapSize.height = 1024
		// scene.add(dirLight)

		const geometry = new THREE.TorusKnotGeometry(0.4, 0.15, 220, 60)

		// let geometry = childrenRef.current.children[0].geometry

		// Set up clip plane rendering
		const planeObjects = []
		const planeGeom = new THREE.PlaneGeometry(4, 4)

		for (let i = 0; i < 3; i++) {
			const poGroup = new THREE.Group()
			const plane = planes[i].current

			const stencilGroup = createPlaneStencilGroup(geometry, plane, i + 1)


			// plane is clipped by the other clipping planes
			const planeMat = new THREE.MeshStandardMaterial({
				color: 'green',
				metalness: 0.1,
				roughness: 0.75,
				// clippingPlanes: null,
				clippingPlanes: planes.filter((p) => p.current !== plane).map((p) => p.current),
				stencilWrite: true,
				stencilRef: 0,
				stencilFunc: THREE.NotEqualStencilFunc,
				stencilFail: THREE.ReplaceStencilOp,
				stencilZFail: THREE.ReplaceStencilOp,
				stencilZPass: THREE.ReplaceStencilOp,
			})
			const po = new THREE.Mesh(planeGeom, planeMat)
			po.onAfterRender = (gl) => gl.clearStencil()

			po.renderOrder = i + 1.1

			object.add(stencilGroup)
			poGroup.add(po)
			planeObjects.push(po)
			scene.add(poGroup)
		}

		// console.log('%cplanes', 'color:red;font-size:14px;', planes)

		const material = new THREE.MeshStandardMaterial({
			color: 'red',
			metalness: 0.1,
			roughness: 0.75,
			clippingPlanes: planes.map((p) => p.current),
			clipShadows: true,
			shadowSide: THREE.DoubleSide,
		})

		// add the color
		const clippedColorFront = new THREE.Mesh(geometry, material)
		clippedColorFront.castShadow = true
		clippedColorFront.renderOrder = 6
		object.add(clippedColorFront)
	}, [scene, camera, gl, planes, object])

	useFrame((state, delta) => {
		if (animate) {
			object.rotation.x += delta * 0.5
			object.rotation.y += delta * 0.2

			// childrenRef.current.rotation.x += delta * 0.5
			// childrenRef.current.rotation.y += delta * 0.2
		}
	})

	return (
		<>
			<plane ref={xPlane} normal={new THREE.Vector3(-1, 0, 0)} constant={planeXControl.constant} />
			<plane ref={yPlane} normal={new THREE.Vector3(0, -1, 0)} constant={planeYControl.constant} />
			<plane ref={zPlane} normal={new THREE.Vector3(0, 0, -1)} constant={planeZControl.constant} />

			{/* <group ref={childrenRef}>{children}</group> */}
		</>
	)
}

export default Tool
