export function canUserDo(user, resourceName, actionName) {
  if (user?.isAdmin) return true;

  if (!Array.isArray(user?.permissions)) return false;

  for (let permission of user.permissions) {
    const resource = permission.resource;
    const action = permission.action;

    const matchesResource = resource === resourceName || resource === "*";
    const matchesAction = action === actionName || action === "*";

    if (matchesResource && matchesAction) {
      return true;
    }
  }

  return false;
}
