import { Code, FileText, Globe, Plus, Upload } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';

export const AddResourceForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Add Resources</CardTitle>
        <CardDescription>Add new resources for the agent to access and learn from.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="contract" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="contract" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Smart Contract
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="document" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contract" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract-name">Contract Name</Label>
                  <Input
                    id="contract-name"
                    value={contractName}
                    onChange={e => setContractName(e.target.value)}
                    placeholder="My ERC20 Token"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract-network">Network</Label>
                  <select
                    id="contract-network"
                    value={contractNetwork}
                    onChange={e => setContractNetwork(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="ethereum">Ethereum</option>
                    <option value="polygon">Polygon</option>
                    <option value="arbitrum">Arbitrum</option>
                    <option value="optimism">Optimism</option>
                    <option value="base">Base</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract-address">Contract Address</Label>
                <Input
                  id="contract-address"
                  value={contractAddress}
                  onChange={e => setContractAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <Button
                onClick={handleAddContract}
                disabled={!contractAddress || !contractName}
                className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Contract
              </Button>
              <div className="text-xs text-muted-foreground mt-2">
                <p>
                  The contract ABI will be automatically fetched and parsed for the agent to learn
                  from.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-name">Link Name (Optional)</Label>
                <Input
                  id="link-name"
                  value={linkName}
                  onChange={e => setLinkName(e.target.value)}
                  placeholder="Documentation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={handleAddLink} disabled={!linkUrl} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Link
              </Button>
              <div className="text-xs text-muted-foreground mt-2">
                <p>
                  Links will be crawled using Firecrawl MCP to extract relevant context for the
                  agent.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="document" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-name">Document Name</Label>
                <Input
                  id="document-name"
                  value={documentName}
                  onChange={e => setDocumentName(e.target.value)}
                  placeholder="API Documentation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document-file">Upload File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="document-file"
                    type="file"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="document-content">Or Enter Content</Label>
                <Textarea
                  id="document-content"
                  value={documentContent}
                  onChange={e => setDocumentContent(e.target.value)}
                  placeholder="Enter document content..."
                  rows={5}
                />
              </div>
              <Button
                onClick={handleAddDocument}
                disabled={(!documentContent && !documentFile) || !documentName}
                className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
