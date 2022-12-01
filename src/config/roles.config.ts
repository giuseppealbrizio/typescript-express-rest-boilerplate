const allRoles = {
  superAdmin: ['*', 'getUsers', 'createUsers', 'manageUsers', ' deleteUsers'],
  admin: ['getUsers', 'getUsers', 'createUsers', 'manageUsers', ' deleteUsers'],
  employee: ['getUsers'],
  client: ['getUsers'],
  vendor: ['getUsers'],
  user: ['getUsers'],
};

export const roles = Object.keys(allRoles);

export const roleRights = new Map(Object.entries(allRoles));
