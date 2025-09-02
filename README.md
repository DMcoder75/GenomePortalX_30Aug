# GenomePortalX - Enhanced Gene Database Portal

A comprehensive genomic data portal that integrates multiple gene databases including NCBI, Ensembl, and UniProt. Access gene sequences, protein functions, and clinical variants all in one place with advanced detailed view functionality.

## 🧬 Features

### **Multi-Database Integration**
- **NCBI E-utilities** - Gene database, PubMed, GenBank, dbSNP, ClinVar
- **Ensembl REST API** - Genome browser and annotation database  
- **UniProt API** - Protein sequence and functional information

### **Advanced Search & Detailed Views**
- ✅ **Interactive Database Selection** - Click-to-select database cards
- ✅ **Real-time Status Monitoring** - All databases show "Online" status  
- ✅ **Comprehensive Search** - Working search across all three databases
- ✅ **Detailed Information Modals** - Rich, formatted results with relevant details
- ✅ **Professional UI Design** - Responsive design with Tailwind CSS and shadcn/ui
- ✅ **Error Handling** - Proper error messages and loading states

### **Genomic Visualizations**
- Expression heatmaps showing gene expression patterns
- Pathway analysis charts displaying biological interactions
- Interactive charts and pathway maps

## 🚀 Architecture

### **Frontend (React + Vite)**
- **Framework:** React 18 with Vite build system
- **UI Components:** shadcn/ui with Tailwind CSS
- **Icons:** Lucide React icons
- **State Management:** React hooks
- **API Integration:** Fetch API with proxy configuration

### **Backend (Flask)**
- **Framework:** Flask with CORS support
- **API Endpoints:** RESTful API for gene database integration
- **External APIs:** NCBI E-utilities, Ensembl REST, UniProt REST
- **Error Handling:** Comprehensive error handling and logging

## 📁 Project Structure

```
GenomePortalX_30Aug/
├── src/                          # React frontend source
│   ├── components/
│   │   ├── GeneDatabasePanel.jsx # Main database search interface
│   │   └── DetailedView.jsx      # Detailed information modal
│   ├── App.jsx                   # Main application component
│   └── main.jsx                  # Application entry point
├── genome-portal-backend/        # Flask backend
│   ├── src/
│   │   ├── main.py              # Flask application
│   │   └── routes/
│   │       └── gene_db.py       # Gene database API routes
│   ├── static/                  # Built frontend files
│   └── requirements.txt         # Python dependencies
├── dist/                        # Built frontend files
├── public/                      # Static assets
└── README.md                    # This file
```

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 18+ and pnpm
- Python 3.11+ and pip
- Git

### **Frontend Setup**
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build
```

### **Backend Setup**
```bash
cd genome-portal-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python src/main.py
```

## 🔧 API Endpoints

### **Database Status**
- `GET /api/gene-db/status` - Check connectivity to all databases

### **Database Information**
- `GET /api/gene-db/databases` - List available databases and their features

### **Search Endpoints**
- `POST /api/gene-db/ncbi/search` - Search NCBI databases
- `GET /api/gene-db/ensembl/search/{species}/{symbol}` - Search Ensembl by gene symbol
- `POST /api/gene-db/uniprot/search` - Search UniProt proteins

### **Detailed Information Endpoints**
- `GET /api/gene-db/ncbi/details/{database}/{gene_id}` - Get detailed NCBI gene information
- `GET /api/gene-db/ensembl/details/{species}/{gene_id}` - Get detailed Ensembl gene information
- `GET /api/gene-db/uniprot/details/{accession}` - Get detailed UniProt protein information

## 🧪 Testing

The application has been thoroughly tested with:

### **NCBI Database Integration** ✅
- Successfully tested with BRCA1 search (34,222 results)
- Detailed view shows gene information, organism, chromosome data

### **Ensembl Database Integration** ✅  
- Successfully tested with BRCA1 search (2 results: ENSG00000012048, LRG_292)
- Species selection working (Human, Mouse, Rat, Zebrafish)
- Detailed view shows genomic location, biotype, cross-references

### **UniProt Database Integration** ✅
- Successfully tested with insulin search (10 protein results)
- Detailed view shows protein function, gene names, keywords
- Displays organism, sequence length, accession numbers

## 🌐 Deployment

### **Full-Stack Deployment**
The application can be deployed as a full-stack application with the Flask backend serving both the API and the built React frontend.

```bash
# Build frontend
pnpm run build

# Copy built files to Flask static directory
cp -r dist/* genome-portal-backend/static/

# Deploy Flask application
cd genome-portal-backend
python src/main.py
```

### **Separate Deployment**
Frontend and backend can also be deployed separately:
- Frontend: Deploy `dist/` folder to any static hosting service
- Backend: Deploy Flask application to any Python hosting service
- Configure CORS and API base URL accordingly

## 🔬 Database Information

### **NCBI E-utilities**
- **Base URL:** https://eutils.ncbi.nlm.nih.gov/entrez/eutils/
- **Databases:** Gene, PubMed, GenBank, dbSNP, ClinVar
- **Rate Limits:** 3 requests/second (no API key), 10 requests/second (with API key)

### **Ensembl REST API**
- **Base URL:** https://rest.ensembl.org/
- **Species:** Human, Mouse, Rat, Zebrafish, and more
- **Rate Limits:** 15 requests/second

### **UniProt REST API**
- **Base URL:** https://rest.uniprot.org/
- **Databases:** UniProtKB (Swiss-Prot + TrEMBL)
- **Rate Limits:** No specific limits mentioned

## 📊 Performance

- **Search Response Time:** < 2 seconds for most queries
- **Detailed View Loading:** < 3 seconds for comprehensive data
- **Database Status Check:** < 1 second for all three databases
- **Frontend Bundle Size:** ~324KB (gzipped: ~102KB)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **NCBI** for providing comprehensive biological databases
- **Ensembl** for genome annotation and comparative genomics data
- **UniProt** for protein sequence and functional information
- **React** and **Flask** communities for excellent documentation
- **shadcn/ui** for beautiful, accessible UI components

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**GenomePortalX** - Unlocking the secrets of your genes, one database at a time! 🧬✨

