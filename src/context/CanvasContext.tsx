// import * as THREE from 'three'; // Importing THREE for Vector3
import React, { createContext, useContext, useMemo, ReactNode, useState } from 'react';

type CanvasContextType = {
  isDev: boolean;
	canvasLoaded: boolean;
	setCanvasLoaded: (canvasLoaded: boolean) => void;
	modelSize: number;
	setModelSize: (modelSize: number) => void;
	// modelSize: THREE.Vector3;
	// setModelSize: (modelSize: THREE.Vector3) => void;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

interface CanvasProviderProps {
  children: ReactNode;
}

const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const isDev = process.env.NODE_ENV === 'development';
	const [canvasLoaded, setCanvasLoaded] = useState(false);
	const [modelSize, setModelSize] = useState(0);
	// const [modelSize, setModelSize] = useState(new THREE.Vector3());

	const value = useMemo(() => ({ isDev, canvasLoaded, setCanvasLoaded, modelSize, setModelSize }), [isDev, canvasLoaded, modelSize]);

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

const useCanvas = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};

export { CanvasContext, CanvasProvider, useCanvas };
