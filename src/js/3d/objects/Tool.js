import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useHelper } from '@react-three/drei'
import { useControls, folder } from 'leva'
import { useCanvas } from '../../../context/CanvasContext'


// function PlaneStencilGroup({ meshObj, plane, renderOrder }) {
// 	//
// 	meshObj.updateMatrix()
// 	meshObj.updateMatrixWorld()
// 	//
// 	// :IMPORTANT: We must apply all the world transformations of the meshObj to
// 	// the stencil too. Otherwise, the stencil may have different
// 	// position/scale/rotation as compared to the original meshObj.
// 	//
// 	const parentPosition = new THREE.Vector3()
// 	meshObj.getWorldPosition(parentPosition)
// 	//
// 	const parentScale = new THREE.Vector3()
// 	meshObj.getWorldScale(parentScale)
// 	//
// 	const parentQuaternion = new THREE.Quaternion()
// 	meshObj.getWorldQuaternion(parentQuaternion)
// 	//

// 	return (
// 		meshObj && (
// 				<group name='new PlaneStencil group' position={parentPosition} scale={parentScale} quaternion={parentQuaternion}>
// 					<mesh geometry={meshObj.geometry} renderOrder={renderOrder}>
// 						<meshBasicMaterial
// 							depthWrite={false}
// 							depthTest={false}
// 							colorWrite={false}
// 							stencilWrite={true}
// 							stencilFunc={THREE.AlwaysStencilFunc}
// 							side={THREE.FrontSide}
// 							clippingPlanes={[plane]}
// 							stencilFail={THREE.DecrementWrapStencilOp}
// 							stencilZFail={THREE.DecrementWrapStencilOp}
// 							stencilZPass={THREE.DecrementWrapStencilOp}
// 						/>
// 					</mesh>
// 					<mesh geometry={meshObj.geometry} renderOrder={renderOrder}>
// 						<meshBasicMaterial
// 							depthWrite={false}
// 							depthTest={false}
// 							colorWrite={false}
// 							stencilWrite={true}
// 							stencilFunc={THREE.AlwaysStencilFunc}
// 							side={THREE.BackSide}
// 							clippingPlanes={[plane]}
// 							stencilFail={THREE.IncrementWrapStencilOp}
// 							stencilZFail={THREE.IncrementWrapStencilOp}
// 							stencilZPass={THREE.IncrementWrapStencilOp}
// 						/>
// 					</mesh>
// 				</group>
// 		)
// 	)
// }

function findHighestLevelMesh(object) {
	let highestMesh = null

	object.traverse((child) => {
		if (child.isMesh) {
			highestMesh = child
		}
	})

	return highestMesh
}

function findHighestLevelPoints(object) {
	let highestPoints = null

	object.traverse((child) => {
		if (child.isPoints) {
			highestPoints = child
		}
	})

	return highestPoints
}


const Tool = ({ children }) => {
	const { modelSize } = useCanvas()

	const scanDimention = 400

	// const [meshList, setMeshList] = useState([])

	const childrenRef = useRef(null)
	const objectRef = useRef(null)

	// useEffect(() => {
	// 	if (!childrenRef.current) return

	// 	// Set objects to clip
	// 	setMeshList(childrenRef.current.children)
	// }, [children])

	const { scene, camera, gl } = useThree()

	// const { animate } = useControls({
	// 	animate: {
	// 		label: 'Animate',
	// 		value: true,
	// 	},
	// })


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
				min: -scanDimention / 2,
				max: scanDimention / 2,
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
				min: -scanDimention / 2,
				max: scanDimention / 2,
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
				min: -scanDimention / 2,
				max: scanDimention / 2,
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

	const createPlaneStencilGroupPoints = (geometry, plane, renderOrder) => {
		// console.log('%cgeometry', 'color:red;font-size:14px;', geometry)

		const group = new THREE.Group()
		// const baseMat = new THREE.MeshBasicMaterial()
		const baseMat = new THREE.PointsMaterial()
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

		// const mesh0 = new THREE.Mesh(geometry, mat0)
		const mesh0 = new THREE.Points(geometry, mat0)
		mesh0.renderOrder = renderOrder
		group.add(mesh0)

		const mat1 = baseMat.clone()
		mat1.side = THREE.FrontSide
		mat1.clippingPlanes = [plane]
		mat1.stencilFail = THREE.DecrementWrapStencilOp
		mat1.stencilZFail = THREE.DecrementWrapStencilOp
		mat1.stencilZPass = THREE.DecrementWrapStencilOp

		// const mesh1 = new THREE.Mesh(geometry, mat1)
		const mesh1 = new THREE.Points(geometry, mat1)
		mesh1.renderOrder = renderOrder
		group.add(mesh1)

		// console.log('%cgroup', 'color:red;font-size:14px;', group)

		return group
	}

	const object = useMemo(() => new THREE.Group(), [])

	const xPlane = useRef()
	const yPlane = useRef()
	const zPlane = useRef()

	const planes = useMemo(() => [xPlane, yPlane, zPlane], [])

	// useEffect(() => {
	// 	console.log('%cmodelSize', 'color:red;font-size:14px;', modelSize)
	// }, [modelSize])

	useHelper(planeXControl.displayHelper && xPlane, THREE.PlaneHelper, modelSize, 'red')
	useHelper(planeYControl.displayHelper && yPlane, THREE.PlaneHelper, modelSize, 'green')
	useHelper(planeZControl.displayHelper && zPlane, THREE.PlaneHelper, modelSize, 'blue')

	// const ham = useMemo(() => {
	// 	if (!meshList.length) return
	// 	if (!planes[0].current) return

	// 	// console.log('%cmeshList', 'color:green;font-size:21px;', meshList)
	// 	// console.log('%cchildren', 'color:green;font-size:21px;', children)

	// 	// Set up clip plane rendering
	// 	const xc = meshList.map((meshObj, index) => {
	// 		const plane = planes[index].current
	// 		// console.log('meshObj', meshObj)
	// 		// console.log('plane', plane)

	// 		return <PlaneStencilGroup key={meshObj.id} meshObj={meshObj} plane={plane} renderOrder={index + 1} />
	// 	})

	// 	// object.add(xc)

	// 	// console.log('%cxc', 'color:green;font-size:21px;', xc)
	// 	const material = new THREE.MeshStandardMaterial({
	// 		color: 'green',
	// 		metalness: 0.1,
	// 		roughness: 0.75,
	// 		clippingPlanes: planes.map((p) => p.current),
	// 		clipShadows: true,
	// 		shadowSide: THREE.DoubleSide,
	// 	})

	// 	return (
	// 		<group ref={objectRef}>
	// 			<mesh geometry={meshList[0].geometry} material={material} renderOrder={6} castShadow></mesh>
	// 			{xc}

	// 			{/* {meshList.map((meshObj, index) => (
	// 				<group key={meshObj.id}>
	// 					<Plane
	// 						ref={(node) => {
	// 							const map = getPlaneListMap()
	// 							if (node) {
	// 								map.set(index, node)
	// 							} else {
	// 								map.delete(index)
	// 							}
	// 						}}
	// 						args={[planeSize, planeSize]}
	// 						renderOrder={index + 1.1}
	// 						onAfterRender={(gl) => gl.clearStencil()}
	// 						material={capMaterialList[index]}
	// 					/>
	// 				</group>
	// 			))} */}
	// 		</group>
	// 	)
	// }, [meshList, planes])

	// const [planeObjectsState, setPlaneObjectsState] = useState([])

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

		// const geometry = new THREE.TorusKnotGeometry(0.4, 0.15, 220, 60)

		// let geometry = childrenRef.current.children[0].geometry

		// if (!childrenRef.current.children.length) return

		let modelMesh = findHighestLevelMesh(childrenRef.current)
		let modelPoints = findHighestLevelPoints(childrenRef.current)

		// console.log('%cchildrenRef.current', 'color:red;font-size:14px;', childrenRef.current)
		// console.log('%cmodelPoints', 'color:red;font-size:14px;', modelPoints)

		if (modelMesh) {
			const geometry = modelMesh.geometry

			// Set up clip plane rendering
			for (let i = 0; i < 3; i++) {
				const poGroup = new THREE.Group()
				const plane = planes[i].current

				const stencilGroup = createPlaneStencilGroup(geometry, plane, i + 1)

				object.add(stencilGroup)
				scene.add(poGroup)
			}

			const modelMaterial = modelMesh.material
			modelMaterial.clipShadows = true
			modelMaterial.clippingPlanes = planes.map((p) => p.current)

			// add the color
			const clippedColorFront = new THREE.Mesh(geometry, modelMaterial)
			clippedColorFront.scale.copy(modelMesh.scale)
			clippedColorFront.castShadow = true
			clippedColorFront.renderOrder = 6

			object.add(clippedColorFront)
		}

		if (modelPoints) {
			const geometry = modelPoints.geometry

			// Set up clip plane rendering
			// let planeObjects = []
			// const planeGeom = new THREE.PlaneGeometry(200, 200)

			// Set up clip plane rendering
			for (let i = 0; i < 3; i++) {
				const poGroup = new THREE.Group()
				const plane = planes[i].current

				const stencilGroup = createPlaneStencilGroupPoints(geometry, plane, i + 1)

				// // plane is clipped by the other clipping planes
				// const planeMat = new THREE.MeshStandardMaterial({
				// 	color: 0xe91e63,
				// 	metalness: 0.1,
				// 	roughness: 0.75,
				// 	clippingPlanes: planes.filter((p) => p.current !== plane).map((p) => p.current),
				// 	stencilWrite: true,
				// 	stencilRef: 0,
				// 	stencilFunc: THREE.NotEqualStencilFunc,
				// 	stencilFail: THREE.ReplaceStencilOp,
				// 	stencilZFail: THREE.ReplaceStencilOp,
				// 	stencilZPass: THREE.ReplaceStencilOp,
				// })

				// const po = new THREE.Mesh(planeGeom, planeMat)
				// po.onAfterRender = function (gl) {
				// 	gl.clearStencil()
				// }

				// po.renderOrder = i + 1.1

				object.add(stencilGroup)
				// poGroup.add(po)
				// planeObjects.push(po)
				scene.add(poGroup)
			}

			// setPlaneObjectsState(planeObjects)

			const modelMaterial = modelPoints.material
			modelMaterial.clipShadows = true
			modelMaterial.clippingPlanes = planes.map((p) => p.current)

			// add the color
			// const clippedColorFront = new THREE.Points(geometry, modelMaterial)
			// clippedColorFront.scale.copy(modelPoints.scale)
			// clippedColorFront.castShadow = true
			// clippedColorFront.renderOrder = 6

			// let object = model.current

			// object.updateMatrixWorld()

			// const box = new THREE.Box3().setFromObject(object)
			// const center = box.getCenter(new THREE.Vector3())

			// object.position.x -= center.x
			// object.position.y -= center.y
			// object.position.z -= center.z

			// object.add(clippedColorFront)
		}
	}, [scene, camera, gl, planes, object])

	// useFrame((state, delta) => {
	// 	if (animate) {
	// 		object.rotation.x += delta * 0.5
	// 		object.rotation.y += delta * 0.2

	// 		if (objectRef.current) {
	// 			objectRef.current.rotation.x += delta * 0.2
	// 			objectRef.current.rotation.y += delta * 0.5
	// 		}
	// 	}

	// 	// if (!planes[0].current) return
	// 	// if (!planeObjectsState.length) return

	// 	// // console.log('%cplanes', 'color:red;font-size:14px;', planes[0].current)
	// 	// // console.log('%cplaneObjectsState', 'color:red;font-size:14px;', planeObjectsState[0])
	// 	// for (let i = 0; i < planeObjectsState.length; i++) {
	// 	// 	const plane = planes[i].current
	// 	// 	const po = planeObjectsState[i]

	// 	// 	// console.log('%cplane', 'color:red;font-size:14px;', plane)
	// 	// 	// console.log('%cpo', 'color:red;font-size:14px;', po)
	// 	// 	plane.coplanarPoint(po.position)
	// 	// 	po.lookAt(po.position.x - plane.normal.x, po.position.y - plane.normal.y, po.position.z - plane.normal.z)
	// 	// }
	// })

	return (
		<group>
			<plane name='xPlane' ref={xPlane} normal={new THREE.Vector3(-1, 0, 0)} constant={planeXControl.constant} />
			<plane name='yPlane' ref={yPlane} normal={new THREE.Vector3(0, -1, 0)} constant={planeYControl.constant} />
			<plane name='zPlane' ref={zPlane} normal={new THREE.Vector3(0, 0, -1)} constant={planeZControl.constant} />

			<group
				ref={childrenRef}
				// visible={false}
			>
				{children}
			</group>

			{/* <group ref={objectRef}>
			</group> */}
			{/* {ham} */}
		</group>
	)
}

export default Tool
