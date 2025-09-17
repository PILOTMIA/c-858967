import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle, AlertCircle, Lock, Shield } from 'lucide-react';
import { toast } from "sonner";
import { useCOTData } from './COTDataContext';

interface COTDataUploadProps {
  onDataUploaded: (data: any) => void;
}

const COTDataUpload = ({ onDataUploaded }: COTDataUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const { setCOTData, setIsDataLoading, setLastUpdated } = useCOTData();

  const validatePassword = () => {
    // Simple password validation - in production, use environment variables or secure authentication
    const correctPassword = 'COT2025Admin'; // This should be stored securely
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      toast.success('Authentication successful! You can now upload COT data.');
    } else {
      toast.error('Invalid password. Please contact your administrator.');
      setPassword('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      toast.error('Please authenticate first before uploading files.');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsDataLoading(true);
    setFileName(file.name);
    
    try {
      let text: string;

      // Handle different file types including PDF
      if (file.type === 'application/pdf') {
        toast.error('PDF parsing not yet implemented. Please convert to CSV or JSON format.');
        return;
      } else {
        text = await file.text();
      }

      let data;

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Enhanced CSV parsing with better error handling
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          throw new Error('CSV file must contain headers and at least one data row.');
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const row: any = {};
          headers.forEach((header, index) => {
            if (values[index] !== undefined) {
              row[header] = values[index];
            }
          });
          return row;
        }).filter(row => Object.keys(row).some(key => row[key])); // Filter empty rows
      } else {
        throw new Error('Unsupported file format. Please upload CSV, JSON, or PDF files.');
      }

      // Validate data structure
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid data format. Expected an array of COT records.');
      }

      // Transform and validate COT data structure with enhanced validation
      const transformedData = data.map((record: any, index: number) => {
        try {
          return {
            currency: record.currency || record.Currency || 'EUR',
            commercialLong: parseInt(record.commercialLong || record.Commercial_Long || '0'),
            commercialShort: parseInt(record.commercialShort || record.Commercial_Short || '0'),
            nonCommercialLong: parseInt(record.nonCommercialLong || record.NonCommercial_Long || '0'),
            nonCommercialShort: parseInt(record.nonCommercialShort || record.NonCommercial_Short || '0'),
            reportDate: record.reportDate || record.Report_Date || new Date().toISOString().split('T')[0],
            weeklyChange: parseInt(record.weeklyChange || record.Weekly_Change || '0'),
          };
        } catch (recordError) {
          throw new Error(`Error processing record ${index + 1}: ${recordError instanceof Error ? recordError.message : 'Invalid data'}`);
        }
      });

      // Update global COT data context
      setCOTData(transformedData);
      setLastUpdated(new Date());
      
      // Also call the prop callback for backward compatibility
      onDataUploaded(transformedData);
      setUploadStatus('success');
      
      toast.success(`✅ Successfully processed ${transformedData.length} COT records. All charts and analysis have been updated!`);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setIsDataLoading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="bg-card border-border shadow-elegant">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2 font-display">
          {isAuthenticated ? '📤' : '🔐'} Weekly COT Data Upload
        </CardTitle>
        <CardDescription>
          {isAuthenticated 
            ? 'Upload weekly CFTC data in CSV, JSON, or PDF format. Data is published every Friday at 3:30 PM ET.'
            : 'Authentication required to upload COT data files.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Authentication Section */}
        {!isAuthenticated && (
          <div className="border-2 border-warning/30 rounded-lg p-6 bg-warning/5">
            <div className="flex items-center gap-4 mb-4">
              <Shield className="w-8 h-8 text-warning" />
              <div>
                <h3 className="font-bold text-foreground">Secure Access Required</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the upload password to access file upload functionality
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  ref={passwordInputRef}
                  type="password"
                  placeholder="Enter upload password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && validatePassword()}
                  className="bg-background/50 border-warning/30 focus:border-warning"
                />
              </div>
              <Button 
                onClick={validatePassword}
                disabled={!password.trim()}
                className="bg-warning hover:bg-warning/90 text-warning-foreground font-bold"
              >
                <Lock className="w-4 h-4 mr-2" />
                Authenticate
              </Button>
            </div>
          </div>
        )}

        {/* File Upload Section */}
        {isAuthenticated && (
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex flex-col items-center gap-4">
              <Upload className="w-12 h-12 text-primary animate-pulse" />
              
              <div className="space-y-2">
                <h3 className="font-bold text-foreground">Upload COT Data File</h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Supports CSV, JSON, and PDF formats from CFTC Financial Futures reports
                </p>
              </div>

              <Button 
                onClick={triggerFileUpload}
                disabled={isUploading}
                className="w-full max-w-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-bold text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    Processing & Updating All Charts...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Choose COT Data File
                  </>
                )}
              </Button>

              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <p className="text-xs text-muted-foreground mt-2">
                📊 Uploading will automatically update all charts, analysis, and visualizations across the entire site
              </p>
            </div>
          </div>
        )}

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

        <div className="bg-muted/20 rounded-lg p-4 space-y-3 border border-muted/30">
          <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
            📋 Expected Data Format
          </h4>
          <div className="text-xs text-muted-foreground space-y-2 font-medium">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <p><strong className="text-primary">CSV Headers:</strong></p>
                <p className="font-mono text-[11px] bg-background/30 p-2 rounded">currency, commercialLong, commercialShort, nonCommercialLong, nonCommercialShort, reportDate, weeklyChange</p>
              </div>
              <div className="space-y-1">
                <p><strong className="text-primary">JSON Format:</strong></p>
                <p className="font-mono text-[11px] bg-background/30 p-2 rounded">Array of objects with the same field names</p>
              </div>
            </div>
            <div className="pt-2 border-t border-muted/20">
              <p><strong className="text-success">Source:</strong> CFTC Financial Futures Legacy Report (Published Fridays 3:30 PM ET)</p>
              <p><strong className="text-primary">Official URL:</strong> <a href="https://www.cftc.gov/dea/futures/financial_lf.htm" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">CFTC Financial Futures</a></p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default COTDataUpload;