export const URLS = {
  // Java
  authenticate: "authenticate",
  departments: "api/departments",
  // structure of organizations
  structureOfOrganizations: "/api/structures",
  // CheckPoints
  checkpoints: "api/checkpoints",
  createCheckpoint: "api/checkpoints",
  editOrDeleteCheckpoint: "api/checkpoints/",

  // EntryPoints
  entrypoints: "api/entry-points",
  newEntryPoints: "api/ep",
  entrypointSchedules: "api/schedules/entry-point-schedules",

  // Employee connection to Schedule

  connectScheduleAndEmployee: "api/employees/assign-schedule-by-uuid",

  // Cameras
  allCameras: "api/cameras",
  createCamera: "api/cameras/create",
  logEntersOfEmployeeById: "api/log_enters/uuid/",
  logEntersOfEmployeesByStructure: "/api/log_enters/structure/",
  scheduleCameras: "api/cameras/access-schedules/",
  reportOfEmployees: "api/log_enters/dates/all-employees",
  logsByOrgUnitCodeAndEntrypointId: "api/log_enters/org-unit/",

  // schedules

  allSchedules: "api/schedules",
  scheduleOfEntrypoints: "api/schedules",
  createConnection: "api/schedules",
  deleteConnection: "api/schedules/entry-point-schedule/",
  schedulesOfEntrypoints: "api/schedules/entry-point/",
  ScheduleAndEntrypointOfEmployee:
    "api/employees/assign-schedules-info/by-uuid/",

  // jobtrips

  jobTrips: "api/job-trips",
  createJobTripsForEmployee: "api/job-trips/create-job-trip",

  // Python
  // structure unit type
  unitTypes: "unit-type/",
  organizationalUnits: "organizational-unit/",
  positions: "position/",
  positionTypes: "position-type/",
  workplace: "workplace/",
  employees: "employee/",
  employeePhoto: "employee/photo/",

  // general auth
  users: "auth/users",
  register: "auth/signup",
  roles: "auth/role",
};
