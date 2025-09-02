import React, { useState } from 'react';
import './SequenceSearch.css';

const SequenceSearch = () => {
  const [sequence, setSequence] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!sequence.trim()) {
      setError('Please enter a DNA sequence');
      return;
    }

    setIsSearching(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/integrated/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sequence: sequence.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const formatEValue = (evalue) => {
    if (evalue === 0) return '0.0';
    if (evalue < 1e-100) return '< 1e-100';
    return evalue.toExponential(2);
  };

  const calculateIdentityPercentage = (identity, alignLen) => {
    if (!alignLen || alignLen === 0) return '0%';
    return ((identity / alignLen) * 100).toFixed(1) + '%';
  };

  return (
    <div className="sequence-search">
      <div className="search-container">
        <h2>DNA Sequence Search</h2>
        <p className="search-description">
          Enter a DNA sequence to search across NCBI, Ensembl, and UniProt databases
        </p>
        
        <div className="search-form">
          <textarea
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            placeholder="Enter your DNA sequence here (e.g., ATCGATCGATCG...)"
            className="sequence-input"
            rows="6"
            disabled={isSearching}
          />
          
          <button
            onClick={handleSearch}
            disabled={isSearching || !sequence.trim()}
            className="search-button"
          >
            {isSearching ? 'Searching...' : 'Search Databases'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {results && (
        <div className="results-container">
          <h3>Search Results</h3>
          
          {/* NCBI BLAST Results */}
          <div className="database-section">
            <h4>NCBI BLAST Results</h4>
            {results.blast_data && results.blast_data.results && results.blast_data.results.hits ? (
              <div className="blast-results">
                <p className="results-summary">
                  Found {results.blast_data.results.total_hits} matches
                </p>
                {results.blast_data.results.hits.map((hit, index) => (
                  <div key={index} className="hit-card">
                    <div className="hit-header">
                      <h5>{hit.title}</h5>
                      <span className="accession">Accession: {hit.accession}</span>
                    </div>
                    <div className="hit-details">
                      <div className="detail-item">
                        <span className="label">Length:</span>
                        <span className="value">{hit.length} bp</span>
                      </div>
                      {hit.hsps && hit.hsps.length > 0 && (
                        <div className="hsp-details">
                          <div className="detail-item">
                            <span className="label">Score:</span>
                            <span className="value">{hit.hsps[0].score}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">E-value:</span>
                            <span className="value">{formatEValue(hit.hsps[0].evalue)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Identity:</span>
                            <span className="value">
                              {calculateIdentityPercentage(hit.hsps[0].identity, hit.hsps[0].align_len)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-results">No BLAST results found</p>
            )}
          </div>

          {/* Ensembl Results */}
          <div className="database-section">
            <h4>Ensembl Annotations</h4>
            {results.ensembl_data && results.ensembl_data.length > 0 ? (
              <div className="ensembl-results">
                {results.ensembl_data.map((item, index) => (
                  <div key={index} className="annotation-card">
                    <div className="annotation-header">
                      <h5>{item.title}</h5>
                      <span className="accession">Accession: {item.accession}</span>
                    </div>
                    {item.ensembl_data && (
                      <div className="ensembl-details">
                        <p className="ensembl-info">Ensembl cross-reference data available</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-results">No Ensembl annotations found</p>
            )}
          </div>

          {/* UniProt Results */}
          <div className="database-section">
            <h4>UniProt Protein Information</h4>
            {results.uniprot_data && results.uniprot_data.length > 0 ? (
              <div className="uniprot-results">
                {results.uniprot_data.map((item, index) => (
                  <div key={index} className="protein-card">
                    <div className="protein-header">
                      <h5>{item.title}</h5>
                      <span className="accession">Accession: {item.accession}</span>
                    </div>
                    {item.uniprot_data && (
                      <div className="protein-details">
                        <div className="detail-item">
                          <span className="label">Protein:</span>
                          <span className="value">{item.uniprot_data.protein_name || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Gene Names:</span>
                          <span className="value">
                            {item.uniprot_data.gene_names && item.uniprot_data.gene_names.length > 0
                              ? item.uniprot_data.gene_names.join(', ')
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Organism:</span>
                          <span className="value">{item.uniprot_data.organism || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Length:</span>
                          <span className="value">{item.uniprot_data.length || 'N/A'} aa</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-results">No UniProt protein information found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceSearch;

