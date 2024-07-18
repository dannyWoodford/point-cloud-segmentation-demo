import React, { useEffect } from 'react';
import * as THREE from 'three'
import { TorusKnot } from '@react-three/drei'
import { useCanvas } from '../../context/CanvasContext'

import Lighting from './setup/Lighting'
import Box from './objects/Box'
import SimpleTest from './objects/SimpleTest'
import Tool from './objects/Tool'
import CtScanLung from './objects/CtScanLung'
import CtScanHead from './objects/CtScanHead'
import SkullPointCloud from './objects/SkullPointCloud'

export default function Scene() {
	const { setCanvasLoaded, modelSize } = useCanvas()

		// Initialize and Reset timeline
	useEffect(() => {
		setCanvasLoaded(true)
	}, [setCanvasLoaded])

	return (
		<group>
			{/* <Lighting /> */}

			{/* <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} /> */}
				{/* <TorusKnot 
					// position={[-1.2, 0, 0]} 
					args={[0.4, 0.15, 220, 60]} 
					/> */}

			<Tool>
				<CtScanLung />
			</Tool>
			
				{/* <CtScanLung /> */}
			{/* <CtScanHead /> */}

					{/* <SimpleTest /> */}
			

			{/* <SkullPointCloud /> */}

			{/* <mesh name="Ground Shadow" rotation={[-Math.PI / 2, 0, 0]} position={[0, -modelSize / 2, 0]} receiveShadow>
				<planeGeometry args={[modelSize * 4, modelSize * 4]} />
				<shadowMaterial color={0x000000} opacity={0.25} side={THREE.DoubleSide} />
			</mesh> */}
		</group>
	);
}
