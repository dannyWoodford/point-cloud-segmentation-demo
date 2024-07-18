import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useHelper } from '@react-three/drei'
import { useControls } from 'leva'


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

function findHighestLevelGeometry(object) {
	let highestLevelGeometry = null

	function traverseChildren(obj) {
		if (obj.isMesh && obj.geometry) {
			highestLevelGeometry = obj.geometry
		}

		obj.children.forEach((child) => {
			traverseChildren(child)
		})
	}

	traverseChildren(object)

	return highestLevelGeometry
}

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
	// const [meshList, setMeshList] = useState([])

	const childrenRef = useRef(null)
	const objectRef = useRef(null)

	// useEffect(() => {
	// 	if (!childrenRef.current) return

	// 	// Set objects to clip
	// 	setMeshList(childrenRef.current.children) 
	// }, [children])

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
		console.log('%cgeometry', 'color:red;font-size:14px;', geometry)

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


	const [planeObjectsState, setPlaneObjectsState] = useState([])

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
		
		console.log('%cchildrenRef.current', 'color:red;font-size:14px;', childrenRef.current)
		console.log('%cmodelPoints', 'color:red;font-size:14px;', modelPoints)

		if (!modelMesh) return
		

		// console.log('%cmodelMesh', 'color:red;font-size:14px;', modelMesh)

		const geometry = modelMesh.geometry
		// const geometry = findHighestLevelGeometry(childrenRef.current)
		// console.log(highestLevelGeometry)

		// console.log('%cchildrenRef.current', 'color:red;font-size:14px;', childrenRef.current)
		// console.log('%cgeometry', 'color:red;font-size:14px;', geometry)

		// Set up clip plane rendering
		const planeObjectsLocal = []
		// const planeGeom = new THREE.PlaneGeometry(4, 4)

		for (let i = 0; i < 3; i++) {
			const poGroup = new THREE.Group()
			const plane = planes[i].current
			// console.log('%cplane', 'color:red;font-size:14px;', plane)

			const stencilGroup = createPlaneStencilGroup(geometry, plane, i + 1)

			// plane is clipped by the other clipping planes
			// const planeMat = new THREE.MeshStandardMaterial({
			// 	color: 'yellow',
			// 	metalness: 0.1,
			// 	roughness: 0.75,
			// 	// clippingPlanes: null,
			// 	clippingPlanes: planes.filter((p) => p.current !== plane).map((p) => p.current),
			// 	stencilWrite: true,
			// 	stencilRef: 0,
			// 	stencilFunc: THREE.NotEqualStencilFunc,
			// 	stencilFail: THREE.ReplaceStencilOp,
			// 	stencilZFail: THREE.ReplaceStencilOp,
			// 	stencilZPass: THREE.ReplaceStencilOp,
			// })
			// const po = new THREE.Mesh(planeGeom, planeMat)
			// po.name = plane.name
			// po.onAfterRender = (gl) => gl.clearStencil()

			// po.renderOrder = i + 1.1

			// console.log('%cpo', 'color:red;font-size:14px;', po );

			object.add(stencilGroup)
			// poGroup.add(po)
			// planeObjectsLocal.push(po)
			scene.add(poGroup)
		}

		// console.log('%cplaneObjectsLocal', 'color:red;font-size:14px;', planeObjectsLocal );
		setPlaneObjectsState(planeObjectsLocal)

		// const material = new THREE.MeshStandardMaterial({
		// 	color: 'red',
		// 	metalness: 0.1,
		// 	roughness: 0.75,
		// 	clippingPlanes: planes.map((p) => p.current),
		// 	clipShadows: true,
		// 	shadowSide: THREE.DoubleSide,
		// })

		const modelMaterial = modelMesh.material
		modelMaterial.clipShadows = true
		modelMaterial.clippingPlanes = planes.map((p) => p.current)

		console.log('%cmodelMaterial', 'color:red;font-size:14px;', modelMaterial)


		// add the color
		const clippedColorFront = new THREE.Mesh(geometry, modelMaterial)
		// console.log('%cgeometry.scale', 'color:red;font-size:14px;', geometry)
		console.log('%cmodelMesh', 'color:red;font-size:14px;', modelMesh)
		clippedColorFront.scale.copy(modelMesh.scale)
		// console.log('%cclippedColorFront', 'color:red;font-size:14px;', clippedColorFront)
		clippedColorFront.castShadow = true
		clippedColorFront.renderOrder = 6
		object.add(clippedColorFront)
	}, [scene, camera, gl, planes, object])

	useFrame((state, delta) => {
		if (animate) {
			object.rotation.x += delta * 0.5
			object.rotation.y += delta * 0.2

			
			if (objectRef.current) {
				objectRef.current.rotation.x += delta * 0.2
				objectRef.current.rotation.y += delta * 0.5
			}
		}

		// if (!planes[0].current) return
		// if (!planeObjectsState.length) return

		// console.log('%cplanes', 'color:red;font-size:14px;', planes[0].current)
		// console.log('%cplaneObjectsState', 'color:red;font-size:14px;', planeObjectsState[0])
		for (let i = 0; i < planeObjectsState.length; i++) {
			const plane = planes[i].current
			const po = planeObjectsState[i]

			// console.log('%cplane', 'color:red;font-size:14px;', plane)
			// console.log('%cpo', 'color:red;font-size:14px;', po)
			plane.coplanarPoint(po.position)
			po.lookAt(po.position.x - plane.normal.x, po.position.y - plane.normal.y, po.position.z - plane.normal.z)
		}
	})

	return (
		<group>
			<plane name='xPlane' ref={xPlane} normal={new THREE.Vector3(-1, 0, 0)} constant={planeXControl.constant} />
			<plane name='yPlane' ref={yPlane} normal={new THREE.Vector3(0, -1, 0)} constant={planeYControl.constant} />
			<plane name='zPlane' ref={zPlane} normal={new THREE.Vector3(0, 0, -1)} constant={planeZControl.constant} />

			<group ref={childrenRef} 
			// visible={false}
			>{children}</group>

			{/* <group ref={objectRef}>
			</group> */}
				{/* {ham} */}
		</group>
	)
}

export default Tool
