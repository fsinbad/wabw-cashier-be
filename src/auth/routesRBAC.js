export const AdminOnlyAuth = {
  strategy: "jwt_strategy",
  scope: ["ADMIN", "SUPER_ADMIN"]
}

export const AllStaffAuth = {
  strategy: "jwt_strategy",
}