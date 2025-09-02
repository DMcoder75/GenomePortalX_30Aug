import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { X, Search, Loader2, Database, ExternalLink } from 'lucide-react'
import DetailedView from './DetailedView'

const GeneDatabasePanel = ({ database, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
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

  const handleViewDetails = (item) => {
    setSelectedItem(item)
    setShowDetailedView(true)
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
          {/* Search Interface */}
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

