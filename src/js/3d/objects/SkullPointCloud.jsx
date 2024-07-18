/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 public/assets/skull_point_cloud.glb -T 
Files: public/assets/skull_point_cloud.glb [16.64MB] > /Users/flatironschool/Development/projects--2024/point-cloud-segmentation-demo/skull_point_cloud-transformed.glb [16.63MB] (0%)
Author: Terrie Simmons-Ehrhardt (https://sketchfab.com/terrielsimmons)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/vhf-skull-point-cloud-47107f5d88f24cc9b051642501a64a9e
Title: VHF Skull Point Cloud
*/

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

export default function SkullPointCloud(props) {
	const { nodes, materials } = useGLTF(process.env.PUBLIC_URL + '/assets/skull_point_cloud.glb')

	const model = useRef()

	useEffect(() => {
		if (!model.current) return

		let object = model.current

		object.updateMatrixWorld()

		const box = new THREE.Box3().setFromObject(object)
		// const size = box.getSize(new THREE.Vector3()).length()
		const center = box.getCenter(new THREE.Vector3())

		object.position.x -= center.x
		object.position.y -= center.y
		object.position.z -= center.z

		// Calculate the size
		// const sizeTest = new THREE.Vector3()
		// box.getSize(sizeTest)

		// const largestValue = getLargestComponent(sizeTest)

		// console.log('%clargestValue', 'color:red;font-size:14px;', largestValue)
		// console.log('%csize', 'color:red;font-size:14px;', size)

		// console.log('Model dimensions:', sizeTest)
		// console.log('Width:', sizeTest.x)
		// console.log('Height:', sizeTest.y)
		// console.log('Depth:', sizeTest.z)

		// setModelSize(sizeTest)
		// setModelSize(largestValue)
	}, [model])

	return (
		<group {...props} dispose={null} ref={model}>
			<points
				geometry={nodes.Object_2.geometry}
				material={materials['Scene_-_Root']}
				rotation={[-Math.PI / 2, 0, 3.122]}
				// material-sizeAttenuation={true}
				// material-vertexColors={true}
				// material-size={2}
				// material-transparent={true}
				// material-depthWrite={true}
				// material-depthTest={false}
				// material-alphaTest={scanMaterial.alphaTest}
				// material-map={sprite}
				// material-blending={THREE.AdditiveBlending}
				// renderOrder={-1}
				scale={0.01}
			/>
		</group>
	)
}

useGLTF.preload(process.env.PUBLIC_URL + '/assets/skull_point_cloud.glb')