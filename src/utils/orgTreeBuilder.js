import { get } from "lodash";

/**
 * Organizes flat array of organizational units into a hierarchical map by parent_id
 * @param {Array} units - Flat array of organizational units from API
 * @returns {Object} Map organized as { parentId: [children] }
 */
export const buildUnitsByParentMap = (units) => {
  const unitsByParent = {};

  if (!Array.isArray(units)) return unitsByParent;

  units.forEach((unit) => {
    const parentId = unit.parent_id || "root";
    if (!unitsByParent[parentId]) {
      unitsByParent[parentId] = [];
    }
    unitsByParent[parentId].push(unit);
  });

  return unitsByParent;
};

/**
 * Gets immediate children of a unit
 * @param {Array} allUnits - All organizational units
 * @param {String} parentId - Parent unit ID
 * @returns {Array} Children units
 */
export const getChildrenOfUnit = (allUnits, parentId) => {
  if (!Array.isArray(allUnits)) return [];
  return allUnits.filter((unit) => unit.parent_id === parentId);
};

/**
 * Gets all descendants of a unit (recursive)
 * @param {Array} allUnits - All organizational units
 * @param {String} parentId - Parent unit ID
 * @returns {Array} All descendants
 */
export const getAllDescendants = (allUnits, parentId) => {
  let descendants = [];
  const children = getChildrenOfUnit(allUnits, parentId);

  children.forEach((child) => {
    descendants.push(child);
    descendants = descendants.concat(getAllDescendants(allUnits, child.id));
  });

  return descendants;
};

/**
 * Gets breadcrumb path for a unit by traversing up the hierarchy
 * @param {Array} allUnits - All organizational units
 * @param {String} unitId - Unit ID to get breadcrumb for
 * @returns {Array} Breadcrumb array [{id, name}, ...]
 */
export const getBreadcrumbPath = (allUnits, unitId) => {
  const breadcrumb = [];
  let currentId = unitId;

  while (currentId) {
    const unit = allUnits.find((u) => u.id === currentId);
    if (!unit) break;

    breadcrumb.unshift({
      id: unit.id,
      name: unit.name,
      code: unit.unit_code,
    });

    currentId = unit.parent_id;
  }

  return breadcrumb;
};

/**
 * Gets root organizational units
 * @param {Array} allUnits - All organizational units
 * @returns {Array} Root units (no parent_id)
 */
export const getRootUnits = (allUnits) => {
  if (!Array.isArray(allUnits)) return [];
  return allUnits.filter((unit) => !unit.parent_id);
};

/**
 * Searches units by name or code across all depths
 * @param {Array} allUnits - All organizational units
 * @param {String} searchTerm - Search query
 * @returns {Array} Matching units with breadcrumb paths
 */
export const searchUnits = (allUnits, searchTerm) => {
  if (!searchTerm || !Array.isArray(allUnits)) return [];

  const term = searchTerm.toLowerCase();
  return allUnits
    .filter(
      (unit) =>
        unit.name.toLowerCase().includes(term) ||
        unit.unit_code.toLowerCase().includes(term),
    )
    .map((unit) => ({
      ...unit,
      breadcrumb: getBreadcrumbPath(allUnits, unit.id),
    }));
};

/**
 * Gets depth level of a unit (root = 0)
 * @param {Array} allUnits - All organizational units
 * @param {String} unitId - Unit ID
 * @returns {Number} Depth level
 */
export const getUnitDepth = (allUnits, unitId) => {
  let depth = 0;
  let currentId = unitId;

  while (currentId) {
    const unit = allUnits.find((u) => u.id === currentId);
    if (!unit || !unit.parent_id) break;

    depth++;
    currentId = unit.parent_id;
  }

  return depth;
};

/**
 * Validates if a unit can be moved to a destination
 * Prevents circular references (moving a parent into its own child)
 * @param {Array} allUnits - All organizational units
 * @param {String} unitToMove - Unit being moved
 * @param {String} destination - Destination unit
 * @returns {Object} {valid: boolean, reason: string}
 */
export const validateUnitMove = (allUnits, unitToMove, destination) => {
  if (unitToMove === destination) {
    return { valid: false, reason: "Cannot move unit to itself" };
  }

  const descendants = getAllDescendants(allUnits, unitToMove);
  if (descendants.some((d) => d.id === destination)) {
    return {
      valid: false,
      reason: "Cannot move unit into its own child (circular reference)",
    };
  }

  return { valid: true };
};
