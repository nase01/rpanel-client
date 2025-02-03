export enum QUERY_KEYS {
	// USER KEYS
	GET_CURRENT_USER = "getCurrentUser",
	GET_USERS = "getUsers",
	GET_USER_BY_ID = "getUserById",
	GET_USERS_COUNT = "getUsersCount",
	CREATE_USER = "createUser",
	EDIT_USER = "editUser",
	DELETE_USERS = "deleteUsers",

	// ACCOUNT KEYS
	ACCOUNT_UPDATE = "accountUpdate",
	ACCOUNT_PW_CHANGE = "accountPWChange",
	ACCOUNT_AVATAR_CREATE = "accountAvatarCreate",
	ACCOUNT_AVATAR_DELETE = "accountAvatarDelete",
	ACCOUNT_AVATARS= "accountAvatars",

	// ADMIN LOGS KEYS
	GET_ADMIN_LOGS = "getAdminLogs",
	GET_ADMIN_LOGS_COUNT = "getAdminLogsCount",

	// GITHUB KEYS
	GET_LATEST_VERSION="getLatestVersion",
	GET_RELEASES = "getReleases"
}