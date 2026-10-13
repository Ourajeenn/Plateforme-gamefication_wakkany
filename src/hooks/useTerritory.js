/**
 * Hook pour gérer le territoire du joueur
 */

import { useState, useCallback, useRef } from 'react';
import TerritoryManager from '../utils/territoryManager';

export function useTerritory(playerId) {
  const [territoryState, setTerritoryState] = useState(null);
  const territoryManagerRef = useRef(new TerritoryManager(playerId));

  const buildBuilding = useCallback((buildingId) => {
    const result = territoryManagerRef.current.buildBuilding(buildingId);
    if (result.success) {
      setTerritoryState({ ...territoryManagerRef.current.territory });
    }
    return result;
  }, []);

  const upgradeBuilding = useCallback((buildingId) => {
    const result = territoryManagerRef.current.upgradeBuilding(buildingId);
    if (result.success) {
      setTerritoryState({ ...territoryManagerRef.current.territory });
    }
    return result;
  }, []);

  const setTerritoryName = useCallback((name) => {
    const result = territoryManagerRef.current.setTerritoryName(name);
    if (result.success) {
      setTerritoryState({ ...territoryManagerRef.current.territory });
    }
    return result;
  }, []);

  const applyProduction = useCallback(() => {
    const result = territoryManagerRef.current.applyProduction();
    setTerritoryState({ ...territoryManagerRef.current.territory });
    return result;
  }, []);

  const getSummary = useCallback(() => {
    return territoryManagerRef.current.getTerritorySummary();
  }, []);

  const getReport = useCallback(() => {
    return territoryManagerRef.current.getDetailedReport();
  }, []);

  // Initialize
  if (!territoryState) {
    setTerritoryState({ ...territoryManagerRef.current.territory });
  }

  return {
    territory: territoryState,
    buildBuilding,
    upgradeBuilding,
    setTerritoryName,
    applyProduction,
    getSummary,
    getReport,
    manager: territoryManagerRef.current
  };
}

export default useTerritory;
