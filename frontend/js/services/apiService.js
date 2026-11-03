import { CONFIG } from '../config.js';

export async function fetchNutritionalInsights(dietType = 'all') {
    const url = new URL(CONFIG.API_URL);
    if (dietType && dietType !== 'all') {
        url.searchParams.append('diet_type', dietType);
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}