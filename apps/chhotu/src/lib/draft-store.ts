// A single record keeps the image, caption, metadata and retry ID together.
export function openDraftDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("chhotu-drafts", 1);
		request.onupgradeneeded = () => request.result.createObjectStore("drafts");
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
export async function readDraft<T>(): Promise<T | undefined> {
	const db = await openDraftDB();
	try {
		return await new Promise<T | undefined>((resolve, reject) => {
			const request = db.transaction("drafts").objectStore("drafts").get("snippet");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	} finally {
		db.close();
	}
}
let pending: Promise<unknown> = Promise.resolve();
export function storeDraft<T>(draft: T | null): Promise<void> {
	// Serialize saves and deletion so an earlier pending save cannot resurrect a published draft.
	const operation = pending
		.catch(() => {})
		.then(async () => {
			const db = await openDraftDB();
			try {
				await new Promise<void>((resolve, reject) => {
					const tx = db.transaction("drafts", "readwrite");
					const store = tx.objectStore("drafts");
					if (draft === null) store.delete("snippet");
					else store.put(draft, "snippet");
					tx.oncomplete = () => resolve();
					tx.onabort = tx.onerror = () => reject(tx.error);
				});
			} finally {
				db.close();
			}
		});
	pending = operation;
	return operation;
}
