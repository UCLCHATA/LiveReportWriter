import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

interface PDFViewerProps {
  file: string;
  title: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, title }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="pdf-viewer">
      <div className="pdf-header">
        <h3>{title}</h3>
        <div className="pdf-controls">
          <button 
            onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
            disabled={pageNumber <= 1}
          >
            <i className="material-icons">navigate_before</i>
          </button>
          <span>Page {pageNumber} of {numPages}</span>
          <button 
            onClick={() => setPageNumber(prev => Math.min(numPages || prev, prev + 1))}
            disabled={pageNumber >= (numPages || 1)}
          >
            <i className="material-icons">navigate_next</i>
          </button>
          <button onClick={() => {}}>
            <i className="material-icons">zoom_in</i>
          </button>
          <button onClick={() => {}}>
            <i className="material-icons">zoom_out</i>
          </button>
        </div>
      </div>
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        className="pdf-document"
      >
        <Page 
          pageNumber={pageNumber}
          className="pdf-page"
          renderTextLayer={true}
          renderAnnotationLayer={true}
        />
      </Document>
    </div>
  );
};

const MilestoneTracker: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'chata' | 'ados'>('chata');

  return (
    <div className="milestone-tracker">
      <div className="report-tabs">
        <button 
          className={`tab ${activeReport === 'chata' ? 'active' : ''}`}
          onClick={() => setActiveReport('chata')}
        >
          CHATA Report R1
        </button>
        <button 
          className={`tab ${activeReport === 'ados' ? 'active' : ''}`}
          onClick={() => setActiveReport('ados')}
        >
          ADOS Report R2
        </button>
      </div>
      
      {activeReport === 'chata' ? (
        <PDFViewer 
          file="/assets/reports/chata-report.pdf"
          title="CHATA Diagnostic Report"
        />
      ) : (
        <PDFViewer 
          file="/assets/reports/ados-report.pdf"
          title="ADOS Diagnostic Report"
        />
      )}
    </div>
  );
};

export default MilestoneTracker; 