import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from "sonner";

interface COTDataUploadProps {
  onDataUploaded: (data: any) => void;
}

const COTDataUpload = ({ onDataUploaded }: COTDataUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);
    
    try {
      const text = await file.text();
      let data;

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parsing - in production, use a proper CSV parser
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        data = lines.slice(1).map(line => {
          const values = line.split(',');
          const row: any = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim();
          });
          return row;
        }).filter(row => Object.keys(row).some(key => row[key])); // Filter empty rows
      } else {
        throw new Error('Unsupported file format. Please upload CSV or JSON files.');
      }

      // Validate data structure
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid data format. Expected an array of COT records.');
      }

      // Transform and validate COT data structure
      const transformedData = data.map((record: any) => ({
        currency: record.currency || record.Currency || 'EUR',
        commercialLong: parseInt(record.commercialLong || record.Commercial_Long || '0'),
        commercialShort: parseInt(record.commercialShort || record.Commercial_Short || '0'),
        nonCommercialLong: parseInt(record.nonCommercialLong || record.NonCommercial_Long || '0'),
        nonCommercialShort: parseInt(record.nonCommercialShort || record.NonCommercial_Short || '0'),
        reportDate: record.reportDate || record.Report_Date || new Date().toISOString().split('T')[0],
        weeklyChange: parseInt(record.weeklyChange || record.Weekly_Change || '0'),
      }));

      onDataUploaded(transformedData);
      setUploadStatus('success');
      toast.success(`Successfully uploaded ${transformedData.length} COT records from ${file.name}`);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          📤 Weekly COT Data Upload
        </CardTitle>
        <CardDescription>
          Upload weekly CFTC data in CSV or JSON format. Data is published every Friday at 3:30 PM ET.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <Upload className="w-12 h-12 text-muted-foreground" />
            
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Upload COT Data File</h3>
              <p className="text-sm text-muted-foreground">
                Supports CSV and JSON formats from CFTC Financial Futures reports
              </p>
            </div>

            <Button 
              onClick={triggerFileUpload}
              disabled={isUploading}
              variant="outline"
              className="w-full max-w-xs"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Choose File
                </>
              )}
            </Button>

            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {uploadStatus !== 'idle' && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            uploadStatus === 'success' 
              ? 'bg-success/10 text-success border border-success/20' 
              : 'bg-destructive/10 text-destructive border border-destructive/20'
          }`}>
            {uploadStatus === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <div className="flex-1">
              <p className="font-medium">
                {uploadStatus === 'success' ? 'Upload Successful' : 'Upload Failed'}
              </p>
              {fileName && (
                <p className="text-sm opacity-80">File: {fileName}</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-foreground text-sm">Expected Data Format:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• <strong>CSV:</strong> currency, commercialLong, commercialShort, nonCommercialLong, nonCommercialShort, reportDate, weeklyChange</p>
            <p>• <strong>JSON:</strong> Array of objects with the same fields</p>
            <p>• <strong>Source:</strong> CFTC Financial Futures Legacy Report (Published Fridays 3:30 PM ET)</p>
            <p>• <strong>URL:</strong> <a href="https://www.cftc.gov/dea/futures/financial_lf.htm" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CFTC Financial Futures</a></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default COTDataUpload;