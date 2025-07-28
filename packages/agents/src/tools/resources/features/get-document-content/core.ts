import { ToolFn, ToolOutputValue } from '../../../../utils/tools';
import { getResourceContext } from '../get-resource-details/core';

// Format file size nicely
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

// Add content information and capabilities based on document type
const getDocumentCapabilities = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return `**PDF Document**
This is a PDF document that may contain:
- Text content, images, and formatting
- Multiple pages with structured content
- Tables, charts, and diagrams

**Note**: Direct text extraction is not currently available through this tool. The document would need to be processed by a PDF parsing service to extract readable content.`;

    case 'docx':
      return `**Microsoft Word Document**
This is a Word document that may contain:
- Rich text with formatting (bold, italic, headers)
- Images, tables, and embedded objects  
- Comments and tracked changes
- Multiple sections and styles

**Note**: Direct content extraction is not currently available through this tool. The document would need to be processed by a document parsing service to extract readable content.`;

    case 'csv':
      return `**CSV (Comma-Separated Values) File**
This is a structured data file that contains:
- Tabular data with rows and columns
- Headers defining data fields
- Numeric and text data that can be analyzed

**Note**: Direct data parsing is not currently available through this tool. The CSV would need to be processed by a data parsing service to extract and analyze the contents.`;

    case 'txt':
      return `**Plain Text File**
This is a plain text document containing:
- Unformatted text content
- Simple structure without rich formatting
- Readable content that can be easily processed

**Note**: Direct content reading is not currently available through this tool. The text file would need to be processed by a file reading service to extract the content.`;

    case 'json':
      return `**JSON (JavaScript Object Notation) File**
This is a structured data file containing:
- Hierarchical data in key-value pairs
- Arrays and nested objects
- Configuration or data export information

**Note**: Direct JSON parsing is not currently available through this tool. The file would need to be processed by a JSON parser to extract and analyze the structure.`;

    case 'xml':
      return `**XML (eXtensible Markup Language) File**
This is a structured markup document containing:
- Hierarchical data with tags and attributes
- Structured information that can be parsed
- Configuration or data exchange format

**Note**: Direct XML parsing is not currently available through this tool. The file would need to be processed by an XML parser to extract the content.`;

    default:
      return `**${type.toUpperCase()} Document**
This is a ${type} document. The specific content and structure depend on the file format.

**Note**: Direct content extraction is not currently available through this tool. The document would need to be processed by an appropriate parsing service to extract readable content.`;
  }
};

export const getDocumentContentToolFn: ToolFn =
  () =>
  async ({ resourceId }: { resourceId: string }): Promise<ToolOutputValue[]> => {
    const resources = getResourceContext();

    if (resources.length === 0) {
      return [
        {
          type: 'text',
          content:
            'No resources are currently available. Please ensure resources are properly attached to this agent.',
        },
      ];
    }

    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
      const availableIds = resources.map(r => `${r.name} (${r.id})`).join(', ');
      return [
        {
          type: 'text',
          content: `Resource with ID "${resourceId}" not found. Available resources: ${availableIds}`,
        },
      ];
    }

    if (resource.type !== 'document') {
      return [
        {
          type: 'text',
          content: `Resource "${resource.name}" is not a document resource (type: ${resource.type}). Use the appropriate tool for this resource type.`,
        },
      ];
    }

    const documentValue = resource.value;
    const documentName = documentValue.documentName;
    const documentType = documentValue.documentType;
    const documentSize = documentValue.documentSize;
    const documentUrl = documentValue.documentUrl;

    if (!documentName) {
      return [
        {
          type: 'text',
          content: `Document resource "${resource.name}" does not have a valid document name.`,
        },
      ];
    }

    let response = `**Document: ${resource.name}**\n- File Name: ${documentName}\n- Type: ${documentType.toUpperCase()}\n`;

    if (documentSize) {
      response += `- Size: ${formatFileSize(documentSize)}\n`;
    }

    if (documentUrl) {
      response += `- URL: ${documentUrl}\n`;
    }

    response += '\n';

    response += getDocumentCapabilities(documentType);

    // Add suggestions for next steps
    response += `\n\n**Suggestions:**
- If you need the actual content, consider uploading the document to a document processing service
- For structured data files (CSV, JSON), consider using appropriate data analysis tools
- For text-based content, you might want to copy and paste relevant sections as text resources instead`;

    return [
      {
        type: 'text',
        content: response,
      },
    ];
  };
