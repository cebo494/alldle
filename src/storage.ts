import { useEffect, useState } from "react";


export function getLocalStorageValue(key: string, defaultValue: string): string {
	return localStorage.getItem(key) ?? defaultValue;
}

export function setLocalStorageValue(key: string, value: string): void {
	localStorage.setItem(key, value);
}

export function getSessionStorageValue(key: string, defaultValue: string): string {
	return sessionStorage.getItem(key) ?? defaultValue;
}

export function setSessionStorageValue(key: string, value: string): void {
	sessionStorage.setItem(key, value);
}

export function useLocalStorage(key: string, defaultValue: string) {
	const [value, setValue] = useState(getLocalStorageValue(key, defaultValue));

	useEffect(() => {
		setLocalStorageValue(key, value);
	}, [key, value]);

	return [value, setValue] as const;
}

export function useSessionStorage(key: string, defaultValue: string) {
	const [value, setValue] = useState(getSessionStorageValue(key, defaultValue));

	useEffect(() => {
		setSessionStorageValue(key, value);
	}, [key, value]);

	return [value, setValue] as const;
}
