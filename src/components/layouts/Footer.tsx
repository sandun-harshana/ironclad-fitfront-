import { Dumbbell, Link } from 'lucide-react'
import React from 'react'

export const Footer = () => {
  return (
    <div>
         <footer id="contact" className="bg-gym-darker border-t border-gym-gray py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Dumbbell className="h-6 w-6 text-gym-gold" />
                <span className="text-xl font-bold text-gym-gold">GymPro</span>
              </div>
              <p className="text-gray-400">Transform your fitness journey with our advanced gym management system.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-gym-gold transition-colors">Features</a></li>
                <li><a href="#testimonials" className="hover:text-gym-gold transition-colors">Reviews</a></li>
                <li><Link to="/schedule" className="hover:text-gym-gold transition-colors">Schedule</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-gym-gold transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-gym-gold transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-gym-gold transition-colors">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 info@gympro.com</li>
                <li>📞 (555) 123-4567</li>
                <li>📍 123 Fitness St, City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gym-gray mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GymPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
