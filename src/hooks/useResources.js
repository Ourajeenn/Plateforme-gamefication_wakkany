/**
 * Hook pour gérer les ressources du joueur
 */

import { useState, useCallback, useRef } from 'react';
import ResourceManager from '../utils/resourceManager';

export function useResources(playerId) {
  const [resources, setResources] = useState(null);
  const resourceManagerRef = useRef(new ResourceManager(playerId));

  const addResource = useCallback((type, amount) => {
    const newAmount = resourceManagerRef.current.addResource(type, amount);
    setResources({ ...resourceManagerRef.current.resources });
    return newAmount;
  }, []);

  const removeResource = useCallback((type, amount) => {
    const result = resourceManagerRef.current.removeResource(type, amount);
    if (result.success) {
      setResources({ ...resourceManagerRef.current.resources });
    }
    return result;
  }, []);

  const usePower = useCallback((powerId) => {
    const result = resourceManagerRef.current.usePower(powerId);
    if (result.success) {
      setResources({ ...resourceManagerRef.current.resources });
    }
    return result;
  }, []);

  const applyReward = useCallback((reward) => {
    const result = resourceManagerRef.current.applyReward(reward);
    setResources({ ...resourceManagerRef.current.resources });
    return result;
  }, []);

  const getStatus = useCallback(() => {
    return resourceManagerRef.current.getStatus();
  }, []);

  const getScore = useCallback(() => {
    return resourceManagerRef.current.getScore();
  }, []);

  // Initialize on first call
  if (!resources) {
    setResources({ ...resourceManagerRef.current.resources });
  }

  return {
    resources,
    addResource,
    removeResource,
    usePower,
    applyReward,
    getStatus,
    getScore,
    manager: resourceManagerRef.current
  };
}

export default useResources;
