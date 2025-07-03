export const getDocumentType = (fileName: string): 'pdf' | 'docx' | 'csv' | 'txt' => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'docx':
      return 'docx';
    case 'csv':
      return 'csv';
    case 'txt':
      return 'txt';
    default:
      return 'pdf'; // fallback
  }
};
