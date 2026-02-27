import { getFields, getResourceItems } from './api.js';

/**
 * Fetches fields metadata and resolves resource-backed fields.
 * Returns { resourceFields, resourceMaps }
 * - resourceFields: array of fields that have a .resource property
 * - resourceMaps: { fieldName: { id: name, ... } } lookup maps
 */
export async function loadResourceFields() {
  const fieldsRes = await getFields();
  const resourceFields = fieldsRes.data.filter(f => f.resource);
  const resourceMaps = {};

  await Promise.all(resourceFields.map(async (f) => {
    try {
      const res = await getResourceItems(f.resource.path);
      const map = {};
      for (const item of res.data) map[item.id] = item.name;
      resourceMaps[f.name] = map;
    } catch {
      resourceMaps[f.name] = {};
    }
  }));

  return { resourceFields, resourceMaps };
}

/**
 * Get the entry column name for a field: _project → project_id
 */
export function fieldToColumn(fieldName) {
  return fieldName.replace(/^_/, '') + '_id';
}
