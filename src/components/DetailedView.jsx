import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Loader2, Info, Dna, Microscope } from 'lucide-react';

const DetailedView = ({ isOpen, onClose, item, database }) => {
  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && item) {
      fetchDetailedData();
    }
  }, [isOpen, item, database]);

  const fetchDetailedData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = '';
      
      if (database === 'ncbi') {
        endpoint = `/api/gene-db/ncbi/details/gene/${item.id}`;
      } else if (database === 'ensembl') {
        endpoint = `/api/gene-db/ensembl/details/homo_sapiens/${item.id}`;
      } else if (database === 'uniprot') {
        endpoint = `/api/gene-db/uniprot/details/${item.id}`;
      }
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDetailedData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderNCBIDetails = (data) => {
    const summary = data.summary?.result?.[item.id];
    if (!summary) return <div>No detailed information available</div>;

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
            <Dna className="w-5 h-5 mr-2" />
            Gene Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Gene Symbol</p>
              <p className="font-medium">{summary.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gene ID</p>
              <p className="font-medium">{item.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Organism</p>
              <p className="font-medium">{summary.organism?.scientificname || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Chromosome</p>
              <p className="font-medium">{summary.chromosome || 'N/A'}</p>
            </div>
          </div>
        </div>

        {summary.summary && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-gray-700">{summary.summary}</p>
          </div>
        )}

        {summary.otheraliases && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-green-900">Alternative Names</h4>
            <p className="text-green-700">{summary.otheraliases}</p>
          </div>
        )}

        {summary.maplocation && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-purple-900">Map Location</h4>
            <p className="text-purple-700">{summary.maplocation}</p>
          </div>
        )}
      </div>
    );
  };

  const renderEnsemblDetails = (data) => {
    const geneInfo = data.gene_info;
    if (!geneInfo) return <div>No detailed information available</div>;

    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2 flex items-center">
            <Dna className="w-5 h-5 mr-2" />
            Ensembl Gene Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Gene ID</p>
              <p className="font-medium">{geneInfo.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Display Name</p>
              <p className="font-medium">{geneInfo.display_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Biotype</p>
              <p className="font-medium">{geneInfo.biotype || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Strand</p>
              <p className="font-medium">{geneInfo.strand === 1 ? 'Forward (+)' : 'Reverse (-)'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-medium">
                {geneInfo.seq_region_name}:{geneInfo.start}-{geneInfo.end}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Assembly</p>
              <p className="font-medium">{geneInfo.assembly_name || 'N/A'}</p>
            </div>
          </div>
        </div>

        {geneInfo.description && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-gray-700">{geneInfo.description}</p>
          </div>
        )}

        {data.cross_references && data.cross_references.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-900">Cross References</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.cross_references.slice(0, 6).map((ref, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                  <span className="text-sm font-medium">{ref.dbname}</span>
                  <span className="text-sm text-gray-600">{ref.display_id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {geneInfo.canonical_transcript && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-yellow-900">Canonical Transcript</h4>
            <p className="text-yellow-700">{geneInfo.canonical_transcript}</p>
          </div>
        )}
      </div>
    );
  };

  const renderUniProtDetails = (data) => {
    const proteinInfo = data.protein_info;
    if (!proteinInfo) return <div>No detailed information available</div>;

    return (
      <div className="space-y-6">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 mb-2 flex items-center">
            <Microscope className="w-5 h-5 mr-2" />
            Protein Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Accession</p>
              <p className="font-medium">{proteinInfo.primaryAccession}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Entry Name</p>
              <p className="font-medium">{proteinInfo.uniProtkbId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Organism</p>
              <p className="font-medium">{proteinInfo.organism?.scientificName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sequence Length</p>
              <p className="font-medium">{proteinInfo.sequence?.length || 'N/A'} aa</p>
            </div>
          </div>
        </div>

        {proteinInfo.proteinDescription?.recommendedName && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Protein Name</h4>
            <p className="text-gray-700">
              {proteinInfo.proteinDescription.recommendedName.fullName?.value || 'N/A'}
            </p>
          </div>
        )}

        {proteinInfo.comments && proteinInfo.comments.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-900">Function</h4>
            {proteinInfo.comments
              .filter(comment => comment.commentType === 'FUNCTION')
              .slice(0, 1)
              .map((comment, index) => (
                <p key={index} className="text-blue-700">
                  {comment.texts?.[0]?.value || 'No function description available'}
                </p>
              ))}
          </div>
        )}

        {proteinInfo.genes && proteinInfo.genes.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-green-900">Gene Names</h4>
            <div className="flex flex-wrap gap-2">
              {proteinInfo.genes.map((gene, index) => (
                <span key={index} className="bg-green-200 px-2 py-1 rounded text-sm">
                  {gene.geneName?.value || gene.synonyms?.[0]?.value || 'Unknown'}
                </span>
              ))}
            </div>
          </div>
        )}

        {proteinInfo.keywords && proteinInfo.keywords.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-yellow-900">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {proteinInfo.keywords.slice(0, 8).map((keyword, index) => (
                <span key={index} className="bg-yellow-200 px-2 py-1 rounded text-sm">
                  {keyword.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading detailed information...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Error loading details</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      );
    }

    if (!detailedData) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No detailed information available</p>
          </div>
        </div>
      );
    }

    switch (database) {
      case 'ncbi':
        return renderNCBIDetails(detailedData);
      case 'ensembl':
        return renderEnsemblDetails(detailedData);
      case 'uniprot':
        return renderUniProtDetails(detailedData);
      default:
        return <div>Unsupported database</div>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Detailed Information
            </h2>
            <p className="text-sm text-gray-600">
              {database.toUpperCase()} • {item?.name || item?.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderContent()}
        </div>
        
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center text-sm text-gray-500">
            <ExternalLink className="w-4 h-4 mr-1" />
            Data from {database.toUpperCase()} database
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailedView;

