
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, MessageSquare, Printer, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface GuideOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: Array<{
    id: number;
    title: string;
    description: string;
    completed: boolean;
  }>;
}

const GuideOptionsModal = ({ isOpen, onClose, steps }: GuideOptionsModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showSMSForm, setShowSMSForm] = useState(false);
  const [agreedToSMS, setAgreedToSMS] = useState(false);
  const { toast } = useToast();

  // Array of your uploaded images
  const inspirationalImages = [
    '/lovable-uploads/e3df1023-6a28-4047-8906-e62bfb5507fb.png', // Brain quote
    '/lovable-uploads/5bc94caa-f560-4327-bf18-b77e43cb304c.png', // Precise mastery
    '/lovable-uploads/e620df11-aaed-4bfb-be0f-78b8a50f5d29.png', // Mechanics/Mindset
    '/lovable-uploads/e93dbc25-59d9-43ef-abae-36f677a02d59.png', // Trading flowchart
    '/lovable-uploads/efdd5343-f05c-42ba-94b4-07b19cbed214.png'  // Simple flowchart
  ];

  const addImageToPDF = async (doc: jsPDF, imagePath: string) => {
    try {
      // Create a new image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Calculate dimensions to fit nicely on the page
          const pageWidth = doc.internal.pageSize.width;
          const pageHeight = doc.internal.pageSize.height;
          const maxWidth = pageWidth - 40; // 20px margin on each side
          const maxHeight = 80; // Maximum height for the image
          
          let imgWidth = maxWidth;
          let imgHeight = (img.height * maxWidth) / img.width;
          
          // If height is too large, scale by height instead
          if (imgHeight > maxHeight) {
            imgHeight = maxHeight;
            imgWidth = (img.width * maxHeight) / img.height;
          }
          
          // Center the image horizontally
          const xPosition = (pageWidth - imgWidth) / 2;
          const yPosition = 30; // Position near the top
          
          // Create canvas to convert image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          doc.addImage(imgData, 'JPEG', xPosition, yPosition, imgWidth, imgHeight);
          resolve(true);
        };
        
        img.onerror = () => {
          console.log('Image failed to load, continuing without image');
          resolve(false);
        };
        
        img.src = imagePath;
      });
    } catch (error) {
      console.log('Error adding image to PDF:', error);
      return false;
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;

    // Randomly select an image
    const randomIndex = Math.floor(Math.random() * inspirationalImages.length);
    const selectedImage = inspirationalImages[randomIndex];
    
    // Add the random inspirational image
    await addImageToPDF(doc, selectedImage);
    yPosition = 120; // Start content after the image

    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('FOREX TRADING LEARNING PATH', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(14);
    doc.text('Men In Action LLC - Trading Education Guide', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Progress
    const completedSteps = steps.filter(step => step.completed).length;
    const progressPercentage = Math.round((completedSteps / steps.length) * 100);
    doc.setFontSize(12);
    doc.text(`Your Learning Journey Progress: ${progressPercentage}%`, margin, yPosition);
    yPosition += 15;

    // Learning Steps
    doc.setFontSize(14);
    doc.text('LEARNING STEPS:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    steps.forEach((step) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
      }
      
      const statusSymbol = step.completed ? '✓' : '○';
      doc.text(`${statusSymbol} ${step.title}`, margin, yPosition);
      yPosition += 8;
      
      const descriptionLines = doc.splitTextToSize(`   ${step.description}`, pageWidth - 2 * margin);
      descriptionLines.forEach((line: string) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    });

    // Next Steps
    if (yPosition > 200) {
      doc.addPage();
      yPosition = margin;
    }
    
    yPosition += 10;
    doc.setFontSize(14);
    doc.text('NEXT STEPS:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    const nextSteps = [
      '1. Complete each learning module in order',
      '2. Practice with demo accounts before live trading',
      '3. Join our community for ongoing support',
      '4. Contact us for personalized guidance'
    ];

    nextSteps.forEach(step => {
      doc.text(step, margin, yPosition);
      yPosition += 8;
    });

    // Contact Information
    yPosition += 15;
    doc.setFontSize(12);
    doc.text('Contact Information:', margin, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.text('Phone: 559.997.6387', margin, yPosition);
    yPosition += 8;
    doc.text('Email: opmeninactionllc@gmail.com', margin, yPosition);
    yPosition += 15;

    doc.text('© 2024 Men In Action LLC', margin, yPosition);
    doc.text('Professional Trading Education & Analysis', margin, yPosition + 8);

    return doc;
  };

  const handleDownloadPDF = async () => {
    const doc = await generatePDF();
    doc.save('Forex-Learning-Path-Guide.pdf');
    toast({
      title: "PDF Downloaded!",
      description: "Your learning path guide has been downloaded successfully.",
    });
    onClose();
  };

  const handlePrintPDF = async () => {
    const doc = await generatePDF();
    doc.autoPrint();
    const pdfBlob = doc.output('bloburl');
    window.open(pdfBlob);
    toast({
      title: "PDF Ready to Print!",
      description: "A new window has opened with your PDF ready for printing.",
    });
    onClose();
  };

  const handleSendSMS = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number to receive the guide via SMS.",
        variant: "destructive"
      });
      return;
    }

    if (!agreedToSMS) {
      toast({
        title: "Agreement Required",
        description: "Please agree to receive SMS messages before proceeding.",
        variant: "destructive"
      });
      return;
    }

    // Create the PDF and convert to base64 for SMS
    const doc = await generatePDF();
    const pdfData = doc.output('datauristring');
    
    // Create SMS message with link to guide
    const message = `Your Forex Learning Guide from Men In Action LLC is ready! Download: ${window.location.origin}/guide-download Contact us: 559.997.6387`;
    
    // Open SMS app with pre-filled message
    const smsUrl = `sms:559.997.6387?body=${encodeURIComponent(`Please send learning guide to ${phoneNumber}. Message: ${message}`)}`;
    window.open(smsUrl);

    toast({
      title: "SMS Request Sent!",
      description: "We'll send your learning guide to your phone shortly. Standard rates apply.",
    });
    
    setShowSMSForm(false);
    setPhoneNumber("");
    setAgreedToSMS(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Get Your Learning Guide
          </DialogTitle>
        </DialogHeader>

        {!showSMSForm ? (
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              Choose how you'd like to access your personalized learning guide:
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleDownloadPDF}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              
              <Button 
                onClick={handlePrintPDF}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 justify-start"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print PDF
              </Button>
              
              <Button 
                onClick={() => setShowSMSForm(true)}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 justify-start"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send via SMS
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-yellow-300 font-semibold mb-1">SMS Rates Apply</p>
                  <p className="text-yellow-200">Standard messaging rates may apply. By proceeding, you agree to receive SMS messages from Men In Action LLC.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="sms-agreement"
                  checked={agreedToSMS}
                  onChange={(e) => setAgreedToSMS(e.target.checked)}
                  className="mt-1"
                />
                <Label htmlFor="sms-agreement" className="text-sm text-gray-300">
                  I agree to receive SMS messages and understand that standard rates may apply.
                </Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSendSMS}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Send SMS
              </Button>
              <Button 
                onClick={() => setShowSMSForm(false)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GuideOptionsModal;
