import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Database, Search, Activity, BarChart3, Dna } from 'lucide-react'
import heroImage from './assets/hero_image--aZn_6m-.png'
import heatmapImage from './assets/heatmap-BC9boYhD.png'
import pathwayImage from './assets/pathway_map-B_8VAfjx.png'
import GeneDatabasePanel from './components/GeneDatabasePanel'
import './App.css'

function App() {
  const [selectedDatabase, setSelectedDatabase] = useState(null)
  const [databaseStatus, setDatabaseStatus] = useState({})

  // Check database status on component mount
  useState(() => {
    fetch('/api/gene-db/status')
      .then(res => res.json())
      .then(data => setDatabaseStatus(data))
      .catch(err => console.error('Failed to fetch database status:', err))
  }, [])

  const databases = [
    {
      id: 'ncbi',
      name: 'NCBI',
      description: 'National Center for Biotechnology Information',
      icon: Database,
      color: 'bg-blue-500',
      features: ['GenBank', 'PubMed', 'Gene Database', 'dbSNP', 'ClinVar']
    },
    {
      id: 'ensembl',
      name: 'Ensembl',
      description: 'Genome browser and annotation database',
      icon: Dna,
      color: 'bg-green-500',
      features: ['Gene Trees', 'Homology', 'Cross References', 'Comparative Genomics']
    },
    {
      id: 'uniprot',
      name: 'UniProt',
      description: 'Protein sequence and functional information',
      icon: Activity,
      color: 'bg-purple-500',
      features: ['Protein Sequences', 'Functional Annotation', 'Structural Data']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Dna className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">GenomePortalX</h1>
            </div>
            <Badge variant="secondary" className="text-sm">
              Enhanced with Gene Databases
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Unlock the Secrets of Your Genes
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Access comprehensive genomic data from multiple databases including NCBI, Ensembl, and UniProt. 
                Explore gene sequences, protein functions, and clinical variants all in one place.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Badge className="bg-blue-100 text-blue-800">Gene Analysis</Badge>
                <Badge className="bg-green-100 text-green-800">Protein Research</Badge>
                <Badge className="bg-purple-100 text-purple-800">Clinical Variants</Badge>
                <Badge className="bg-orange-100 text-orange-800">Comparative Genomics</Badge>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Genomic Analysis Visualization" 
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gene Database Selection */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Gene Database
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Select from our integrated gene databases to access comprehensive genomic information. 
              Each database offers unique insights into genetic data and biological functions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {databases.map((db) => {
              const Icon = db.icon
              const status = databaseStatus[db.id]
              const isOnline = status?.status === 'online'
              
              return (
                <Card 
                  key={db.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedDatabase === db.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                  onClick={() => setSelectedDatabase(db.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${db.color} text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge 
                        variant={isOnline ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {isOnline ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{db.name}</CardTitle>
                    <CardDescription>{db.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {db.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Database Panel */}
          {selectedDatabase && (
            <GeneDatabasePanel 
              database={selectedDatabase} 
              onClose={() => setSelectedDatabase(null)}
            />
          )}
        </div>
      </section>

      {/* Visualization Examples */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Advanced Genomic Visualizations
            </h3>
            <p className="text-lg text-gray-600">
              Explore complex genetic data through interactive charts and pathway maps
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Expression Heatmap</span>
                </CardTitle>
                <CardDescription>
                  Gene expression patterns across different conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <img 
                  src={heatmapImage} 
                  alt="Gene Expression Heatmap" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Pathway Analysis</span>
                </CardTitle>
                <CardDescription>
                  Biological pathway interactions and gene networks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <img 
                  src={pathwayImage} 
                  alt="Pathway Map" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 GenomePortalX. Powered by NCBI, Ensembl, and UniProt databases.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

