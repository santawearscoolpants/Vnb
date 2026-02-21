import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import api from '../services/api';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.submitContact(formData);
      toast.success('Thank you for your message. We will get back to you soon!');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      {/* Header */}
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="mb-4">Contact Us</h1>
            <p className="text-white/80">
              We'd love to hear from you. Get in touch with our team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h2 className="mb-6 text-black">Get In Touch</h2>
                <p className="text-zinc-600">
                  Whether you have a question about our products, need assistance with an order, 
                  or just want to learn more about VNB, our team is here to help.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-black">Visit Us</h3>
                    <p className="text-zinc-600">
                      123 Luxury Avenue<br />
                      Accra, Ghana
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-black">Call Us</h3>
                    <p className="text-zinc-600">
                      +233 (0) 123 456 789<br />
                      Mon - Sat, 9AM - 6PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-black">Email Us</h3>
                    <p className="text-zinc-600">
                      info@vinesandbranches.com<br />
                      support@vinesandbranches.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="rounded-sm bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-black">Business Hours</h3>
                <div className="space-y-2 text-sm text-zinc-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-sm bg-white p-8 shadow-sm"
            >
              <h3 className="mb-6 text-black">Send Us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm text-zinc-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-sm border border-zinc-300 px-4 py-3 text-black outline-none transition-colors focus:border-black"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm text-zinc-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-sm border border-zinc-300 px-4 py-3 text-black outline-none transition-colors focus:border-black"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm text-zinc-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-zinc-300 px-4 py-3 text-black outline-none transition-colors focus:border-black"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm text-zinc-700">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-sm border border-zinc-300 px-4 py-3 text-black outline-none transition-colors focus:border-black"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm text-zinc-700">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full rounded-sm border border-zinc-300 px-4 py-3 text-black outline-none transition-colors focus:border-black"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-zinc-800"
                  size="lg"
                  disabled={loading}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
