import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchInvoiceDetails = async (accessKey) => {
    try {
        let url = API_BASE_URL;
        if (accessKey) {
            // If accessKey is provided, replace the one in the URL or append it
            const urlObj = new URL(API_BASE_URL);
            urlObj.searchParams.set('access_key', accessKey);
            url = urlObj.toString();
        }

        const response = await axios.get(url);
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch invoice details');
        }
    } catch (error) {
        console.error('Error fetching invoice details:', error);
        throw error;
    }
};
