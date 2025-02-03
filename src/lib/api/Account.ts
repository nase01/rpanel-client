import { API_BASE_URL, getJwt, parseIPWhitelist } from '@/lib/utils';
import { UserDTO } from '@/types';

export async function accountUpdate(userData: any) {
	try {
		const jwt = getJwt();
		
		// Convert ipWhitelist from string to array
		const ipWhitelistArray: string[] = parseIPWhitelist(userData.ipWhitelist);

		const updatedUser: UserDTO = {
			...userData,
			ipWhitelist: ipWhitelistArray,
		};
		
		const response = await fetch(`${API_BASE_URL}/admin/account/update`, {
			method: "PUT",
			headers: {
				"Authorization": `Bearer ${jwt}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(updatedUser),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.errors[0].detail);
		}

		const data = await response.json();
		
		return data.data; 

	} catch (error) {
		return { errors: [{ detail: (error as Error).message }] };
	}
}

export async function accountPWChange(userData: any) {
	try {
		const jwt = getJwt();
		
		const response = await fetch(`${API_BASE_URL}/admin/account/pwchange`, {
			method: "PUT",
			headers: {
				"Authorization": `Bearer ${jwt}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.errors[0].detail);
		}

		const data = await response.json();
		
		return data.data; 

	} catch (error) {
		return { errors: [{ detail: (error as Error).message }] };
	}
}

export async function accountAvatarCreate(userData: any) {
	try {
		const jwt = getJwt();
		
		const response = await fetch(`${API_BASE_URL}/admin/account/avatar`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${jwt}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.errors[0].detail);
		}

		const data = await response.json();
		
		return data.data; 

	} catch (error) {
		return { errors: [{ detail: (error as Error).message }] };
	}
}

export async function accountAvatarDelete(imageUrl: string) {
	try {
		const jwt = getJwt();

		const response = await fetch(`${API_BASE_URL}/admin/account/avatar`, {
			method: "DELETE",
			headers: {
				"Authorization": `Bearer ${jwt}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ imageUrl }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.errors[0].detail);
		}

		const data = await response.json();
		
		return data.data; 

	} catch (error) {
		return { errors: [{ detail: (error as Error).message }] };
	}
}

export async function accountAvatars() {
	
	try {
		const jwt = getJwt();

		const response = await fetch(`${API_BASE_URL}/admin/account/avatar`, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${jwt}`,
				"Content-Type": "application/json",
			},
		});

		const data = await response.json();
		
		return data.data; 
	} catch (error) {
		console.log(error);
	}
}