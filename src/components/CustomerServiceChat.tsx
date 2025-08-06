
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeadphonesIcon, Send, X, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CustomerServiceChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !message) {
      toast({
        title: "Required fields missing",
        description: "Please fill in your name, email, and message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create mailto link with the form data
      const subject = `Customer Service Request from ${name}`;
      const body = `
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}

---
Sent from Men In Action LLC website
      `;
      
      const mailtoLink = `mailto:opmeninactionllc@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open the user's email client
      window.location.href = mailtoLink;
      
      toast({
        title: "Email client opened",
        description: "Your default email client should open with your message ready to send.",
      });

      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      
    } catch (error) {
      console.error('Error opening email client:', error);
      toast({
        title: "Error",
        description: "Unable to open email client. Please contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 hover:bg-green-700 rounded-full p-4 shadow-lg"
        >
          <HeadphonesIcon className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="bg-gray-900 border-gray-700 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <HeadphonesIcon className="w-5 h-5 text-green-400" />
              Customer Service
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-300">
            Need help? We're here for you!
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Contact Information */}
          <div className="bg-gray-800 p-3 rounded-lg space-y-2">
            <h3 className="text-white font-semibold text-sm">Direct Contact</h3>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Phone className="w-4 h-4 text-green-400" />
              <span>559.997.6387</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Mail className="w-4 h-4 text-green-400" />
              <span>opmeninactionllc@gmail.com</span>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="text-white text-sm font-medium">Send us a message:</div>
            
            <Input
              placeholder="Your Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              required
            />
            
            <Input
              type="email"
              placeholder="Your Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              required
            />
            
            <Input
              type="tel"
              placeholder="Your Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
            
            <Textarea
              placeholder="How can we help you? *"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[80px]"
              required
            />
            
            <Button
              type="submit"
              disabled={isSubmitting || !name || !email || !message}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                "Opening Email..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
          
          <div className="text-xs text-gray-400 text-center">
            We typically respond within 24 hours
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerServiceChat;
