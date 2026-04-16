export function canUserDo(user, resourceName, actionName) {
  if (!user?.rolesDetail) return false;

  // Loop through all roles
  for (let role of user.rolesDetail) {
    for (let permission of role.permissions) {
      const resource = permission.resource?.name;
      const action = permission.action?.name;

      const matchesResource = resource === resourceName || resource === "*";
      const matchesAction = action === actionName || action === "*";

      if (matchesResource && matchesAction) {
        return true;
      }
    }
  }

  return false;
}
