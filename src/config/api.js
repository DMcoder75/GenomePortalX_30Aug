// API Configuration
// Update the BASE_URL with your Cloud Run service URL after deployment

const API_CONFIG = {
  // Replace this with your actual Cloud Run service URL
  // Example: 'https://genome-portal-backend-xxxxxx-uc.a.run.app'
  BASE_URL: 'https://your-cloud-run-service-url-here.run.app',
  
  // API endpoints
  ENDPOINTS: {
    GENE_DB_STATUS: '/api/gene-db/status',
    BLAST_SEARCH: '/api/blast/search',
    ENSEMBL_LOOKUP: '/api/ensembl/lookup',
    UNIPROT_SEARCH: '/api/uniprot/search',
    HEATMAP_DATA: '/api/visualization/heatmap_data',
    PATHWAY_DATA: '/api/visualization/pathway_data'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export the configuration
export default API_CONFIG;

