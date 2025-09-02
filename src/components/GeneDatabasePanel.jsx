import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { X, Search, Loader2, Database, ExternalLink, Dna } from 'lucide-react'
import DetailedView from './DetailedView'

const GeneDatabasePanel = ({ database, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sequence, setSequence] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [sequenceResults, setSequenceResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sequenceLoading, setSequenceLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sequenceError, setSequenceError] = useState(null)
  const [selectedDb, setSelectedDb] = useState('gene')
  const [species, setSpecies] = useState('homo_sapiens')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showDetailedView, setShowDetailedView] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    setError(null)
    setSearchResults(null)

    try {
      let response
      
      if (database === 'ncbi') {
        response = await fetch('/api/gene-db/ncbi/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: selectedDb,
            term: searchTerm,
            retmax: 10
          })
        })
      } else if (database === 'ensembl') {
        response = await fetch(`/api/gene-db/ensembl/search/${species}/${searchTerm}`)
      } else if (database === 'uniprot') {
        response = await fetch('/api/gene-db/uniprot/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchTerm,
            size: 10
          })
        })
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setSearchResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSequenceSearch = async () => {
    if (!sequence.trim()) {
      setSequenceError('Please enter a DNA sequence')
      return
    }

    setSequenceLoading(true)
    setSequenceError(null)
    setSequenceResults(null)

    try {
      const response = await fetch('/api/integrated/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sequence: sequence.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setSequenceResults(data)
      } else {
        setSequenceError(data.error || 'Search failed')
      }
    } catch (err) {
      setSequenceError('Network error: ' + err.message)
    } finally {
      setSequenceLoading(false)
    }
  }

  const formatEValue = (evalue) => {
    if (evalue === 0) return '0.0'
    if (evalue < 1e-100) return '< 1e-100'
    return evalue.toExponential(2)
  }

  const calculateIdentityPercentage = (identity, alignLen) => {
    if (!alignLen || alignLen === 0) return '0%'
    return ((identity / alignLen) * 100).toFixed(1) + '%'
  }

  const handleViewDetails = (item) => {
    setSelectedItem(item)
    setShowDetailedView(true)
  }

  const renderSequenceResults = () => {
    if (!sequenceResults) return null

    switch (database) {
      case 'ncbi':
        return renderNCBISequenceResults()
      case 'ensembl':
        return renderEnsemblSequenceResults()
      case 'uniprot':
        return renderUniProtSequenceResults()
      default:
        return null
    }
  }

  const renderNCBISequenceResults = () => {
    const blastData = sequenceResults.blast_data
    if (!blastData || !blastData.results || !blastData.results.hits) {
      return <p className="text-gray-500 text-center py-4">No BLAST results found</p>
    }

    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Found {blastData.results.total_hits} matches
        </p>
        {blastData.results.hits.map((hit, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{hit.title}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {hit.accession}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Length:</span>
                  <p>{hit.length} bp</p>
                </div>
                {hit.hsps && hit.hsps.length > 0 && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Score:</span>
                      <p>{hit.hsps[0].score}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">E-value:</span>
                      <p>{formatEValue(hit.hsps[0].evalue)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Identity:</span>
                      <p>{calculateIdentityPercentage(hit.hsps[0].identity, hit.hsps[0].align_len)}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderEnsemblSequenceResults = () => {
    const ensemblData = sequenceResults.ensembl_data
    if (!ensemblData || ensemblData.length === 0) {
      return <p className="text-gray-500 text-center py-4">No Ensembl annotations found</p>
    }

    return (
      <div className="space-y-4">
        {ensemblData.map((item, index) => (
          <Card key={index} className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {item.accession}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {item.ensembl_data ? (
                <p className="text-green-600 font-medium">Ensembl cross-reference data available</p>
              ) : (
                <p className="text-gray-500">No Ensembl cross-reference found</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderUniProtSequenceResults = () => {
    const uniprotData = sequenceResults.uniprot_data
    if (!uniprotData || uniprotData.length === 0) {
      return <p className="text-gray-500 text-center py-4">No UniProt protein information found</p>
    }

    return (
      <div className="space-y-4">
        {uniprotData.map((item, index) => (
          <Card key={index} className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {item.accession}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {item.uniprot_data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Protein:</span>
                    <p>{item.uniprot_data.protein_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Gene Names:</span>
                    <p>{item.uniprot_data.gene_names?.join(', ') || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Organism:</span>
                    <p>{item.uniprot_data.organism || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Length:</span>
                    <p>{item.uniprot_data.length || 'N/A'} aa</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No UniProt protein mapping found</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderNCBIResults = () => {
    if (!searchResults?.results?.result) return null

    const results = Object.values(searchResults.results.result).filter(item => item.uid)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Search Results ({searchResults.count} total)</h4>
          <Badge variant="outline">{selectedDb.toUpperCase()}</Badge>
        </div>
        {results.map((item) => (
          <Card key={item.uid} className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h5 className="font-medium text-sm">{item.title || item.name || `ID: ${item.uid}`}</h5>
                <Badge variant="secondary" className="text-xs">{item.uid}</Badge>
              </div>
              {item.summary && (
                <p className="text-sm text-gray-600 line-clamp-2">{item.summary}</p>
              )}
              {item.authors && (
                <p className="text-xs text-gray-500">Authors: {item.authors}</p>
              )}
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => handleViewDetails({ id: item.uid, name: item.title || item.name || `ID: ${item.uid}`, type: selectedDb })}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const renderEnsemblResults = () => {
    if (!searchResults || !Array.isArray(searchResults)) return null

    return (
      <div className="space-y-4">
        <h4 className="font-semibold">Ensembl Results ({searchResults.length})</h4>
        {searchResults.map((item, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h5 className="font-medium text-sm">{item.display_label || item.id}</h5>
                <Badge variant="secondary" className="text-xs">{item.type}</Badge>
              </div>
              {item.description && (
                <p className="text-sm text-gray-600">{item.description}</p>
              )}
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {item.location && <span>Location: {item.location}</span>}
                {item.biotype && <Badge variant="outline" className="text-xs">{item.biotype}</Badge>}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => handleViewDetails({ id: item.id, name: item.display_label || item.id, type: item.type || 'gene' })}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const renderUniProtResults = () => {
    if (!searchResults?.results) return null

    return (
      <div className="space-y-4">
        <h4 className="font-semibold">UniProt Results ({searchResults.results.length})</h4>
        {searchResults.results.map((item) => (
          <Card key={item.primaryAccession} className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h5 className="font-medium text-sm">{item.proteinDescription?.recommendedName?.fullName?.value || item.primaryAccession}</h5>
                <Badge variant="secondary" className="text-xs">{item.primaryAccession}</Badge>
              </div>
              {item.organism && (
                <p className="text-sm text-gray-600">Organism: {item.organism.scientificName}</p>
              )}
              {item.genes && item.genes[0] && (
                <p className="text-xs text-gray-500">Gene: {item.genes[0].geneName?.value}</p>
              )}
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">Length: {item.sequence?.length}</Badge>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => handleViewDetails({ 
                    id: item.primaryAccession, 
                    name: item.proteinDescription?.recommendedName?.fullName?.value || item.primaryAccession,
                    type: 'protein'
                  })}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Protein
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const getDatabaseConfig = () => {
    switch (database) {
      case 'ncbi':
        return {
          title: 'NCBI Database Search',
          description: 'Search across NCBI databases including GenBank, PubMed, and Gene database',
          color: 'bg-blue-500'
        }
      case 'ensembl':
        return {
          title: 'Ensembl Genome Browser',
          description: 'Search for genes and genomic features in Ensembl',
          color: 'bg-green-500'
        }
      case 'uniprot':
        return {
          title: 'UniProt Protein Database',
          description: 'Search for protein sequences and functional information',
          color: 'bg-purple-500'
        }
      default:
        return { title: 'Gene Database', description: '', color: 'bg-gray-500' }
    }
  }

  const config = getDatabaseConfig()

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${config.color} text-white`}>
                <Database className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{config.title}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Text Search</TabsTrigger>
              <TabsTrigger value="sequence">Sequence Search</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4">
              {/* Text Search Interface */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder={`Search ${database.toUpperCase()}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  
                  {database === 'ncbi' && (
                    <Select value={selectedDb} onValueChange={setSelectedDb}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gene">Gene</SelectItem>
                        <SelectItem value="pubmed">PubMed</SelectItem>
                        <SelectItem value="nuccore">GenBank</SelectItem>
                        <SelectItem value="snp">dbSNP</SelectItem>
                        <SelectItem value="clinvar">ClinVar</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {database === 'ensembl' && (
                    <Select value={species} onValueChange={setSpecies}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homo_sapiens">Human</SelectItem>
                        <SelectItem value="mus_musculus">Mouse</SelectItem>
                        <SelectItem value="rattus_norvegicus">Rat</SelectItem>
                        <SelectItem value="danio_rerio">Zebrafish</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Results */}
              {searchResults && (
                <div className="border-t pt-6">
                  {database === 'ncbi' && renderNCBIResults()}
                  {database === 'ensembl' && renderEnsemblResults()}
                  {database === 'uniprot' && renderUniProtResults()}
                </div>
              )}

              {/* No Results */}
              {searchResults && (
                (database === 'ncbi' && (!searchResults.results?.result || Object.keys(searchResults.results.result).length <= 1)) ||
                (database === 'ensembl' && (!searchResults || searchResults.length === 0)) ||
                (database === 'uniprot' && (!searchResults.results || searchResults.results.length === 0))
              ) && (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No results found for "{searchTerm}"</p>
                  <p className="text-sm">Try a different search term or database</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sequence" className="space-y-4">
              {/* Sequence Search Interface */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">DNA Sequence</label>
                  <Textarea
                    placeholder="Enter your DNA sequence here (e.g., ATCGATCGATCG...)"
                    value={sequence}
                    onChange={(e) => setSequence(e.target.value)}
                    className="font-mono text-sm min-h-[120px]"
                    disabled={sequenceLoading}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <Button
                    onClick={handleSequenceSearch}
                    disabled={sequenceLoading || !sequence.trim()}
                    className="flex items-center space-x-2"
                  >
                    {sequenceLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Dna className="h-4 w-4" />
                    )}
                    <span>{sequenceLoading ? 'Searching...' : 'Search Sequence'}</span>
                  </Button>
                  
                  {sequence.trim() && (
                    <span className="text-sm text-gray-500">
                      {sequence.trim().length} nucleotides
                    </span>
                  )}
                </div>

                {sequenceError && (
                  <Alert variant="destructive">
                    <AlertDescription>{sequenceError}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Sequence Results */}
              {sequenceResults && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Sequence Search Results</h4>
                  {renderSequenceResults()}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <DetailedView
        isOpen={showDetailedView}
        onClose={() => setShowDetailedView(false)}
        item={selectedItem}
        database={database}
      />
    </>
  )
}

export default GeneDatabasePanel

